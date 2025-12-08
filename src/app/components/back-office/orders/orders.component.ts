import { Component, OnInit } from '@angular/core';
import { Order,OrderState } from '../../../models/order';
import { OrderServiceService } from '../../../services/order-service.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {

 orders: Order[] = [];
  filteredOrders: Order[] = [];
filterDate: string = ""; // new filter

  loading = false;
  searchTerm: string = '';

  orderStates = Object.values(OrderState); // ['CREATED', ...]

  constructor(private orderService: OrderServiceService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;

    this.orderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
        this.filteredOrders = [...data];
        this.loading = false;
        console.log('Orders loaded:', data);
      },
      error: (err) => {
        console.error('Failed to load orders', err);
        this.loading = false;
      }
    });
  }

search(): void {
  const term = this.searchTerm.toLowerCase();
  const dateFilter = this.filterDate;

  this.filteredOrders = this.orders.filter(order => {
    
    const matchesText =
      !term ||
      order.id?.toString().includes(term);

    const matchesDate =
      !dateFilter ||
      (order.createdAt &&
       new Date(order.createdAt).toISOString().slice(0, 10) === dateFilter);

    return matchesText && matchesDate;
  });
}

  onStateChange(order: Order, newState: OrderState): void {
    const updatedOrder: Order = { ...order, state: newState };

    this.orderService.update(order.id!, updatedOrder).subscribe({
      next: () => {
        order.state = newState; // update UI instantly
      },
      error: (err) => {
        console.error('Order update failed', err);
        alert('Failed to update order!');
      }
    });
  }

  toggleItems(order: any) {
    order.showItems = !order.showItems;
  }



  
}