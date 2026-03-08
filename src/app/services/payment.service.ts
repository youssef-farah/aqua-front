import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// ==================== REQUEST DTOs ====================

export interface CartItemDTO {
  productId: number;
  quantity: number;
  price: number;
  productoption?: string; // ADD THIS

}

export interface PaymentInitiateRequest {
  userId: number;
  totalAmount: number;
  cartItems: CartItemDTO[];
}

export interface OrderCreationRequest {
  paymentId: string;
  userId: number;
  totalAmount: number;
  cartItems: CartItemDTO[];
}

// ==================== RESPONSE DTOs ====================

export interface PaymentInitiateResponse {
  success: boolean;
  paymentId: string;
  paymentLink: string;
  error?: string;
}

export interface OrderCreationResponse {
  success: boolean;
  orderId: number;
  orderState: string;
  paymentId: string;
  order: any;
  error?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  paymentId: string;
  status: string;
  amount: number;
  isSuccessful: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8085/api/payements';

  constructor(private http: HttpClient) {}

  /**
   * NEW FLOW: Initiate payment WITHOUT creating order
   * @param request Contains userId, cartItems, totalAmount
   */
  initiatePaymentOnly(request: PaymentInitiateRequest): Observable<PaymentInitiateResponse> {
    return this.http.post<PaymentInitiateResponse>(
      `${this.baseUrl}/initiate`,
      request
    );
  }

  /**
   * NEW FLOW: Verify payment and CREATE order (only if payment successful)
   * @param request Contains paymentId, userId, cartItems, totalAmount
   */
  verifyAndCreateOrder(request: OrderCreationRequest): Observable<OrderCreationResponse> {
    return this.http.post<OrderCreationResponse>(
      `${this.baseUrl}/verify-and-create-order`,
      request
    );
  }

  /**
   * Get payment status without creating order
   * @param paymentId The Flouci payment ID
   */
  getPaymentStatus(paymentId: string): Observable<PaymentStatusResponse> {
    return this.http.get<PaymentStatusResponse>(
      `${this.baseUrl}/status/${paymentId}`
    );
  }

  // ==================== OLD METHODS (Deprecated) ====================

  /**
   * @deprecated Use initiatePaymentOnly instead
   */
  initiatePayment(orderId: number): Observable<PaymentInitiateResponse> {
    return this.http.post<PaymentInitiateResponse>(
      `${this.baseUrl}/initiate/${orderId}`,
      {}
    );
  }

  /**
   * @deprecated Use verifyAndCreateOrder instead
   */
  verifyPayment(paymentId: string): Observable<any> {
    const params = new HttpParams().set('paymentId', paymentId);
    
    return this.http.post(
      `${this.baseUrl}/verifypay`,
      {},
      { params }
    );
  }
}