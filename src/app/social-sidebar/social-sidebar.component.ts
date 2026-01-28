import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-social-sidebar',
  templateUrl: './social-sidebar.component.html',
  styleUrl: './social-sidebar.component.css'
})
export class SocialSidebarComponent implements OnInit {
  isClosed = false;
  user: any = null;

constructor(private authService: AuthService) {

}

  toggleSidebar(): void {
    this.isClosed = !this.isClosed;
  }


  ngOnInit(): void {
    this.authService.getCurrentUser$().subscribe(user => {
      this.user = user;
    });
  }



}
