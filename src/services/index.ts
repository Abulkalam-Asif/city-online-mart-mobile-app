import { auth, db, functions, storage } from "../../firebaseConfig";
import { AuthService } from "./AuthService";
import { CartService } from "./CartService";
import { DiscountService } from "./DiscountService";
import { PaymentMethodService } from "./PaymentMethodService";
import { SettingsService } from "./SettingsService";
import { OrderService } from "./OrderService";
import { ProductService } from "./ProductService";

// Initialize services with dependencies (DI pattern)
const authService = new AuthService(auth, db, functions);
const settingsService = new SettingsService(db);
const cartService = new CartService();
const discountService = new DiscountService(db);
const paymentMethodService = new PaymentMethodService(db);
const orderService = new OrderService(db, storage);
const productService = new ProductService(db);

// Wire circular dependency (matches admin-side pattern)
orderService.discountService = discountService;

// Export service instances
export { productService, authService, settingsService, cartService, discountService, paymentMethodService, orderService };

/**
 * Note: Existing services (cartService, productService, etc.) are currently 
 * exported as plain objects and don't use the DI pattern yet.
 * They can be imported directly from their respective files for now.
 * In the future, we will refactor them into classes and add them here.
 */
