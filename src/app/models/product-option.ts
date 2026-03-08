export class productoption {
  id?: number;   // IMPORTANT optional
  optionName!: string;
  optionPrice?: number;

  constructor(optionName: string, optionPrice?: number, id?: number) {
    this.id = id;
    this.optionName = optionName;
    this.optionPrice = optionPrice;
  }
}