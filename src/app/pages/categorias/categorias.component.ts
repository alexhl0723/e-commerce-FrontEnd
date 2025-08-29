import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { Categoria } from '../../interfaces/categoria.interface';
import { NotificationsComponent } from '../../components/shared/notifications/notifications.component';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-categorias',
  imports: [CommonModule, FormsModule, NotificationsComponent],
  templateUrl: './categorias.component.html',
})
export class CategoriasComponent implements OnInit {

  categorias = signal<Categoria[]>([]);
  mostrarFormulario = signal<boolean>(false);

  nuevaCategoria: Categoria = {
    nombre: '',
    descripcion: '',
    estado: 1
  };

  categoriaEnEdicion: Categoria | null = null;

  constructor(
    private categoriaService: CategoriaService, 
    private notificationService: NotificationService
  ){}

  ngOnInit(): void {
    this.listar();
  }

  listar() {
    this.categoriaService.listarCategorias().subscribe({
      next: data => this.categorias.set(data),
      error: err => {
        console.error('Error al listar categorías', err);
        this.notificationService.error('Error al listar categorías', 'No se pudo listar las categorías. Por favor, inténtalo de nuevo.');
      }
    });
  }

  crearCategoria() {
    this.categoriaService.crearCategoria(this.nuevaCategoria).subscribe({
      next: (nueva) => {
        this.nuevaCategoria = { nombre: '', descripcion: '', estado: 1 };
        this.listar();
        this.cancelarEdicion();
        this.cerrarFormulario();
        this.notificationService.success('¡Categoría creada!', `La categoría "${nueva.nombre}"  ha sido creada exitosamente.`);
      },
      error: err => {
        console.error('Error al crear categoría', err);
        this.notificationService.error('Error al crear categoría', 'No se pudo crear la categoría. Por favor, inténtalo de nuevo.');
      }
    });
  }

  eliminarCategoria(id: number | undefined) {
    if (!id) return;

    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.categoriaService.eliminarCategoria(id).subscribe({
        next: () => {
          const categoriaEliminada = this.categorias().find(c => c.idCategoria === id);
          this.listar();
          this.notificationService.success('¡Categoría eliminada!', `La categoría "${categoriaEliminada?.nombre}" ha sido eliminada exitosamente.`);
        },
        error: err => {
          console.error('Error al eliminar categoría', err);
          this.notificationService.error('Error al eliminar categoría', 'No se pudo eliminar la categoría. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }

  editarCategoria(categoria: Categoria) {
    this.categoriaEnEdicion = { ...categoria };
    this.nuevaCategoria = { ...categoria };
    this.mostrarFormulario.set(true);
  }

  actualizarCategoria() {
    if (!this.categoriaEnEdicion?.idCategoria) return;

    this.categoriaService.actualizarCategoria(this.categoriaEnEdicion.idCategoria, this.nuevaCategoria).subscribe({
      next: () => {
        this.listar();
        this.cancelarEdicion();
        this.notificationService.success('¡Categoría actualizada!', `La categoría "${this.nuevaCategoria.nombre}"  ha sido actualizada exitosamente.`);
      },
      error: err => {
        console.error('Error al actualizar categoría', err);
        this.notificationService.error('Error al actualizar categoría', 'No se pudo actualizar la categoría. Por favor, inténtalo de nuevo.');
      }
    });
  }

  cancelarEdicion() {
    this.categoriaEnEdicion = null;
    this.nuevaCategoria = { nombre: '', descripcion: '', estado: 1 };
    this.cerrarFormulario();
  }

  // Métodos para controlar el formulario
  toggleFormulario() {
    this.mostrarFormulario.set(!this.mostrarFormulario());
    if (!this.mostrarFormulario()) {
      this.cancelarEdicion();
    }
  }

  cerrarFormulario() {
    console.log('Cerrando formulario...');
    this.mostrarFormulario.set(false);
  }


cambiarEstado(categoria: Categoria) {
  const nuevoEstado = categoria.estado !== 1;
  
  // Actualizar la vista INMEDIATAMENTE
  const categoriasActualizadas = this.categorias().map(cat => 
    cat.idCategoria === categoria.idCategoria 
      ? { ...cat, estado: nuevoEstado ? 1 : 0 }
      : cat
  );
  this.categorias.set([...categoriasActualizadas]);
  
  // Mostrar mensaje de éxito
  this.notificationService.success(
    'Estado actualizado',
    `${categoria.nombre} está ${nuevoEstado ? 'activa' : 'inactiva'}`
  );
  
  // Hacer petición al backend en segundo plano (sin mostrar errores al usuario)
  this.categoriaService.actualizarEstado(categoria.idCategoria!, nuevoEstado).subscribe({
    next: () => {
      console.log('Backend sincronizado correctamente');
    },
    error: (err) => {
      console.log('Error en backend pero ya se actualizó la vista:', err);
    }
  });
}
  
}
