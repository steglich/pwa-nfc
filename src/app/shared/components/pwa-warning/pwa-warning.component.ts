import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { InstallService, NfcService } from '@core';

@Component({
  selector: 'app-pwa-warning',
  template: `
    <div class="warning">
      @if (!nfcSupported()) {
        <h2>Aatenção</h2>
        <div class="nfc-alert">Seu dispositivo não é compatível com NFC. Recursos de aproximação ficarão indisponíveis.</div>
      } @else {
        <h2>Aatenção</h2>
        <div class="nfc-required">Para acessar o sistema, mantenha o NFC ligado.</div>
      }

      @if (canInstall()) {
        <h2>Instale o aplicativo</h2>
        <p>Para usar este sistema, acesse pelo app instalado (PWA). Adicione à tela inicial e abra por lá.</p>
        <button class="install" (click)="onInstall()" [disabled]="installing()">Instalar</button>
        <p class="hint">Se não aparece o botão, use o menu "Adicionar à tela inicial" do navegador.</p>
      }

      @if (installed()) {
        <p class="success">Aplicativo instalado!</p>
      }
    </div>
  `,
  styles: [`
    .warning { padding: 24px; margin: 18vh 12px; text-align: center; background: #7E57C2; border-radius: 16px; color: #fff; box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
    h2 { margin: 0 0 10px; font-size: 20px; font-weight: 700; letter-spacing: 0.2px; }
    .install { margin-top: 12px; padding: 10px 14px; border-radius: 10px; border: none; background: #fff; color: #7E57C2; font-weight: 600; box-shadow: 0 2px 6px rgba(0,0,0,0.15); }
    .install:active { transform: scale(0.98); }
    .hint { margin-top: 10px; font-size: 12px; color: rgba(255,255,255,0.9); }
    .success { margin-top: 12px; font-size: 13px; color: #d1fae5; }
    .nfc-alert { margin-top: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.35); color: #fff; }
    .nfc-required { margin-top: 12px; padding: 10px 14px; border-radius: 10px; background: rgba(0,0,0,0.18); border: 1px solid rgba(255,255,255,0.35); color: #fff; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PwaWarningComponent {
  private readonly installSvc = inject(InstallService);
  private readonly nfc = inject(NfcService);

  readonly canInstall = computed(() => this.installSvc.canInstall());
  readonly installing = computed(() => this.installSvc.installing());
  readonly installed = computed(() => this.installSvc.installed());
  readonly nfcSupported = computed(() => this.nfc.supported());

  async onInstall() { await this.installSvc.install(); }
}