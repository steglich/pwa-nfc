import { Component, ChangeDetectionStrategy, signal, inject, output } from '@angular/core';
import { IndexedDBService } from '@core';
import { NfcService } from '@core/nfc.service';

@Component({
  selector: 'app-add-tag-modal',
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="addKeyTitle">
      <h2 id="addKeyTitle">Adicionar chave</h2>
      <form (submit)="onSubmit($event)" class="form">
        <label>
          Nome
          <input type="text" [value]="name()" (input)="onNameInput($event)" placeholder="Nome da chave" required />
        </label>

        <p class="hint">Ao salvar, vamos ler o UID da tag NFC. Aproxime a tag do celular.</p>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
        @if (reading()) {
          <p class="hint">Lendo UID da tag via NFC... aproxime a tag do aparelho.</p>
        }

        <div class="actions">
          <button type="button" class="cancel" (click)="close()" [disabled]="reading()">Cancelar</button>
          <button type="submit" class="confirm" [disabled]="reading()">Salvar</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; display: grid; place-items: center; z-index: 2000; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); }
    .modal { position: relative; width: calc(100% - 24px); max-width: 420px; background: #ffffff; color: #333; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); padding: 16px; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    .form { display: grid; gap: 12px; }
    label { display: grid; gap: 6px; font-size: 13px; }
    input { padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-size: 14px; }
    .hint { font-size: 12px; color: #666; }
    .error { font-size: 12px; color: #d32f2f; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
    .cancel { background: transparent; border: 1px solid #ccc; padding: 8px 12px; border-radius: 8px; }
    .confirm { background: #7E57C2; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTagModalComponent {
  private readonly db = inject(IndexedDBService);
  private readonly nfc = inject(NfcService);

  readonly closed = output<void>();
  readonly saved = output<{ id: IDBValidKey; name: string; tag: string }>();

  readonly name = signal('');
  readonly error = signal('');
  readonly reading = signal(false);

  close() { this.closed.emit(); }

  onNameInput(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
  }

  async onSubmit(e: Event) {
    e.preventDefault();
    this.error.set('');

    const name = this.name().trim();
    if (!name) {
      this.error.set('Informe um nome para a chave.');
      return;
    }

    if (!this.nfc.isSupported()) {
      this.error.set('Web NFC não está disponível neste dispositivo/ambiente.');
      return;
    }

    try {
      this.reading.set(true);
      const uid = await this.nfc.readUid();
      if (!uid) {
        this.error.set('Não foi possível obter o UID da tag NFC.');
        return;
      }
      const id = await this.db.add({ name, tag: uid });
      this.saved.emit({ id, name, tag: uid });
      this.close();
    } catch (err) {
      this.error.set((err as Error)?.message || 'Falha ao ler UID via NFC.');
    } finally {
      this.reading.set(false);
    }
  }
}