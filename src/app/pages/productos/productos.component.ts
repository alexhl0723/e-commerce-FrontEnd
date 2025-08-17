import { Component, signal, Signal, WritableSignal } from '@angular/core';
import { ProductoService } from '../../services/producto/producto.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { NotificationService } from '../../services/notification/notification.service';
import { CommonModule } from '@angular/common';
import { Producto } from '../../interfaces/producto.interface';
import { ImagenProducto } from '../../interfaces/imagen-productos.interface';
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
  // Estado para drag & drop de imágenes
  imagenesSeleccionadas: File[] = [];
  previews: string[] = [];
  private backendHost = 'http://localhost:8084';
  
  // Propiedades para búsqueda
  terminoBusqueda = signal<string>('');
  buscando = signal<boolean>(false);

//#region interfaces
 
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

  //#region ImgDragAndDrop
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
    this.imagenesSeleccionadas = [];
    this.previews = [];
    this.cerrarFormulario();
  }
  //#endregion

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
//#region  buscar productos
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
//#endregion

  // Limpiar busqueda
  limpiarBusqueda() {
    this.terminoBusqueda.set('');
    this.listar();
  }
//#region  producto crud
  crearProducto(){
    this.productoService.crearProducto(this.productoTodo).subscribe({
      next: (productoCreado) => {
        // Si hay imágenes seleccionadas, primero subimos y luego actualizamos el producto con las URLs devueltas aunque no se muestra por el
        const hayImagenes = this.imagenesSeleccionadas.length > 0;
        if (!hayImagenes) {
          this.productos.set([...this.productos(), productoCreado]);
          this.cancelarEdicion();
          this.cerrarFormulario();
          this.notificationService.success('¡Producto creado!', `El producto "${productoCreado.nombre}" ha sido creado.`);
          return;
        }

        this.productoService.subirImagenes(this.imagenesSeleccionadas).subscribe({
          next: (res: any) => {
            const imgUrl = res?.imgUrl ?? null;
            const imagenes: string[] = Array.isArray(res?.imagenesProductos) ? res.imagenesProductos : [];
            const imagenesMapeadas: ImagenProducto[] = imagenes.map((url: string, index: number) => ({
              urlImagen: url,
              orden: index,
              esPrincipal: index === 0 ? 1 : 0,
            }));

            const productoActualizado: Producto = {
              ...productoCreado,
              imgUrl: imgUrl,
              imagenesProductos: imagenesMapeadas,
            };

            this.productoService.actualizarProducto(productoCreado.idProducto!, productoActualizado).subscribe({
              next: (productoFinal) => {
                this.productos.set([...this.productos(), productoFinal]);
                this.cancelarEdicion();
                this.cerrarFormulario();
                this.notificationService.success('¡Producto creado!', `El producto "${productoFinal.nombre}" y sus imágenes fueron guardados.`);
              },
              error: () => {
                this.notificationService.error('Error al asociar imágenes', 'El producto se creó, pero no se pudieron guardar las imágenes.');
              }
            });
          },
          error: () => {
            this.notificationService.error('Error al subir imágenes', 'El producto se creó, pero no se pudieron subir las imágenes.');
          }
        });
      },
      error: () => {
        this.notificationService.error('Error al crear producto', 'No se pudo crear el producto. Por favor, inténtalo de nuevo.');
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
//#endregion

//falta implementar
  cambiarEstado(){
    
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

  // Drag & Drop + selección manual
  onDragOver(event: DragEvent) { event.preventDefault(); }
  onDragLeave(event: DragEvent) { event.preventDefault(); }
  onDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files) {
      this.agregarArchivos(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.agregarArchivos(files);
    }
  }

  private agregarArchivos(fileList: FileList) {
    this.imagenesSeleccionadas = [];
    this.previews = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.imagenesSeleccionadas.push(file);
      this.previews.push(URL.createObjectURL(file));
    }
  }
//#region  metodo drag and drop

  subirImagenesSeleccionadas() {
    if (!this.productoTodo.idProducto) {
      this.notificationService.info('Primero crea el producto', 'Debes guardar el producto antes de subir imágenes.');
      return;
    }
    if (this.imagenesSeleccionadas.length === 0) return;
    this.productoService.subirImagenes(this.imagenesSeleccionadas).subscribe({
      next: (res: any) => {
        const imagenesNuevas: string[] = Array.isArray(res?.imagenesProductos) ? res.imagenesProductos : [];
        const yaTienePrincipal = this.productoTodo.imagenesProductos.some(i => i.esPrincipal === 1);
        const maxOrdenActual = this.productoTodo.imagenesProductos.length > 0
          ? Math.max(...this.productoTodo.imagenesProductos.map(i => i.orden))
          : -1;

        const nuevasImagenesMapeadas: ImagenProducto[] = imagenesNuevas.map((url: string, index: number) => ({
          urlImagen: url,
          orden: maxOrdenActual + 1 + index,
          esPrincipal: !yaTienePrincipal && index === 0 ? 1 : 0,
        }));

        const imagenesCombinadas = [
          ...this.productoTodo.imagenesProductos,
          ...nuevasImagenesMapeadas,
        ];

        // imgUrl: mantener la actual si ya había principal; si no, usar la de la nueva principal
        const principal = imagenesCombinadas.find(i => i.esPrincipal === 1);
        const nuevoImgUrl = principal ? principal.urlImagen : null;

        const productoActualizado: Producto = {
          ...this.productoTodo,
          imgUrl: nuevoImgUrl,
          imagenesProductos: imagenesCombinadas,
        };
        // Reflejar al one moment en el UI del formulario
        this.productoTodo = { ...productoActualizado };

        this.productoService.actualizarProducto(this.productoTodo.idProducto!, productoActualizado).subscribe({
          next: (productoFinal) => {
            // Hacemos merge por si el backend no devuelve imgUrl o imagenesProductos
            //el problema es con el auth arreglar porque aveces no muestra
            const productoMerged: Producto = {
              ...productoFinal,
              imgUrl: productoFinal.imgUrl ?? nuevoImgUrl,
              imagenesProductos: (productoFinal.imagenesProductos && productoFinal.imagenesProductos.length > 0)
                ? productoFinal.imagenesProductos
                : imagenesCombinadas,
            };
            this.productos.set(this.productos().map(p => p.idProducto === productoMerged.idProducto ? productoMerged : p));
            this.productoTodo = { ...productoMerged };
            this.imagenesSeleccionadas = [];
            this.previews = [];
            this.notificationService.success('Imágenes subidas', 'Las imágenes se subieron y guardaron correctamente.');
          },
          error: () => {
            this.notificationService.error('Error al asociar imágenes', 'No se pudieron guardar las imágenes en el producto.');
          }
        });
      },
      error: () => {
        this.notificationService.error('Error al subir imágenes', 'No se pudieron subir las imágenes.');
      }
    });
  }

  //#endregion
  
  eliminarImagen(img: ImagenProducto) {
    // Quitamos la imagen por su orden sin reindexar las demás tampoco bien
    const nuevasImagenes = this.productoTodo.imagenesProductos.filter(i => i.orden !== img.orden);
    const productoActualizado: Producto = {
      ...this.productoTodo,
      imagenesProductos: nuevasImagenes,
      // La principal sigue siendo la que tenga esPrincipal = 1, si la eliminamos, marcamos la primera restante como principal, funciona a medias
    };

    // Si quitamos la principal, reasignamos principal a la de menor orden restante sin cambiar órdenes aunque no funciona por el momento
    const habiaPrincipalEliminada = img.esPrincipal === 1;
    if (habiaPrincipalEliminada && nuevasImagenes.length > 0) {
      nuevasImagenes.forEach(i => (i.esPrincipal = 0));
      const menorOrden = nuevasImagenes.reduce((min, i) => (i.orden < min ? i.orden : min), nuevasImagenes[0].orden);
      const nuevaPrincipal = nuevasImagenes.find(i => i.orden === menorOrden)!;
      nuevaPrincipal.esPrincipal = 1;
      productoActualizado.imgUrl = nuevaPrincipal.urlImagen;
    }
    if (nuevasImagenes.length === 0) {
      productoActualizado.imgUrl = null;
    }

    this.productoTodo.imagenesProductos = nuevasImagenes;

    if (!this.productoTodo.idProducto) {
      return;
    }
    this.productoService.actualizarProducto(this.productoTodo.idProducto!, productoActualizado).subscribe({
      next: (productoFinal) => {
        this.productos.set(this.productos().map(p => p.idProducto === productoFinal.idProducto ? productoFinal : p));
        this.productoTodo = { ...productoFinal };
        this.notificationService.success('imagen eliminada', 'La imagen fue eliminada');
      },
      error: () => {
        this.notificationService.error('Error al eliminar imagen', 'No se pudo actualizar el producto tras eliminar la imagen.');
      }
    });
  }
//osea la rut va a dar como /imagenes/nombre del prod lo recupera
  // Resolver URLs de imagen desde backend cuando llegan relativas ("/imagenes/...")
  resolveImg(url: string | null | undefined): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${this.backendHost}${url}`;
  }

}