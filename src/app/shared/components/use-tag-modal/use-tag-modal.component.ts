import { Component, ChangeDetectionStrategy, input, output, inject, signal, OnInit } from '@angular/core';
import { NfcService } from '@core/nfc.service';

@Component({
  selector: 'app-use-tag-modal',
  template: `
    <div class="backdrop" (click)="close()"></div>
    <div class="modal" role="dialog" aria-modal="true" aria-labelledby="useKeyTitle">
      <h2 id="useKeyTitle">Pronto para usar</h2>
      <p>Aproxime o celular da tag do portão para validar esta chave.</p>

      <div class="details">
        @if (name()) { <div class="row"><span class="label">Chave:</span> <span class="value">{{ name() }}</span></div> }
      </div>

      @if (status()) { <p class="status">{{ status() }}</p> }
      @if (error()) { <p class="error">{{ error() }}</p> }

    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; display: grid; place-items: center; z-index: 2000; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); }
    .modal { position: relative; width: calc(100% - 24px); max-width: 420px; background: #ffffff; color: #333; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.25); padding: 16px; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    p { font-size: 14px; color: #444; }
    .details { margin-top: 8px; display: grid; gap: 6px; }
    .row { display: flex; gap: 6px; font-size: 13px; }
    .label { color: #666; }
    .value { font-weight: 600; }
    .actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 12px; }
    .cancel { background: transparent; border: 1px solid #ccc; padding: 8px 12px; border-radius: 8px; }
    .confirm { background: #7E57C2; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; }
    .status { font-size: 12px; color: #555; }
    .error { font-size: 12px; color: #d32f2f; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UseTagModalComponent implements OnInit {
  private readonly nfc = inject(NfcService);

  id = input<IDBValidKey>();
  name = input<string>('');
  tag = input<string>('');

  readonly closed = output<void>();

  readonly status = signal('');
  readonly error = signal('');
  readonly reading = signal(false);

  ngOnInit(): void {
    this.validateUid();
  }

  close() { this.closed.emit(); }

  private async validateUid() {
    this.error.set('');
    if (!this.nfc.isSupported()) {
      this.error.set('Web NFC não está disponível neste dispositivo/ambiente.');
      return;
    }
    const expected = this.tag();
    if (!expected) {
      this.error.set('UID esperado vazio.');
      return;
    }
    try {
      this.reading.set(true);
      this.status.set('Aproxime a tag do portão para leitura...');
      const uid = await this.nfc.readUid();
      if (uid === expected) {
        this.status.set('UID validado com sucesso.');
      } else {
        this.error.set(`UID diferente. Lido: ${uid}`);
      }
    } catch (err) {
      this.error.set((err as Error)?.message || 'Falha ao ler UID via NFC.');
    } finally {
      this.reading.set(false);
    }
  }
}