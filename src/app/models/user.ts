import { Adresse } from "./adresse";
import { Category } from "./category";
import { Product } from "./product";

export class User {

      constructor(
        public id_user: number,
        public mail: string,
        public password: string,
        public role: string,
        public nom: string,
        public prenom: string,
        public telephone: number,
        public adresse: Adresse,
        public categories?: Category[],
        public products?: Product[]
    ) {}
}
