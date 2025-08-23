import { Component, signal, Signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductoService } from '../../services/producto/producto.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { CarritoService } from '../../services/carrito/carrito.service';
import { NotificationService } from '../../services/notification/notification.service';
import { Producto } from '../../interfaces/producto.interface';
import { Categoria } from '../../interfaces/categoria.interface';
import { Carrito } from '../../interfaces/carrito.interface';
import { NotificationsComponent } from '../../components/shared/notifications/notifications.component';

@Component({
  selector: 'app-tienda',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    NotificationsComponent
  ],
  templateUrl: './tienda.component.html',
  styleUrls: ['./tienda.component.css']
})
export class TiendaComponent {
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  carrito = signal<Carrito[]>([]);
  
  // Filtros
  categoriaSeleccionada = signal<number>(0);
  terminoBusqueda = signal<string>('');
  precioMin = signal<number>(0);
  precioMax = signal<number>(10000);
  
  // Estado del carrito
  carritoAbierto = signal<boolean>(false);
  
  // ID del usuario (por ahora hardcodeado, luego se obtiene del auth)
  idUsuario = 1;
  
  private backendHost = 'http://localhost:8084';

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private carritoService: CarritoService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.cargarCategorias();
    this.cargarCarrito();
  }

  cargarProductos() {
    this.productoService.listarProductos().subscribe(productos => {
      this.productos.set(productos);
    });
  }

  cargarCategorias() {
    this.categoriaService.listarCategorias().subscribe(categorias => {
      this.categorias.set(categorias);
    });
  }

  cargarCarrito() {
    this.carritoService.getCarritoPorIdCliente(this.idUsuario).subscribe(carrito => {
      // Completar la información del producto en cada item del carrito
      const carritoCompleto = carrito.map(item => {
        const producto = this.productos().find(p => p.idProducto === item.idProducto);
        if (producto) {
          return {
            ...item,
            producto: {
              nombre: producto.nombre,
              precio: producto.precio,
              imgUrl: producto.imgUrl,
              marca: producto.marca
            }
          };
        }
        return item;
      });
      this.carrito.set(carritoCompleto);
    });
  }

  // Filtrar productos
  get productosFiltrados(): Producto[] {
    let productos = this.productos();
    
    // Filtro por categoría
    if (this.categoriaSeleccionada() > 0) {
      productos = productos.filter(p => p.idCategoria === this.categoriaSeleccionada());
    }
    
    // Filtro por término de búsqueda
    if (this.terminoBusqueda().trim()) {
      const termino = this.terminoBusqueda().toLowerCase();
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.marca.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino)
      );
    }
    
    // Filtro por precio
    productos = productos.filter(p => 
      p.precio >= this.precioMin() && p.precio <= this.precioMax()
    );
    
    return productos;
  }

  // Agregar al carrito
  agregarAlCarrito(producto: Producto) {
    const carritoItem: Carrito = {
      idUsuario: this.idUsuario,
      idProducto: producto.idProducto!,
      cantidad: 1,
      producto: {
        nombre: producto.nombre,
        precio: producto.precio,
        imgUrl: producto.imgUrl,
        marca: producto.marca
      }
    };

    this.carritoService.agregarOActualizar(carritoItem).subscribe({
      next: (carrito) => {
        this.cargarCarrito();
        this.notificationService.success(
          '¡Producto agregado!', 
          `${producto.nombre} se agregó al carrito`
        );
      },
      error: () => {
        this.notificationService.error(
          'Error', 
          'No se pudo agregar el producto al carrito'
        );
      }
    });
  }

  // Actualizar cantidad en el carrito
  actualizarCantidad(item: Carrito, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      this.eliminarDelCarrito(item.idCarrito!);
      return;
    }

    const carritoActualizado: Carrito = {
      ...item,
      cantidad: nuevaCantidad,
      producto: item.producto // Mantener la información del producto
    };

    this.carritoService.agregarOActualizar(carritoActualizado).subscribe({
      next: () => {
        this.cargarCarrito();
      },
      error: () => {
        this.notificationService.error(
          'Error', 
          'No se pudo actualizar la cantidad'
        );
      }
    });
  }

  // Eliminar del carrito
  eliminarDelCarrito(idCarrito: number) {
    this.carritoService.eliminarCarrito(idCarrito).subscribe({
      next: () => {
        this.cargarCarrito();
        this.notificationService.success(
          '¡Producto eliminado!', 
          'Se eliminó del carrito'
        );
      },
      error: () => {
        this.notificationService.error(
          'Error', 
          'No se pudo eliminar del carrito'
        );
      }
    });
  }

  // Calcular total del carrito
  get totalCarrito(): number {
    return this.carrito().reduce((total, item) => {
      return total + (item.producto?.precio || 0) * item.cantidad;
    }, 0);
  }

  // Calcular cantidad total de items
  get cantidadTotalItems(): number {
    return this.carrito().reduce((total, item) => total + item.cantidad, 0);
  }

  // Limpiar filtros
  limpiarFiltros() {
    this.categoriaSeleccionada.set(0);
    this.terminoBusqueda.set('');
    this.precioMin.set(0);
    this.precioMax.set(10000);
  }

  // Resolver URLs de imagen
  resolveImg(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${this.backendHost}${url}`;
  }

  // Obtener nombre de categoría
  getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias().find(cat => cat.idCategoria === idCategoria);
    return categoria ? categoria.nombre : 'Sin categoría';
  }

  // Toggle carrito
  toggleCarrito() {
    this.carritoAbierto.set(!this.carritoAbierto());
  }

  // Ver detalle del producto
  verDetalleProducto(idProducto: number) {
    this.router.navigate(['/producto', idProducto]);
  }
}
