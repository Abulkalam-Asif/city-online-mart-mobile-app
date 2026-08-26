import { getCityDb, getCityAuth, getCityStorage, getCityFunctions } from "../lib/cityFirebase";
import { AuthService } from "./AuthService";
import { CartService } from "./CartService";
import { DiscountService } from "./DiscountService";
import { PaymentMethodService } from "./PaymentMethodService";
import { SettingsService } from "./SettingsService";
import { DeliverySlotService } from "./DeliverySlotService";
import { OrderService } from "./OrderService";
import { ProductService } from "./ProductService";

function createServices() {
  const db = getCityDb();
  const auth = getCityAuth();
  const storage = getCityStorage();
  const functions = getCityFunctions();

  const authService = new AuthService(auth, db, functions);
  const settingsService = new SettingsService(db);
  const discountService = new DiscountService(db);
  const paymentMethodService = new PaymentMethodService(db);
  const orderService = new OrderService(db, storage);
  const productService = new ProductService(db);
  const deliverySlotService = new DeliverySlotService(db);

  orderService.discountService = discountService;

  return {
    authService, settingsService, discountService, paymentMethodService, orderService, productService, deliverySlotService
  };
}

function createProxy<T extends keyof ReturnType<typeof createServices>>(serviceName: T) {
  return new Proxy({} as ReturnType<typeof createServices>[T], {
    get: (_, prop) => {
      return (createServices()[serviceName] as any)[prop];
    }
  });
}

// CartService does not require Firebase (it uses AsyncStorage), so we export it statically.
// This prevents crashes when CartContext tries to load the cart before a city is selected.
export const cartService = new CartService();

export const authService = createProxy("authService");
export const settingsService = createProxy("settingsService");
export const discountService = createProxy("discountService");
export const paymentMethodService = createProxy("paymentMethodService");
export const orderService = createProxy("orderService");
export const productService = createProxy("productService");
export const deliverySlotService = createProxy("deliverySlotService");
