import { OrderItem } from "./order-item";

export class Order {
     constructor(
        public id: number | null = null,
        public createdAt: Date,
        public updatedAt: Date,
        public state: OrderState,
        public total: number,
        public items?: OrderItem[]
    ) {}
}

export enum OrderState {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}
