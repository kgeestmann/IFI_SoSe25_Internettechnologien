import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    // An open socket during server-side rendering keeps the render from ever finishing.
    if (isPlatformBrowser(platformId)) {
      this.socket = io('http://localhost:4000');
    }
  }

  onLowStock(): Observable<{ product_id: number; stock: number }> {
    return new Observable((subscriber) => {
      this.socket?.on('lowStock', (data) => {
        console.log('LowStock-Event empfangen:', data);
        subscriber.next(data);
      });
    });
  }
}
