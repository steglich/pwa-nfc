import { Component, ChangeDetectionStrategy, signal, computed, inject, type Signal } from '@angular/core';
import { VersionService } from './core/version.service';
import { SwUpdate } from '@angular/service-worker';
import { HeaderComponent } from '@shared/components/header/header.component';
import { CardComponent } from '@shared/components/card/card.component';
import { PwaWarningComponent } from '@shared/components/pwa-warning/pwa-warning.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { AddTagModalComponent, ConfirmDeleteModalComponent, UseTagModalComponent } from '@shared/components';
import { NfcService, IndexedDBService } from '@core';

function isStandalonePwa(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HeaderComponent, CardComponent, PwaWarningComponent, FooterComponent, AddTagModalComponent, ConfirmDeleteModalComponent, UseTagModalComponent]
})
export class App {
  private readonly versionService = inject(VersionService);
  private readonly swUpdate = inject(SwUpdate);
  private readonly nfc = inject(NfcService);
  private readonly db = inject(IndexedDBService);

  readonly updateAvailable = signal(false);
  readonly installingUpdate = signal(false);
  readonly isPwa = signal(isStandalonePwa());
  readonly nfcSupported = computed(() => this.nfc.supported());
  readonly showAddModal = signal(false);
  readonly showDeleteModal = signal(false);
  readonly showUseModal = signal(false);
  readonly selectedId = signal<IDBValidKey | null>(null);
  readonly selectedTag = signal<{ id: IDBValidKey; name: string; tag: string } | null>(null);

  readonly tags = signal<Array<{ id: IDBValidKey; name: string; tag: string }>>([]); 

  get version(): Signal<string> { return this.versionService.version; }
  get buildTime(): Signal<string> { return this.versionService.buildTime; }
  get buildHash(): Signal<string> { return this.versionService.buildHash; }

  constructor() {
    this.versionService.load();

    // Load tags from IndexedDB and map to card data
    this.loadFromDb();

    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe(event => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable.set(true);
        }
      });
      this.swUpdate.checkForUpdate().catch(() => {});
    }

    window.addEventListener('appinstalled', () => this.isPwa.set(true));
  }

  private async loadFromDb() {
    try {
      const records = await this.db.getAll<{ id: number; name: string; tag: string }>();
      const mapped = (records ?? []).map(r => ({ id: r.id, name: r.name, tag: r.tag }));
      this.tags.set(mapped);
    } catch {
      // ignore load failures
    }
  }

  async applyUpdate() {
    try {
      this.installingUpdate.set(true);
      await this.swUpdate.activateUpdate();
      document.location.reload();
    } catch {
      this.installingUpdate.set(false);
    }
  }

  onAdd() { this.showAddModal.set(true); }
  closeAddModal() { this.showAddModal.set(false); }

  async onSaved(event: { id: IDBValidKey; name: string; tag: string }) {
    await this.loadFromDb();
    this.closeAddModal();
  }

  onDeleteRequest(id: IDBValidKey) {
    this.selectedId.set(id);
    this.showDeleteModal.set(true);
  }

  onDeleteClosed() {
    this.showDeleteModal.set(false);
    this.selectedId.set(null);
  }

  onDeleteConfirmed() {
    // After IndexedDB deletion happens inside modal, refresh the list from DB
    this.onDeleteClosed();
    this.loadFromDb();
  }

  onUseRequest(id: IDBValidKey) {
    const tag = this.tags().find(i => i.id === id) ?? null;
    this.selectedTag.set(tag);
    this.showUseModal.set(true);
  }

  closeUseModal() {
    this.showUseModal.set(false);
    this.selectedTag.set(null);
  }
}
