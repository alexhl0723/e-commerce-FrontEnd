import { Component, signal, Signal, WritableSignal } from '@angular/core';
import { ProductoService } from '../../services/producto/producto.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { NotificationService } from '../../services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { Producto } from '../../interfaces/producto.interface';
import { Categoria } from '../../interfaces/categoria.interface';
import { FormsModule } from '@angular/forms';
import { NotificationsComponent } from '../../components/shared/notifications/notifications.component';

@Component({
  selector: 'app-productos',
  imports: [
    CommonModule, 
    FormsModule,
    NotificationsComponent
  ],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent {
  productos = signal<Producto[]>([]);
  categorias: WritableSignal<Categoria[]> = signal<Categoria[]>([]);
  mostrarFormulario = signal<boolean>(false);
  
  // Propiedades para búsqueda
  terminoBusqueda = signal<string>('');
  buscando = signal<boolean>(false);

  productoTodo: Producto = {
    descripcion: '',
    dimensiones: null,
    estado: 1,
    fechaCreacion: null,
    idCategoria: 0,
    imgUrl: null,
    marca: '',
    nombre: '',
    peso: null,
    precio: 0,
    stock: 0,
    detallePedidos: [],
    imagenesProductos: [],
    resenas: []
  };

  agregarImagen() {
    this.productoTodo.imagenesProductos.push({
      idImagen: 0,
      urlImagen: '',
      orden: 0,
      esPrincipal: 0
    });
  }

  cancelarEdicion(){
    this.productoTodo = {
      descripcion: '',
      dimensiones: null,
      estado: 1,
      fechaCreacion: null,
      idCategoria: 0,
      imgUrl: null,
      marca: '',
      nombre: '',
      peso: null,
      precio: 0,
      stock: 0,
      detallePedidos: [],
      imagenesProductos: [],
      resenas: []
    };
    this.cerrarFormulario();
  }

  constructor(
    private productoService: ProductoService, 
    private categoriaService: CategoriaService,
    private notificationService: NotificationService
  ){}

  ngOnInit(){
    this.listar();
    this.categoriaService.listarCategorias().subscribe(categorias => {
      this.categorias.set(categorias);
    });
  }

  listar(){
    this.productoService.listarProductos().subscribe(productos => {
      this.productos.set(productos);
    });
  }

  // Método para buscar productos
  buscarProductos() {
    const termino = this.terminoBusqueda().trim();
    
    if (termino.length === 0) {
      this.listar();
      return;
    }

    this.buscando.set(true);
    this.productoService.buscarProductos(termino).subscribe({
      next: (productos) => {
        this.productos.set(productos);
        this.buscando.set(false);
        
        if (productos.length === 0) {
          this.notificationService.info(
            'Sin resultados', 
            `No se encontraron productos que coincidan con "${termino}"`
          );
        }
      },
      error: (error) => {
        this.buscando.set(false);
        this.notificationService.error(
          'Error en la búsqueda', 
          'No se pudo realizar la búsqueda. Por favor, inténtalo de nuevo.'
        );
      }
    });
  }

  // Método para limpiar búsqueda
  limpiarBusqueda() {
    this.terminoBusqueda.set('');
    this.listar();
  }

  crearProducto(){
    this.productoService.crearProducto(this.productoTodo).subscribe({
      next: (producto) => {
        this.productos.set([...this.productos(), producto]);
        this.cancelarEdicion();
        this.cerrarFormulario();
        this.notificationService.success(
          '¡Producto creado!', 
          `El producto "${producto.nombre}" ha sido creado exitosamente.`
        );
      },
      error: (error) => {
        this.notificationService.error(
          'Error al crear producto', 
          'No se pudo crear el producto. Por favor, inténtalo de nuevo.'
        );
      }
    });    
  }
  
  editarProducto(producto: Producto){
    this.productoTodo = { ...producto };
    this.mostrarFormulario.set(true);
  }

  eliminarProducto(id: number){
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productoService.eliminarProducto(id).subscribe({
        next: () => {
          const productoEliminado = this.productos().find(p => p.idProducto === id);
          this.productos.set(this.productos().filter(p => p.idProducto !== id));
          this.notificationService.success(
            '¡Producto eliminado!', 
            `El producto "${productoEliminado?.nombre}" ha sido eliminado exitosamente.`
          );
        },
        error: (error) => {
          this.notificationService.error(
            'Error al eliminar producto', 
            'No se pudo eliminar el producto. Por favor, inténtalo de nuevo.'
          );
        }
      });
    }
  }

  actualizarProducto(){
    this.productoService.actualizarProducto(this.productoTodo?.idProducto!, this.productoTodo).subscribe({
      next: (producto) => {
        this.productos.set(this.productos().map(p => p.idProducto === producto.idProducto ? producto : p));
        this.cancelarEdicion();
        this.notificationService.success(
          '¡Producto actualizado!', 
          `El producto "${producto.nombre}" ha sido actualizado exitosamente.`
        );
      },
      error: (error) => {
        this.notificationService.error(
          'Error al actualizar producto', 
          'No se pudo actualizar el producto. Por favor, inténtalo de nuevo.'
        );
      }
    });
  }

  // Método para obtener el nombre de la categoría por ID
  getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias().find(cat => cat.idCategoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
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

  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
  }

  

}