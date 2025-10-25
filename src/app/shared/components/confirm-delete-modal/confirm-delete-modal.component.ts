import { Component, ChangeDetectionStrategy, inject, output, input } from '@angular/core';
import { IndexedDBService } from '@core';

@Component({
  selector: 'app-confirm-delete-modal',
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="confirmDeleteTitle">
      <h2 id="confirmDeleteTitle">Excluir chave</h2>
      <p>Tem certeza que deseja apagar esta chave? Esta ação não pode ser desfeita.</p>

      <div class="actions">
        <button type="button" class="cancel" (click)="close()">Cancelar</button>
        <button type="button" class="confirm" (click)="confirm()">Sim, apagar</button>
      </div>
    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; display: grid; place-items: center; z-index: 2000; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); }
    .modal { position: relative; width: calc(100% - 24px); max-width: 420px; background: #ffffff; color: #333; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); padding: 16px; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    p { font-size: 14px; color: #444; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .cancel { background: transparent; border: 1px solid #ccc; padding: 8px 12px; border-radius: 8px; }
    .confirm { background: #f44336; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDeleteModalComponent {
  private readonly db = inject(IndexedDBService);

  id = input<IDBValidKey>();
  readonly closed = output<void>();
  readonly confirmed = output<IDBValidKey>();

  close() { this.closed.emit(); }

  async confirm() {
    const id = this.id();
    if (id == null) {
      this.close();
      return;
    }
    try {
      await this.db.delete(id);
      this.confirmed.emit(id);
      this.close();
    } catch {
      // Poderíamos exibir um erro, mas por ora apenas fecha
      this.close();
    }
  }
}