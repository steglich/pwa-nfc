import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NfcService {
  readonly supported = signal<boolean>(this.detectSupport());

  isSupported(): boolean {
    return this.supported();
  }

  private detectSupport(): boolean {
    const hasWindow = typeof window !== 'undefined';
    const secure = hasWindow && window.isSecureContext === true;
    const hasNdefReader = hasWindow && 'NDEFReader' in (window as any);
    return secure && hasNdefReader;
  }

  async readText(): Promise<string> {
    if (!this.isSupported()) throw new Error('Web NFC não suportado neste dispositivo/ambiente.');
    const NDEFReaderCtor = (window as any).NDEFReader as { new(): any };
    const ndef = new NDEFReaderCtor();

    return new Promise<string>(async (resolve, reject) => {
      try {
        ndef.onreadingerror = () => reject(new Error('Falha ao ler tag NFC. Aproximar e tentar novamente.'));
        ndef.onreading = (event: any) => {
          try {
            const text = this.extractFirstTextRecord(event?.message?.records ?? []);
            if (text) resolve(text);
            else reject(new Error('Nenhum registro de texto encontrado na tag.'));
          } catch (e) {
            reject(e as Error);
          }
        };
        await ndef.scan();
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  async readUid(): Promise<string> {
    if (!this.isSupported()) throw new Error('Web NFC não suportado neste dispositivo/ambiente.');
    const NDEFReaderCtor = (window as any).NDEFReader as { new(): any };
    const ndef = new NDEFReaderCtor();

    return new Promise<string>(async (resolve, reject) => {
      try {
        ndef.onreadingerror = () => reject(new Error('Falha ao ler UID da tag. Aproximar e tentar novamente.'));
        ndef.onreading = (event: any) => {
          const serial = event?.serialNumber ?? event?.tag?.id ?? null;
          if (serial && typeof serial === 'string' && serial.length > 0) {
            resolve(serial);
          } else {
            reject(new Error('UID da tag não disponível neste leitor/tag.'));
          }
        };
        await ndef.scan();
      } catch (e) {
        reject(e as Error);
      }
    });
  }

  async writeText(text: string): Promise<void> {
    if (!this.isSupported()) throw new Error('Web NFC não suportado neste dispositivo/ambiente.');
    const NDEFReaderCtor = (window as any).NDEFReader as { new(): any };
    const ndef = new NDEFReaderCtor();

    // Escreve um registro de texto simples
    await ndef.write({ records: [{ recordType: 'text', data: text }] });
  }

  private extractFirstTextRecord(records: any[]): string | null {
    for (const record of records ?? []) {
      if (record?.recordType === 'text') {
        if (record?.data instanceof DataView) {
          return new TextDecoder(record?.encoding || 'utf-8').decode(record.data);
        }
        if (typeof record?.data === 'string') return record.data;
      }
      if (record?.data instanceof DataView) {
        try { return new TextDecoder('utf-8').decode(record.data); } catch {}
      }
    }
    return null;
  }
}