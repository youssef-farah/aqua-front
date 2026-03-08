import { Order } from "./order";
import { Product } from "./product";

export class OrderItem {


       constructor(
        public id: number | null = null,
        public order: Order,
        public product: Product,
        public quantity: number,
        public unitPrice: number,
        public subTotal: number,
       public productoption:string
    ) {}
}
