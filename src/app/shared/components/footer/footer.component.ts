import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="meta">
      @if (updateAvailable()) {
        <div class="update-banner">
          Nova versão disponível.
          <button (click)="onUpdate()" [disabled]="installingUpdate()">Atualizar</button>
        </div>
      }

      <button class="add-btn" type="button" aria-label="Adicionar" (click)="onAddClick()">
        <span class="material-symbols-outlined">add</span>
      </button>
    </footer>
  `,
  styles: [`
    :host { position: fixed; bottom: 0; left: 0; right: 0; z-index: 1000; }
    footer.meta { display: flex; flex-direction: column; gap: 8px; padding: 8px 12px; color: #fff; }
    .add-btn { width: 100%; padding: 5px; border-radius: 8px; border: none; background: #6471f7; color: #fff; display: flex; align-items: center; justify-content: center; }
    .add-btn:active { transform: scale(0.98); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {
  buildTime = input<string>('');
  buildHash = input<string>('');
  updateAvailable = input<boolean>(false);
  installingUpdate = input<boolean>(false);

  readonly update = output<void>();
  readonly add = output<void>();

  onUpdate() { this.update.emit(); }
  onAddClick() { this.add.emit(); }
}