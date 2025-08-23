import { Component } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { RegisterRequest } from '../../interfaces/usuario.interfas';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  selector: 'app-user',
  templateUrl: './user.component.html'
})
export class UserComponent {
  nuevoUsuario: RegisterRequest = {
    nombres: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    email: '',
    password: '',
    telefono: '',
    direccion: ''
  };

  error: string = '';
  successMessage: string = ''; 
  isLoading: boolean = false; 

  constructor(private userService: UserService, private notificationService: NotificationService) {}

  // Método para registrar usuario
  registrarUsuario() {
    this.isLoading = true;
    this.error = ''; // Limpiar errores previos
    this.successMessage = ''; // Limpiar mensajes de éxito previos

    this.userService.register(this.nuevoUsuario).subscribe({
      next: (response) => {
        console.log('Usuario registrado con éxito:', response);
        this.notificationService.success('Usuario registrado con éxito', response.message || '✅ Usuario registrado correctamente');
        this.successMessage = response.message || '✅ Usuario registrado correctamente';
        this.nuevoUsuario = {
          nombres: '',
          apellidoPaterno: '',
          apellidoMaterno: '',
          email: '',
          password: '',
          telefono: '',
          direccion: ''
        };
        
        this.isLoading = false;
        
        setTimeout(() => {
          this.successMessage = '';
        }, 5000);
      },
      error: (err) => {
        this.error = err.error?.message || err.error || 'Error al registrar usuario';
        this.notificationService.error('Error al registrar usuario', this.error);
        this.successMessage = ''; 
        this.isLoading = false;
        console.error('Error al registrar usuario:', err);
      }
    });
  }

  limpiarMensajes() {
    this.error = '';
    this.successMessage = '';
  }
}