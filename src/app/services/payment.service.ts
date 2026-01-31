import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface PaymentInitiateResponse {
  success: boolean;
  paymentId: string;
  paymentLink: string;
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  orderId: number;
  orderState: string;
  paymentId: string;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private baseUrl = 'http://localhost:8085/api/payements'; // Adjust to your backend URL

  constructor(private http: HttpClient) {}

  /**
   * Initiate payment for an order
   * @param orderId The order ID to create payment for
   */
  initiatePayment(orderId: number): Observable<PaymentInitiateResponse> {
    return this.http.post<PaymentInitiateResponse>(
      `${this.baseUrl}/initiate/${orderId}`,
      {}
    );
  }

  /**
   * Verify payment status and update order
   * @param paymentId The Flouci payment ID from URL
   */
  verifyPayment(paymentId: string): Observable<PaymentVerifyResponse> {
    const params = new HttpParams().set('paymentId', paymentId);
    
    return this.http.post<PaymentVerifyResponse>(
      `${this.baseUrl}/verifypay`,
      {},
      { params }
    );
  }

  /**
   * Get payment status without updating order
   * @param paymentId The Flouci payment ID
   */
  getPaymentStatus(paymentId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/status/${paymentId}`);
  }
}
