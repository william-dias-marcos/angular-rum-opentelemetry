import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  host: { class: 'contents' },
  template: `<article [class]="className()"><ng-content /></article>`,
})
export class CardComponent {
  readonly className = input('');
}
