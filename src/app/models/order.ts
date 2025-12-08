import { OrderItem } from "./order-item";
import { User } from "./user";

    export class Order {
        constructor(
            public id: number | null = null,
            public createdAt: Date,
            public updatedAt: Date,
            public state: OrderState,
            public total: number,
            public user:User,
            public items?: OrderItem[],
            
        ) {}
    }

export enum OrderState {
    CREATED = 'CREATED',
    CONFIRMED = 'CONFIRMED',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
}
