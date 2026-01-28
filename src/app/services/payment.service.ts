import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {


constructor(private http: HttpClient) {}

  initiatePayment(orderId: number): Observable<any> {
    return this.http.post(`/api/payements/initiate/${orderId}`, {});
  }

  verifyPayment(paymentId: string): Observable<any> {
    return this.http.post(`/api/payements/verifypay?paymentId=${paymentId}`, {});
  }

}
