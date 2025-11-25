import { Product } from "./product";
import { User } from "./user";

export class Category {
      constructor(
        public id_category: number,
        public nom: string,
        public description: string,
        public parentCategory?: Category,
        public childCategories?: Category[],
        public user?: User,
        public products?: Product[]
    ) {}
}
