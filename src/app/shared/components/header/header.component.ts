import { Component, ChangeDetectionStrategy, output, input } from '@angular/core';

@Component({
  selector: 'app-header',
  template: `
    <header>
      <div class="brand">
        <img class="logo" src="/assets/logo.svg" alt="Logo" width="48" height="48" />
        <div class="title">Chaves Online</div>
        <p class="version">@if (version()) { Versão: {{ version() }} }</p>
      </div>
    </header>
  `,
  styles: [`
    :host { position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
    header { height: 56px; display: flex; align-items: center; justify-content: space-between; padding: 0 12px; background: #33333d; color: #fff; }
    .brand { display: flex; align-items: center; gap: 8px; }
    .logo { width: 48px; height: 48px; }
    .title { font-weight: 600; font-size: 16px; letter-spacing: 0.2px; }
    .version { position: absolute; right: 0; padding-right: 10px; font-size: 10px; top: 0;}
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  version = input<string>('');
}