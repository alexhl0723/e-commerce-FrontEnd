import { Routes } from '@angular/router';
import { CategoriasComponent } from './pages/categorias/categorias.component';
import { CounterComponent } from './pages/counter/counter.component';
import { HeroComponent } from './pages/hero/hero.component';
import { DragonballPageComponent } from './pages/dragonball/dragonball-page/dragonball-page.component';
import { LoginComponent } from './pages/login/login.component';
import { RolesComponent } from './pages/roles/roles.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ProbarDragAndDropComponent } from './pages/probar-drag-and-drop/probar-drag-and-drop.component';
import { IndexComponent } from './pages/index/index.component';
import { UserComponent } from './pages/user/user.component';
import { TiendaComponent } from './pages/tienda/tienda.component';
import { DetalleProductoComponent } from './pages/detalle-producto/detalle-producto.component';

export const routes: Routes = [
  { path: '', component: IndexComponent }, // index
  { path: 'tienda', component: TiendaComponent },
  { path: 'producto/:id', component: DetalleProductoComponent },
  { path: 'categorias', component: CategoriasComponent },
  { path: 'hero', component: HeroComponent },
  { path: 'dragonball', component: DragonballPageComponent },
  { path: 'counter', component: CounterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'roles', component: RolesComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'probar-drag-and-drop', component: ProbarDragAndDropComponent },
  { path: 'user', component: UserComponent }
];
