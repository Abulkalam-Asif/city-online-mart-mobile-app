import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { arrayRemove, arrayUnion, doc, updateDoc, setDoc } from "@react-native-firebase/firestore";
import { db } from "../../firebaseConfig";
import { authService, productService } from "../services";
import { queryKeys } from "../lib/react-query";
import { useAuth } from "../contexts/AuthContext";
import { AuthUser } from "../types/auth.types";
import { Product } from "../types";

export const useFavourites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const favourites = user?.favouriteProductIds || [];

  const toggleFavourite = useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.uid) throw new Error("Must be logged in to manage favourites");

      const userRef = doc(db, "USERS", user.uid);
      const isFavourite = favourites.includes(productId);

      if (isFavourite) {
        await setDoc(userRef, {
          favouriteProductIds: arrayRemove(productId),
        }, { merge: true });
        const updatedFavourites = favourites.filter(id => id !== productId);
        await authService.setStoredUser({ ...user, favouriteProductIds: updatedFavourites });
        return { productId, action: "removed" as const };
      } else {
        await setDoc(userRef, {
          favouriteProductIds: arrayUnion(productId),
        }, { merge: true });
        const updatedFavourites = [...favourites, productId];
        await authService.setStoredUser({ ...user, favouriteProductIds: updatedFavourites });
        return { productId, action: "added" as const };
      }
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.user.profile() });
      const previousUser = queryClient.getQueryData<AuthUser>(queryKeys.user.profile());

      if (previousUser) {
        const isFavourite = previousUser.favouriteProductIds?.includes(productId);
        let newFavourites = previousUser.favouriteProductIds || [];

        if (isFavourite) {
          newFavourites = newFavourites.filter((id) => id !== productId);
        } else {
          newFavourites = [...newFavourites, productId];
        }

        queryClient.setQueryData<AuthUser>(queryKeys.user.profile(), {
          ...previousUser,
          favouriteProductIds: newFavourites,
        });
      }
      return { previousUser };
    },
    onError: (err, newTodo, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user.profile(), context.previousUser);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });

  return {
    favourites,
    toggleFavourite,
    isFavourite: (productId: string) => favourites.includes(productId),
  };
};

export const useFavouriteProducts = () => {
  const { favourites } = useFavourites();

  return useQuery<Product[]>({
    queryKey: ["favouriteProducts", favourites],
    queryFn: async () => {
      if (!favourites || favourites.length === 0) return [];
      return await productService.getProductsByIds(favourites);
    },
    enabled: true,
  });
};
