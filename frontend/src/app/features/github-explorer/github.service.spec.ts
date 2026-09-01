import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { GithubService } from './github.service';

describe('GithubService', () => {
  let service: GithubService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(GithubService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('requests a trimmed and URL-encoded user profile and recent repositories', () => {
    let profile: unknown;
    service.getProfile(' octo cat ').subscribe((result) => profile = result);

    const user = http.expectOne('https://api.github.com/users/octo%20cat');
    const repositories = http.expectOne((request) =>
      request.url === 'https://api.github.com/users/octo%20cat/repos'
      && request.params.get('sort') === 'updated'
      && request.params.get('per_page') === '10',
    );

    user.flush({ login: 'octo cat' });
    repositories.flush([{ id: 1, name: 'hello' }]);

    expect(profile).toEqual({
      user: { login: 'octo cat' },
      repositories: [{ id: 1, name: 'hello' }],
    });
  });
});
