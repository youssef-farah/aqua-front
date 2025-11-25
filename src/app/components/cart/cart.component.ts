import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CartItem, CartService } from '../../services/cart.service';
import { OrderServiceService } from '../../services/order-service.service';
import { OrderItemServiceService } from '../../services/order-item-service.service';
import { Order, OrderState } from '../../models/order';
import { OrderItem } from '../../models/order-item';
import { ProductServiceService } from '../../services/product-service.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: CartItem[] = [];
  isCheckingOut: boolean = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderServiceService,
    private orderItemService: OrderItemServiceService,
    private pr: ProductServiceService,
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cart = items;
    });
  }

  removeItem(id: number): void {
    this.cartService.removeItem(id);
  }

  getTotalPrice(): number {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  removeFromCart(productId: number): void {
    this.cartService.removeItem(productId);
  }

  onCheckout(): void {
    if (this.cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    this.isCheckingOut = true;

    // Step 1: Create the Order
    const order = new Order(
      null,
      new Date(),
      new Date(),
      OrderState.CREATED,
      this.getTotalPrice()
    );

    this.orderService.create(order).subscribe({
      next: (createdOrder: Order) => {
        // Step 2: Create OrderItems for each CartItem and first resolve the Product observable
                const orderItemCreates$ = this.cart.map(cartItem =>
                  this.pr.getProductByCode(cartItem.id).pipe(
                    mergeMap(product => {
                      const orderItem = new OrderItem(
                        null,
                        createdOrder,
                        product,
                        cartItem.quantity,
                        cartItem.price,
                        cartItem.price * cartItem.quantity
                      );
                      return this.orderItemService.create(orderItem);
                    })
                  )
                );
        
                // Step 3: Wait for all OrderItems to be created
                forkJoin(orderItemCreates$).subscribe({
                  next: (results) => {
                    console.log('All order items created:', results);
                    alert('Order placed successfully!');
                    
                    // Clear the cart after successful checkout
                    this.cart = [];
                    this.isCheckingOut = false;
                    
                    // Optional: Redirect to orders page or confirmation page
                    // this.router.navigate(['/orders', createdOrder.id]);
                  },
                  error: (error) => {
                    console.error('Error creating order items:', error);
                    alert('Error placing order. Please try again.');
                    this.isCheckingOut = false;
                  }
                });
          }
    });
  }   
}
