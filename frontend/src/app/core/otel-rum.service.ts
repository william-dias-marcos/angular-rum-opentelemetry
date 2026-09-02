import { Injectable } from '@angular/core';
import { onCLS, onINP, onLCP, onTTFB, Metric } from 'web-vitals';
import { environment } from '../../environments/environment';

export type TelemetryAttributes = Record<string, string | number | boolean | undefined>;

/** Local-only RUM adapter. It deliberately never creates a network exporter. */
@Injectable({ providedIn: 'root' })
export class OtelRumService {
  constructor() {
    if (environment.telemetry.enabled) this.observeBrowserVitals();
  }

  recordMetric(name: string, value: number, attributes: TelemetryAttributes = {}): void {
    if (!environment.telemetry.enabled || !environment.telemetry.console) return;
    console.log('[rum:metric]', { name, value, attributes: this.clean(attributes) });
  }

  recordHttpRequest(attributes: TelemetryAttributes): void {
    this.recordMetric('rum_http_request_duration_ms', Number(attributes['duration_ms'] ?? 0), attributes);
  }

  recordError(errorType: 'runtime' | 'api' | 'rate_limit' | 'network' = 'runtime'): void {
    this.recordMetric('rum_angular_client_errors_total', 1, { error_type: errorType });
  }

  recordThemeSwitch(theme: 'light' | 'dark'): void {
    this.recordMetric('rum_theme_switch_total', 1, { theme });
  }

  private clean(attributes: TelemetryAttributes): TelemetryAttributes {
    return Object.fromEntries(Object.entries(attributes).filter(([, value]) => value !== undefined));
  }

  private observeBrowserVitals(): void {
    if (typeof window === 'undefined') return;
    const report = (name: string, metric: Metric, unit = 'ms') =>
      this.recordMetric(name, metric.value, { unit, locale: navigator.language });
    onLCP((metric) => report('rum_web_vitals_lcp_ms', metric));
    onINP((metric) => report('rum_web_vitals_inp_ms', metric));
    onCLS((metric) => report('rum_web_vitals_cls_score', metric, 'score'));
    onTTFB((metric) => report('rum_web_vitals_ttfb_ms', metric));
  }
}
