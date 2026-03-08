import { Category } from "./category";
import { productoption } from "./product-option";
import { User } from "./user";

export class Product {

    constructor(
        public code: number,
        public titre: string,
        public description: string,
        public lieuDeProduction: string,
        public stock: number,
        public image: string,
        public complementaryInfos?: { [key: string]: string },
        public options?: productoption[],
        public category?: Category,
        public user?: User,
        public prix?: number,

    ) {}
}
