import React from "react";
import ProductContent from "../components/product-details/ProductContent";
import { tempProductDetails } from "@/temp/home/product-details/tempProductDetails";

export default function ProductDetailsScreen() {
  // const { id } = useLocalSearchParams<{ id: string }>();

  // const { data: product, isLoading } = useProduct(Number(id));
  const product = tempProductDetails;

  return (
    <ProductContent
      product={product}
      // isLoading={isLoading}
      isLoading={false}
    />
  );
}
