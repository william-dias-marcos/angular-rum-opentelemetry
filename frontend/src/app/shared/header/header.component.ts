import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageToggleComponent } from '../ui/language-toggle/language-toggle.component';
import { ThemeToggleComponent } from '../ui/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, TranslatePipe, LanguageToggleComponent, ThemeToggleComponent],
  templateUrl: './header.component.html',
})
export class HeaderComponent {}
