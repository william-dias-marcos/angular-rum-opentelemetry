import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { OtelRumService } from './otel-rum.service';

export const httpTelemetryInterceptor: HttpInterceptorFn = (req, next) => {
  const rum = inject(OtelRumService);
  const started = performance.now();
  let status: number | undefined;
  let failure: string | undefined;

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        status = error.status;
        failure = error.status === 429 || error.status === 403 ? 'rate_limit' : error.status === 0 ? 'network' : 'api';
      } else failure = 'network';
      return throwError(() => error);
    }),
    finalize(() => rum.recordHttpRequest({
      method: req.method,
      host: new URL(req.urlWithParams, document.baseURI).host,
      duration_ms: Math.round(performance.now() - started),
      ...(status === undefined ? {} : { status }),
      ...(failure === undefined ? {} : { failure }),
    })),
  );
};
