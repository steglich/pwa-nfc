import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <article class="card">
      <a class="card-header" (click)="onUseClick($event)">
        <div class="title"><span class="material-symbols-outlined contactless-icon">contactless</span>{{ name() }}</div>
        <div class="card-actions">
          <button class="icon-btn delete-btn" type="button" aria-label="Excluir" (click)="onDeleteClick($event)">
            <span class="material-symbols-outlined">delete</span>
          </button>
        </div>
      </a>
    </article>
  `,
  styles: [`
    .card { background: #7E57C2; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 12px; margin: 8px 12px; color: #ffffffff; }
    .card-header { display: flex; align-items: center; justify-content: space-between; }
    .title { font-weight: 600; font-size: 14px; display: flex; align-items: center; }
    .card-actions { display: flex; align-items: center; gap: 6px; }
    .icon-btn { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #ffffffff; display: flex; align-items: center; justify-content: center; }
    .icon-btn:active { transform: scale(0.96); }
    .delete-btn { background-color: #f44336; }
    .contactless-icon { margin-right: 10px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent {
  name = input<string>('');
  id = input<IDBValidKey>(0);

  readonly delete = output<IDBValidKey>();
  readonly use = output<IDBValidKey>();

  onDeleteClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.id());
  }

  onUseClick(event: Event) {
    this.use.emit(this.id());
    event.preventDefault();
  }
}