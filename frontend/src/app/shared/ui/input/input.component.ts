import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-input',
  host: { class: 'contents' },
  template: `<input [id]="id()" [name]="name()" [value]="value()" [placeholder]="placeholder()" [required]="required()" [attr.autocomplete]="autocomplete()" (input)="valueChange.emit($any($event.target).value)" class="min-w-0 w-full flex-1 bg-transparent py-3 font-mono text-sm outline-none placeholder:text-slate-400" />`,
})
export class InputComponent {
  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly value = input('');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly autocomplete = input('off');
  readonly valueChange = output<string>();
}
