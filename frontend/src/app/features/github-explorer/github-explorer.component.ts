import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { GithubRepository, GithubService, GithubUser } from './github.service';

type SearchError = 'not_found' | 'rate_limit' | 'network' | 'server' | 'unexpected' | null;

@Component({
  selector: 'app-github-explorer',
  imports: [TranslatePipe, ButtonComponent, CardComponent, InputComponent],
  templateUrl: './github-explorer.component.html',
})
export class GithubExplorerComponent {
  private readonly github = inject(GithubService);
  readonly username = signal('angular');
  readonly user = signal<GithubUser | null>(null);
  readonly repositories = signal<GithubRepository[]>([]);
  readonly loading = signal(false);
  readonly error = signal<SearchError>(null);

  search(): void {
    if (!this.username().trim()) return;
    this.loading.set(true);
    this.error.set(null);
    this.github.getProfile(this.username()).subscribe({
      next: ({ user, repositories }) => {
        this.user.set(user);
        this.repositories.set(repositories);
        this.loading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.user.set(null);
        this.repositories.set([]);
        this.error.set(this.toSearchError(error));
        this.loading.set(false);
      },
    });
  }

  private toSearchError(error: HttpErrorResponse): SearchError {
    if (error.status === 404) return 'not_found';
    if (error.status === 403 || error.status === 429) return 'rate_limit';
    if (error.status === 0) return 'network';
    if (error.status >= 500) return 'server';
    return 'unexpected';
  }
}
