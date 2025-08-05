import { Component, OnInit, signal } from '@angular/core';
import { Role } from '../../interfaces/role.interface';
import { RoleService } from '../../services/role/role.service';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification/notification.service';
import { NotificationsComponent } from '../../components/shared/notifications/notifications.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './roles.component.html'
})
export class RolesComponent implements OnInit {

  roles = signal<Role[]>([]);
  mostrarFormulario = signal<boolean>(false);

  nuevoRole: Role = {
    nombreRol: '',
    descripcion: ''
  };
  
  roleEnEdicion: Role | null = null;

  constructor(
    private roleService: RoleService,
    private notificationService : NotificationService
  ) {}

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.roleService.getRoles().subscribe({
      next: data => {
        const transformados: Role[] = data.map((r: any) => ({
          idRole: r.idRol,
          nombreRol: r.nombreRol ?? '[Sin nombre]',
          descripcion: r.descripcion
        }));
        this.roles.set(transformados);
      },
      error: err => {
        console.error('Error al listar roles', err);
        this.notificationService.error('Error al listar roles', 'No se pudo listar los roles. Por favor, inténtalo de nuevo.');
      }
    });
  }   

  crearRole() {
    this.roleService.crearRole(this.nuevoRole).subscribe({
      next: (data: any) => {
        const nuevo: Role = {
          idRole: data.idRol,
          nombreRol: data.nombreRol,
          descripcion: data.descripcion,
        };
        this.roles.update(roles => [ ...roles, nuevo ]);
        this.cancelarEdicion();
        this.cerrarFormulario();
        this.notificationService.success('¡Rol creado!', `El rol "${nuevo.nombreRol}" ha sido creado exitosamente.`);
      },
      error: err =>{
        console.error('Error al crear role', err)
        this.notificationService.error('Error al crear rol', 'No se pudo crear el rol. Por favor, inténtalo de nuevo.')
      }
    });
  }

  editarRole(role: Role) {
    this.roleEnEdicion = { ...role };
    this.nuevoRole = { ...role };
    this.mostrarFormulario.set(true);
  }

  actualizarRole() {
    if (!this.roleEnEdicion?.idRole) return;

    this.roleService.actualizarRole(this.roleEnEdicion.idRole, this.nuevoRole).subscribe({
      next: () => {
        this.listar();
        this.cancelarEdicion();
        this.cerrarFormulario();
        this.notificationService.success('¡Rol actualizado!', `El rol "${this.nuevoRole.nombreRol}" ha sido actualizado exitosamente.`);
      },
      error: err => {
        console.log('Error al actualizar role', err)
        this.notificationService.error('Error al actualizar rol', 'No se pudo actualizar el rol. Por favor, inténtalo de nuevo.')
      }
    });
  }

  eliminarRole(id: number | undefined) {
    if (!id) return;
    if (confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      this.roleService.eliminarRole(id).subscribe({
        next: () => {
          const roleEliminado = this.roles().find(r => r.idRole === id);
          this.listar();
          this.notificationService.success('¡Rol eliminado!', `El rol "${roleEliminado?.nombreRol}" ha sido eliminado exitosamente.`);
        },
        error: err => {
          console.log('Error al eliminar role', err)
          this.notificationService.error('Error al eliminar rol', 'No se pudo eliminar el rol. Por favor, inténtalo de nuevo.')
        }
      });
    }
  }

  cancelarEdicion() {
    this.roleEnEdicion = null;
    this.nuevoRole = { nombreRol: '', descripcion: '' };
  }

  // Métodos para controlar el formulario
  toggleFormulario() {
    this.mostrarFormulario.set(!this.mostrarFormulario());
    if (!this.mostrarFormulario()) {
      this.cancelarEdicion();
    }
  }

  cerrarFormulario() {
    this.mostrarFormulario.set(false);
  }
}
