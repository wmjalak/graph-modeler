import {
  Component,
  ElementRef,
  ViewChild,
  EventEmitter,
  Input,
  AfterViewInit,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

import { version } from './utilities/version';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import * as cytoscape_ from 'cytoscape';
const cytoscape = cytoscape_;

import * as dagre from 'cytoscape-dagre';

import { GraphModelerHelper, ModelerEdgeCurveType } from './graph-modeler.helper';
import { GraphModelerSettings } from './graph-modeler.settings';

@Component({
  selector: 'vn-graph-modeler',
  template: `
    <div #cy id="cy">
      <span style="display: none">graph-modeler {{ versionString }}</span>
    </div>
  `,
  styleUrls: ['./graph-modeler.component.css']
})
export class GraphModelerComponent implements OnInit, OnDestroy, AfterViewInit {
  versionString = version;

  @ViewChild('cy') cyElement: ElementRef;

  resizeObservable$: Observable<Event>;
  resizeSubscription$: Subscription;

  dataValue: any;
  @Input()
  set data(value: any) {
    this.dataValue = value;
    if (this.cy) {
      this.refresh();
    }
  }

  get data(): any {
    return this.dataValue;
  }

  @Output() selected = new EventEmitter();

  cy: any;

  readOnlyValue = true;
  @Input()
  set readOnly(value: boolean) {
    this.readOnlyValue = value;
    if (this.cy) {
      this.cy.autoungrabify(this.readOnly);
      this.cy.panningEnabled(!this.readOnly);
    }
  }
  get readOnly(): boolean {
    return this.readOnlyValue;
  }

  scaleValue: number;
  @Input()
  set scale(value: number) {
    if (this.cy) {
      this.scaleValue = !this.scaleValue ? this.cy.zoom() : this.scaleValue;
      this.cy.zoom(this.scaleValue * value);
    }
  }
  get scale(): number {
    return this.scaleValue;
  }

  openedNodes: string[] = [];
  xDistance = 0;
  nodeYPosition = 0;

  ngOnInit() {
    this.resizeObservable$ = fromEvent(window, 'resize').pipe(debounceTime(200));
    this.resizeSubscription$ = this.resizeObservable$.subscribe(evt => {
      this.fitNodes();
    });
  }

  ngAfterViewInit() {
    this.createCytoscape();
  }

  ngOnDestroy() {
    this.resizeSubscription$.unsubscribe();
    this.destroyCytoscape();
  }

  refresh() {
    this.destroyCytoscape();
    this.createCytoscape();
  }

  private fitNodes() {
    if (this.cy) {
      this.cy.animate(
        {
          fit: {
            eles: this.cy.nodes()
          }
        },
        {
          duration: 400
        }
      );
    }
  }

  private createCytoscape() {
    this.openedNodes = [];
    cytoscape.use(dagre); // register extension
    this.cy = cytoscape(
      GraphModelerSettings.properties(this.cyElement.nativeElement, <cytoscape.ElementsDefinition>(
        GraphModelerHelper.getAsCytoscapeFormat(this.data)
      ))
    );

    const nodes = this.cy.nodes();
    if (nodes && nodes.length > 2) {
      this.xDistance = nodes[1].position('x') - nodes[0].position('x');
      this.nodeYPosition = nodes[1].position('y');
    }

    nodes.forEach((node: any, index: number) => {
      const expanded = node.data().expanded;
      if (expanded && expanded === true && index > 0) {
        this.toggleNode(nodes[index - 1]);
      }
    });

    this.cy.on('tap', 'node', (evt: any) => {
      const node = evt.target;
      this.selected.emit(node.data());
      this.toggleNode(node);
    });
  }

  private destroyCytoscape() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  private toggleNode(node: any) {
    const id = node.id();

    const isOpen = GraphModelerHelper.includes(this.openedNodes, id);
    if (isOpen) {
      this.openedNodes = this.openedNodes.filter(item => item !== id);
    } else {
      this.openedNodes.push(id);
    }

    const nextNode = this.getNextNode(id);

    // GraphModelerHelper.shiftBaseNodes(this.cy, node, nextNode, !isOpen, this.xDistance);

    const nextNodeHasSubnodes = nextNode
      ? nextNode.data().subNodes && nextNode.data().subNodes.length > 0
      : false;

    if (!isOpen && nextNodeHasSubnodes) {
      GraphModelerHelper.shiftBaseNodes(this.cy, node, nextNode, !isOpen, this.xDistance);
      GraphModelerHelper.handleStraightEdges(this.cy, true, node, nextNode);
      this.drawActions(node, nextNode);
    } else if (isOpen) {
      if (nextNode) {
        GraphModelerHelper.removeActionNodes(this.cy, node, nextNode);
        GraphModelerHelper.shiftBaseNodes(this.cy, node, nextNode, !isOpen, this.xDistance);
        GraphModelerHelper.handleStraightEdges(this.cy, false, node, nextNode);
      }
    }
    this.fitNodes();
  }

  private drawActions(node: any, nextNode: any /*, subNodes: any[]*/) {
    const items: any[] = [];

    const nodeXPosition = node.position('x');

    const nextNodeId = nextNode.id();

    const subNodes = [...nextNode.data().subNodes];

    const edgeSources: string[] = [];
    edgeSources.push(node.id());

    subNodes.forEach((subNode, index) => {
      const data = { ...subNode.data };
      data.parentId = nextNodeId;
      items.push({
        group: 'nodes',
        data: data,
        position: {
          x: nodeXPosition + (index + 1) * this.xDistance,
          y: this.nodeYPosition + 25
        }
      });

      edgeSources.push(subNode.data.id);

      items.push(
        GraphModelerHelper.getEdge(
          edgeSources[index],
          edgeSources[index + 1],
          index === 0 ? ModelerEdgeCurveType.CURVE_DOWN : ModelerEdgeCurveType.STRAIGHT
        )
      );
    });

    if (subNodes.length > 0) {
      // add last edge
      items.push(
        GraphModelerHelper.getEdge(
          edgeSources[edgeSources.length - 1],
          nextNode.id(),
          ModelerEdgeCurveType.CURVE_UP
        )
      );
    }

    this.cy.add(items);
  }

  private getNextNode(id: string): any {
    const nodeIndex = this.data.nodes.findIndex(node => node.data.id === id);
    if (nodeIndex > -1 && nodeIndex + 1 < this.data.nodes.length) {
      const nextNodeId = this.data.nodes[nodeIndex + 1].data.id;
      return this.cy.getElementById(nextNodeId);
    }
    return undefined;
  }
}
