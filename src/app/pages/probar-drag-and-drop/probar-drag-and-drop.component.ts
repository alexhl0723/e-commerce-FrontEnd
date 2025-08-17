import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-probar-drag-and-drop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './probar-drag-and-drop.component.html',
})
export class ProbarDragAndDropComponent {
  imagenes: File[] = [];
  previews: string[] = [];

  imgUrl: string | null = null;
  imagenesProductos: string[] = [];

  constructor(private http: HttpClient) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
  }

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

  agregarArchivos(fileList: FileList) {
    this.imagenes = [];
    this.previews = [];
  
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      this.imagenes.push(file);
      this.previews.push(URL.createObjectURL(file));
    }
  }
  

  subirImagenes(): void {
    const formData = new FormData();
    this.imagenes.forEach((file: File) => formData.append('imagenes', file));
  
    this.http.post('http://localhost:8084/imagenes/subir', formData)
      .subscribe({
        next: (res: any) => {
          console.log('✅ Subida exitosa', res);
          this.imgUrl = res.imgUrl;
          this.imagenesProductos = res.imagenesProductos;
        },
        error: err => {
          console.error('Error al subir las o imagenes ', err);
        }
      });
  }
  
}
