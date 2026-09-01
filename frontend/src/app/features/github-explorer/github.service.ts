import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { forkJoin } from 'rxjs';

export interface GithubUser {
  avatar_url: string;
  bio: string | null;
  followers: number;
  following: number;
  html_url: string;
  login: string;
  name: string | null;
  public_repos: number;
}

export interface GithubRepository {
  description: string | null;
  forks_count: number;
  html_url: string;
  id: number;
  language: string | null;
  name: string;
  stargazers_count: number;
}

@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.github.com/users';

  getProfile(username: string) {
    const encodedUsername = encodeURIComponent(username.trim());
    return forkJoin({
      user: this.http.get<GithubUser>(`${this.apiUrl}/${encodedUsername}`),
      repositories: this.http.get<GithubRepository[]>(`${this.apiUrl}/${encodedUsername}/repos`, {
        params: { sort: 'updated', per_page: '10' },
      }),
    });
  }
}
