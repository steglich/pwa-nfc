import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AppVersionInfo {
  version: string;
  build?: { time?: string; hash?: string };
}

@Injectable({ providedIn: 'root' })
export class VersionService {
  private readonly http = inject(HttpClient);
  private readonly current = signal<AppVersionInfo | null>(null);

  readonly version = computed(() => this.current()?.version ?? '');
  readonly buildTime = computed(() => this.current()?.build?.time ?? '');
  readonly buildHash = computed(() => this.current()?.build?.hash ?? '');

  async load(): Promise<void> {
    try {
      const data = await this.http.get<AppVersionInfo>('/version.json', { headers: { 'cache-control': 'no-cache' } }).toPromise();
      this.current.set(data ?? null);
    } catch {
      // ignore
    }
  }
}