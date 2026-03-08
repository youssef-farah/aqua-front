import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  productoption?: string; // ADD THIS

}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: CartItem[] = [];
  private cartSource = new BehaviorSubject<CartItem[]>(this.cart);
  cart$ = this.cartSource.asObservable();

addToCart(product: any, quantity: number) {
  const optionName = product.selectedOption?.optionName ?? undefined;

  const existing = this.cart.find(
    item => item.id === product.code && item.productoption === optionName
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    this.cart.push({
      id: product.code,
      name: product.titre,
      price: product.prix,
      quantity: quantity,
      productoption: optionName // ADD THIS
    });
  }

  this.cartSource.next([...this.cart]);
}

  getCart() {
    return this.cart;
  }

  removeItem(id: number) {
    this.cart = this.cart.filter(item => item.id !== id);
    this.cartSource.next([...this.cart]);
  }

  /**
   * NEW: Clear entire cart (use after successful payment)
   */
  clearCart() {
    this.cart = [];
    this.cartSource.next([...this.cart]);
  }
}