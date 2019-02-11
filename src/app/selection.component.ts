import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selection',
  template: `
    <select (change)="onSelectionChange($event)">
    <option *ngFor="let selection of selectionArray" [value]="selection">{{ selection }}</option>
    </select>
  `
})
export class SelectionComponent {
  @Input() selectionArray: string[];

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onChanged = new EventEmitter<string>();

  onSelectionChange(event: any) {
    this.changeSelection(event.target.value);
  }

  changeSelection(selectionValue: string) {
    this.onChanged.emit(selectionValue);
  }
}
