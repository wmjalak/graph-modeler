import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { GMTimelineModel } from 'graph-modeler';
import { WorkFlowHistoryAdapter } from './workflowhistory-adapter';
import { JsonService } from './json.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  data: any;
  modelerEvent: any;
  jsonVisible = false;
  modelerData: GMTimelineModel;
  definitionSelection = ['definition_person'];
  workflowSelection = ['workflow_completed', 'workflow_error', 'workflow_empty'];
  adapterSelection = ['workflowhistory'];
  workFlowInstances: any[];
  @ViewChild('definitionJsonElement') definitionJsonElement: ElementRef;
  @ViewChild('workflowJsonElement') workflowJsonElement: ElementRef;
  @ViewChild('modelerJsonElement') modelerJsonElement: ElementRef;

  constructor(private jsonService: JsonService) {}

  ngOnInit() {
    forkJoin([
      this.jsonService.get(this.definitionSelection[0]),
      this.jsonService.get(this.workflowSelection[0])
    ]).subscribe(result => {
      this.setDefinitionJsonElement(result[0]);
      this.setWorkflowJsonElement(result[1]);
      this.buildModeler();
    });
  }

  onDefinitionChanged(selectedValue: any) {
    this.jsonService.get(selectedValue).subscribe(result => {
      this.setDefinitionJsonElement(result);
      this.buildModeler();
    });
  }

  onWorkflowChanged(selectedValue: any) {
    this.jsonService.get(selectedValue).subscribe(result => {
      this.setWorkflowJsonElement(result);
      this.buildModeler();
    });
  }

  onAdapterChanged(selectedValue: any) {}

  setDefinitionJsonElement(workflowJson: any) {
    this.definitionJsonElement.nativeElement.value = JSON.stringify(workflowJson, undefined, 2);
  }

  getDefinitionJsonElement(): any {
    return JSON.parse(this.definitionJsonElement.nativeElement.value);
  }

  setWorkflowJsonElement(workflowJson: any) {
    this.workflowJsonElement.nativeElement.value = JSON.stringify(workflowJson, undefined, 2);
  }

  getWorkflowJsonElement(): any {
    return JSON.parse(this.workflowJsonElement.nativeElement.value);
  }

  setModelerJsonElement(modelerJson: any) {
    this.modelerJsonElement.nativeElement.value = JSON.stringify(modelerJson, undefined, 2);
  }

  getModelerJsonElement(): any {
    return JSON.parse(this.modelerJsonElement.nativeElement.value);
  }

  buildModeler() {
    const definition = this.getDefinitionJsonElement();
    const workflow = this.getWorkflowJsonElement();
    const parseResult = WorkFlowHistoryAdapter.parse(workflow, definition);
    this.setModelerJsonElement(parseResult);
    this.modelerData = new GMTimelineModel(this.getModelerJsonElement());
  }

  refreshModelerData() {
    this.modelerData = new GMTimelineModel(this.getModelerJsonElement());
  }

  onModelerEvent(event: any) {
    this.modelerEvent = JSON.stringify(event);
  }
}
