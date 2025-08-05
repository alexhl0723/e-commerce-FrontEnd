import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class JwtInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const token = this.authService.getToken();
    console.log(token);//ojo quitar de aquí solo para debug !! peligro

    let request = req;

    if(token){
      request = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          //'Content-Type': 'application/json'
        }
      })
    }

    return next.handle(request);
    /*return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.warn('Token inválido o expirado. Redirigiendo al login...');
          this.authService.logout(); // Limpia el token si quieres
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );*/
  }



}
