import { Injectable } from '@angular/core';
import { OrderItem } from '../models/order-item';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderItemServiceService {

  private apiUrl = 'http://localhost:8085/api/order-items';

  constructor(private http: HttpClient) {}

  create(orderItem: OrderItem): Observable<OrderItem> {
    return this.http.post<OrderItem>(this.apiUrl, orderItem, { withCredentials: true });
  }

  getAll(): Observable<OrderItem[]> {
    return this.http.get<OrderItem[]>(this.apiUrl);
  }

  getById(id: number): Observable<OrderItem> {
    return this.http.get<OrderItem>(`${this.apiUrl}/${id}`);
  }

  update(id: number, orderItem: OrderItem): Observable<OrderItem> {
    return this.http.put<OrderItem>(`${this.apiUrl}/${id}`, orderItem ,{ withCredentials: true });
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}` ,{ withCredentials: true });
  }
}
