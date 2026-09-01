import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Theme, ThemeService } from '../../../core/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.component.html',
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
  setTheme(theme: Theme): void { this.themeService.setTheme(theme); }
}
