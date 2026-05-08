import { Injectable } from '@angular/core';

type AnalyticsPayload = Record<string, unknown>;

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  track(eventName: string, payload: AnalyticsPayload = {}): void {
    const event = {
      eventName,
      payload,
      ts: new Date().toISOString(),
    };

    // This is intentionally lightweight for MVP.
    if (typeof window !== 'undefined') {
      console.debug('[analytics]', event);
    }
  }
}
