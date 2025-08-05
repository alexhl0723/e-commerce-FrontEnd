import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-[999999999] space-y-2 pointer-events-none" style="position: fixed; z-index: 999999999; isolation: isolate;">
      <div 
        *ngFor="let notification of notificationService.notifications()" 
        class="bg-white border-l-4 p-4 rounded-lg shadow-xl min-w-[320px] max-w-[400px] pointer-events-auto"
        [ngClass]="{
          'border-green-500 text-green-800': notification.type === 'success',
          'border-red-500 text-red-800': notification.type === 'error',
          'border-yellow-500 text-yellow-800': notification.type === 'warning',
          'border-blue-500 text-blue-800': notification.type === 'info'
        }">
        
        <div class="flex items-start gap-3">
          <!-- Icono -->
          <div class="flex-shrink-0 mt-0.5">
            <svg *ngIf="notification.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <svg *ngIf="notification.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <svg *ngIf="notification.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <svg *ngIf="notification.type === 'info'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          
          <!-- Contenido -->
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold">{{ notification.title }}</h4>
            <p class="text-sm mt-1">{{ notification.message }}</p>
          </div>
          
          <!-- Botón cerrar -->
          <button 
            (click)="notificationService.remove(notification.id)"
            class="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-item {
      animation: slideInRight 0.3s ease-out;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class NotificationsComponent {
  notificationService = inject(NotificationService);

  getNotificationClasses(type: string): string {
    const baseClasses = 'border-l-4';
    
    switch (type) {
      case 'success':
        return `${baseClasses} border-green-500 text-green-800`;
      case 'error':
        return `${baseClasses} border-red-500 text-red-800`;
      case 'warning':
        return `${baseClasses} border-yellow-500 text-yellow-800`;
      case 'info':
        return `${baseClasses} border-blue-500 text-blue-800`;
      default:
        return `${baseClasses} border-gray-500 text-gray-800`;
    }
  }
} 