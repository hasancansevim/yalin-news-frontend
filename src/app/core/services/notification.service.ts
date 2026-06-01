import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  readonly notification = signal<Notification | null>(null);

  show(message: string, type: NotificationType = 'success') {
    this.notification.set({ message, type });
    setTimeout(() => {
      this.clear();
    }, 4000);
  }

  clear() {
    this.notification.set(null);
  }
}
