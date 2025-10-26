// login.component.ts

import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {

  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router){}

  VerificarLogin(){
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveUserRole(response.roleId); // Es crucial guardar el rol antes de usarlo

        // ⭐ Lógica de redirección condicional
        if (this.authService.isUserAdmin()) {
          this.router.navigate(['/categorias']); // Admin va a gestión
        } else {
          this.router.navigate(['/']); // Cliente va al Home
        }
      },
      error: (error) => {
        console.log(error);
        this.error = "Credenciales incorrectas";
      }
    })
  }
 
}