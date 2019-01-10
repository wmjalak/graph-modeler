import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selection',
  template: `
    <select (change)="onSelectionChange($event)">
      <option *ngFor="let selection of selectionArray" [value]="selection">{{ selection }}</option>
    </select>
  `
})
export class SelectionComponent implements OnInit {
  @Input() selectionArray: string[];

  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSchemaChanged = new EventEmitter<string>();

  ngOnInit() {
    if (this.selectionArray) {
      this.changeSelection(this.selectionArray[0]); // load the first one automatically
    }
  }

  onSelectionChange(event: any) {
    this.changeSelection(event.target.value);
  }

  changeSelection(selectionValue: string) {
    this.onSchemaChanged.emit(selectionValue);
  }
}
