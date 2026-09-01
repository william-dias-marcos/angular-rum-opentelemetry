import { Component, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

type Locale = 'pt-BR' | 'en-US';

@Component({
  selector: 'app-language-toggle',
  imports: [TranslatePipe],
  templateUrl: './language-toggle.component.html',
})
export class LanguageToggleComponent {
  private readonly translate = inject(TranslateService);
  readonly locale = signal<Locale>(this.translate.currentLang() === 'en-US' ? 'en-US' : 'pt-BR');
  setLocale(locale: Locale): void { this.locale.set(locale); this.translate.use(locale); }
}
