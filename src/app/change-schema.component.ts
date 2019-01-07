import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { JsonService } from './json.service';

@Component({
  selector: 'app-change-schema',
  template: `
    <select (change)="onSelectionChange($event)">
      <option *ngFor="let example of examples" [value]="example">{{
        example
      }}</option>
    </select>
  `
})
export class ChangeSchemaComponent implements OnInit {
  // tslint:disable-next-line:no-output-on-prefix
  @Output() onSchemaChanged = new EventEmitter<any>();

  examples: string[] = ['workflow_completed', 'workflow_error'];

  constructor(private jsonService: JsonService) {}

  ngOnInit() {
    this.changeSelection(this.examples[0]); // load the first one automatically
  }

  onSelectionChange(event: any) {
    this.changeSelection(event.target.value);
  }

  changeSelection(selectionValue: string) {
    this.jsonService.get(selectionValue).subscribe(result => {
      this.onSchemaChanged.emit(result);
    });
  }
}
