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
        this.router.navigate(['/categorias']);//redirigir a la pagina de categorias cambiar restriccion en spring boot de roles
      },
      error: (error) => {
        console.log(error);
        this.error = "Credenciales incorrectas";
      }
    })
  }

}
