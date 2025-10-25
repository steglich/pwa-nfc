# PWA NFC

Projeto Angular standalone com PWA e Service Worker, organizado para escala e manutenção.

## Estrutura de pastas

```
src/
  app/
    core/              # Serviços e lógica de domínio
      version.service.ts
      index.ts
    shared/            # Componentes reutilizáveis e utilidades
      components/
        header.component.ts
        card.component.ts
        pwa-warning.component.ts
      index.ts
    app.ts             # Componente raiz (standalone)
    app.html           # Template raiz
    app.css            # Estilos do app
    app.config.ts      # Providers e configuração da aplicação
  main.ts              # Bootstrap da aplicação
  index.html           # Shell do app
  styles.css           # Estilos globais
```

## Aliases de import

Configurados em `tsconfig.json` para facilitar imports e evitar caminhos relativos profundos:

```
"baseUrl": "src",
"paths": {
  "@core": ["app/core"],
  "@shared": ["app/shared"],
  "@core/*": ["app/core/*"],
  "@shared/*": ["app/shared/*"]
}
```

Exemplos de uso:

```
import { VersionService } from './core/version.service'; // para DI (evita análise estática quebrar)
import { HeaderComponent } from '@shared/components/header.component';
import { CardComponent } from '@shared/components/card.component';
import { PwaWarningComponent } from '@shared/components/pwa-warning.component';
```

...

Observação: para propriedades `imports` em componentes standalone, prefira imports com caminho direto da classe (evita problemas de análise estática do Angular com barrels).

## Desenvolvimento

- `npm run start` para iniciar `ng serve` (Service Worker habilita no build prod).
- App usa sinais (`signal`, `computed`) e `ChangeDetectionStrategy.OnPush`.
- Atualização de versão é lida de `public/version.json` via `VersionService`.

## Boas práticas aplicadas

- Standalone components e providers via `app.config.ts`.
- Estrutura core/shared para separar domínio e UI reutilizável.
- Tipagem estrita em TypeScript e sinais para estado local.
- Controle de fluxo nativo (`@if`, `@for`) no template.

## PWA

- `ngsw-config.json` configurado e registrado apenas fora de dev (`enabled: !isDevMode()`).
- Banner de atualização quando `ServiceWorker` detecta nova versão.

## Scripts

- `scripts/version.js` popula `public/version.json` em `prestart/prebuild`.

## Deploy em HostGator (Apache)

- Gere build de produção:
  - `npm run build:hostgator` (equivalente ao `ng build --configuration production --base-href /`).
- Copie o conteúdo de `dist/pwa-nfc/` para o diretório público do seu domínio (por exemplo, `public_html/` ou subpasta do site).
- Inclua o arquivo `public/.htaccess` no diretório raiz publicado para suportar SPA e PWA:

```
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  RewriteRule ^(ngsw\.json|ngsw-worker\.js|manifest\.webmanifest|favicon\.ico)$ - [L]
  RewriteRule . /index.html [L]
</IfModule>
```

- SSL: habilite HTTPS no seu domínio pela HostGator (Let’s Encrypt ou certificado próprio). Web NFC e Service Worker exigem contexto seguro.
- Se publicar em subpasta (ex: `/apps/pwa-nfc/`), ajuste `--base-href /apps/pwa-nfc/` e atualize `RewriteBase /apps/pwa-nfc/` no `.htaccess` correspondente.
- Se usar subdomínio, mantenha `--base-href /` e o `.htaccess` com `RewriteBase /`.

## Observações

- Web NFC (`NDEFReader`) só funciona em ambientes suportados e em contexto seguro (HTTPS).
- Se rotas do Angular retornarem 404, confirme se o `.htaccess` está no mesmo diretório do `index.html` publicado e se o `mod_rewrite` está habilitado.
