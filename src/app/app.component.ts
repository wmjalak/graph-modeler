import { Component, ElementRef, ViewChild } from '@angular/core';

import { GMTimelineModel } from 'graph-modeler';
import { WorkFlowHistoryAdapter } from './workflowhistory-adapter';
import { JsonService } from './json.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data: any;
  modelerEvent: any;
  jsonVisible = false;
  modelerData: GMTimelineModel;
  rawJsonSelection = ['workflow_completed', 'workflow_error'];
  adapterSelection = ['workflowhistory'];
  @ViewChild('adjacencyListElement') adjacencyListElement: ElementRef;
  @ViewChild('rawJsonElement') rawJsonElement: ElementRef;

  constructor(private jsonService: JsonService) {}

  onSchemaChanged(selectedValue: any) {
    this.jsonService.get(selectedValue).subscribe(result => {
      this.rawJsonElement.nativeElement.value = JSON.stringify(result, undefined, 2);
      this.refreshDataFromRawJsonElement();
      this.refreshDataFromAdjancencyList();
    });
  }

  onRefreshRawJsonClicked() {
    this.refreshDataFromRawJsonElement();
    this.refreshDataFromAdjancencyList();
  }

  onRefreshModelerJsonClicked() {
    this.refreshDataFromAdjancencyList();
  }

  refreshDataFromRawJsonElement() {
    const parseResult = WorkFlowHistoryAdapter.parse(
      JSON.parse(this.rawJsonElement.nativeElement.value)
    );
    this.adjacencyListElement.nativeElement.value = JSON.stringify(parseResult, undefined, 2);
  }

  refreshDataFromAdjancencyList() {
    this.modelerData = new GMTimelineModel(
      JSON.parse(this.adjacencyListElement.nativeElement.value)
    );
  }

  onModelerEvent(event: any) {
    this.modelerEvent = JSON.stringify(event);
  }

  onAdapterChanged(selectedValue: any) {}
}
