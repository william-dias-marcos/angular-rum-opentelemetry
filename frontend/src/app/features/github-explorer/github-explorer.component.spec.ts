import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { GithubExplorerComponent } from './github-explorer.component';
import { GithubService } from './github.service';

describe('GithubExplorerComponent', () => {
  const github = { getProfile: vi.fn() };

  beforeEach(() => {
    github.getProfile.mockReset();
    TestBed.configureTestingModule({
      imports: [GithubExplorerComponent],
      providers: [
        provideTranslateService({ fallbackLang: 'pt-BR', lang: 'pt-BR' }),
        { provide: GithubService, useValue: github },
      ],
    });
  });

  it('stores a successful profile response', () => {
    github.getProfile.mockReturnValue(of({ user: { login: 'angular' }, repositories: [{ id: 1, name: 'core' }] }));
    const component = TestBed.createComponent(GithubExplorerComponent).componentInstance;

    component.search();

    expect(github.getProfile).toHaveBeenCalledWith('angular');
    expect(component.user()).toEqual({ login: 'angular' });
    expect(component.repositories()).toEqual([{ id: 1, name: 'core' }]);
    expect(component.loading()).toBe(false);
  });

  it('shows the rate limit state for GitHub throttling', () => {
    github.getProfile.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 429 })));
    const component = TestBed.createComponent(GithubExplorerComponent).componentInstance;

    component.search();

    expect(component.error()).toBe('rate_limit');
    expect(component.user()).toBeNull();
    expect(component.loading()).toBe(false);
  });
});
