export class Offre {


      constructor(
        public id: number,
        public titre: string,
        public description: string,
        public prix : number,
        public imageUrl?: string
    ) {}
}
