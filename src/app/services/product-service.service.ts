import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product';
@Injectable({
  providedIn: 'root'
})
export class ProductServiceService {

 private apiUrl = 'http://localhost:8085/api/products';

  constructor(private http: HttpClient) {}

 createProduct(product: Product): Observable<Product> {
  return this.http.post<Product>(this.apiUrl, product, { withCredentials: true });
}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  getProductByCode(code: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${code}`);
  }

  updateProduct(code: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${code}`, product, { withCredentials: true });
  }

  deleteProduct(code: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${code}`, { withCredentials: true });
  }

   getProductsByCategory(categoryId: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`);
  }
}
