// navbar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isUserAdmin: boolean = false;
  isUserClient: boolean = false;
  
  // SOLUCIÓN: Inicializar la propiedad a null
  private authSubscription: Subscription | null = null;

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    // Aquí es donde le asignas un valor
    this.authSubscription = this.authService.userRole$.subscribe(roleId => {
      this.isUserAdmin = roleId === 1;
      this.isUserClient = roleId === 2;
    });
  }

  ngOnDestroy(): void {
    // Es importante verificar si la suscripción existe antes de cancelarla
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout();
  }
}