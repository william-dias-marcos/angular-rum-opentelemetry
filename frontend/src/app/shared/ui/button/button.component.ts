import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  host: { class: 'contents' },
  template: `<button [type]="type()" [disabled]="disabled()" [class]="buttonClass()"><ng-content /></button>`,
})
export class ButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly disabled = input(false);
  readonly variant = input<'primary' | 'icon'>('primary');

  buttonClass(): string {
    return this.variant() === 'icon'
      ? 'grid size-7 place-items-center transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500'
      : 'shrink-0 whitespace-nowrap bg-slate-950 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition hover:bg-cyan-700 disabled:cursor-wait disabled:opacity-70 dark:bg-cyan-300 dark:text-slate-950 dark:hover:bg-cyan-200';
  }
}
