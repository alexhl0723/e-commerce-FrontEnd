import { Injectable, signal, WritableSignal } from '@angular/core';

export interface Notification {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications: WritableSignal<Notification[]> = signal<Notification[]>([]);
  private nextId = 1;

  show(notification: Omit<Notification, 'id'>) {
    const newNotification: Notification = {
      id: this.nextId++,
      duration: 5000, // 5 segundos por defecto
      ...notification
    };

    this.notifications.set([...this.notifications(), newNotification]);

    // Auto-remover después del tiempo especificado
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(newNotification.id);
      }, newNotification.duration);
    }
  }

  success(title: string, message: string, duration?: number) {
    this.show({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    this.show({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    this.show({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    this.show({ type: 'info', title, message, duration });
  }

  remove(id: number) {
    this.notifications.set(this.notifications().filter(n => n.id !== id));
  }

  clear() {
    this.notifications.set([]);
  }
} 