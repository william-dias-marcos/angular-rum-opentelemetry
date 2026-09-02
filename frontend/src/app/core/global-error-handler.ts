import { ErrorHandler, Injectable, inject } from '@angular/core';
import { OtelRumService } from './otel-rum.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly rum = inject(OtelRumService);

  handleError(error: unknown): void {
    this.rum.recordError('runtime');
    console.error('[rum:error]', error);
  }
}
