import { Component,EventEmitter,Output,ViewEncapsulation  } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
 isCollapsed: boolean = false;   

  @Output() sidebarToggled = new EventEmitter<boolean>(); 

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;

    // Notify parent
    this.sidebarToggled.emit(this.isCollapsed);
  }
}
