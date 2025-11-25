import { Category } from "./category";
import { User } from "./user";

export class Product {

    constructor(
        public code: number,
        public titre: string,
        public description: string,
        public lieuDeProduction: string,
        public stock: number,
        public prix: number,
        public image: string,
        public complementaryInfos?: Map<string, string>,
        public options?: string[],
        public category?: Category,
        public user?: User
    ) {}
}
