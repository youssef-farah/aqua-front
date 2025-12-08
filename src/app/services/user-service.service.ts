import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {


  private apiUrl = 'http://localhost:8085/api/users';
    constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl ,{ withCredentials: true });
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}` ,{ withCredentials: true });
  }


  updateUser(id: number, user: User): Observable<User> {
    console.log('Updating user with ID:', id, 'Data:', user);
    return this.http.put<User>(`${this.apiUrl}/${id}`, user ,{ withCredentials: true });
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}` ,{ withCredentials: true });
  }
}
