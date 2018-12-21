import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { version } from './utilities/version';

import * as cytoscape_ from 'cytoscape';
const cytoscape = cytoscape_;

import * as dagre from 'cytoscape-dagre';

import { ModelerModel } from './graph-modeler.types';
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
export class GraphModelerComponent {
  versionString = version;

  @Input()
  set data(value: ModelerModel) {
    this.renderGraph(value);
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

  renderGraph(graphData: any) {
    cytoscape.use(dagre); // register extension

    const element = document.getElementById('cy');
    this.cy = cytoscape(GraphModelerSettings.properties(element, graphData));

    console.log(this.cy.zoom());
    this.cy.on('tap', 'node', evt => {
      const node = evt.target;
      const id = node.id();
      this.selected.emit(id);

      // toggle subnodes for ID
      const isOpen = GraphModelerHelper.includes(this.openedNodes, id);
      if (isOpen) {
        this.openedNodes = this.openedNodes.filter(item => item !== id);
      } else {
        this.openedNodes.push(id);
      }
      this.toggleParentNode(isOpen, node);
    });

    const nodes = this.cy.nodes();
    if (nodes && nodes.length > 2) {
      this.xDistance = nodes[1].position('x') - nodes[0].position('x');
      this.nodeYPosition = nodes[1].position('y');
    }

    // console.log(this.cy.nodes());
    /*
    this.cy.add({
      group: 'nodes',
      data: {
        id: '122',
        name: 'hello',
        shapeType: 'ellipse',
        borderColor: 'blue',
        weigth: 15,
        backgroundColor: 'blue',
        backgroundOpacity: '1'
      },
      position: { x: 20, y: 20 }
  });
  */
  }

  toggleParentNode(isOpen: boolean, node: any) {
    console.log('openParentNode');
    const id = node.id();

    const connectedEdges = node.connectedEdges(el => {
      return !el.target().anySame(node);
    });
    console.log(connectedEdges);
    console.log(connectedEdges.target());

    const target = connectedEdges.target();

    this.toggleXSpace(isOpen, id);
    const nextNode = this.getNextNode(id);

    if (!isOpen && target) {
      this.cy.remove(connectedEdges); // remove connected edged
      this.drawActions(node, nextNode);
    } else if (isOpen) {
      // TODO
      if (nextNode) {
        // remove nodes
        this.removeActionNodes(id);
        this.cy.add(GraphModelerHelper.getEdge(id, nextNode.id(), ModelerEdgeCurveType.STRAIGHT));
      }
    }

    this.cy.animate(
      {
        fit: {
          eles: this.cy.nodes()
        }
      },
      {
        duration: 500
      }
    );
  }

  drawActions(node: any, nextNode: any /*, subNodes: any[]*/) {
    const items: any[] = [];

    const nodeXPosition = node.position('x');

    const subNodes = [...nextNode.data().subNodes];

    const edgeSources: string[] = [];
    edgeSources.push(node.id());

    subNodes.forEach((subNode, index) => {
      items.push({
        group: 'nodes',
        data: subNode.data,
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
      /* add last edge */
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

  toggleXSpace(isOpen: boolean, id: string) {
    const nodes = this.cy.nodes();
    const distance = isOpen ? -this.xDistance : this.xDistance;
    let nodeFound = false;
    let itemCount = 0;
    for (let index = 0; index < nodes.length; index++) {
      if (nodeFound && itemCount === 0) {
        if (nodes[index].data().subNodes) {
          // get next subNodes count
          itemCount = nodes[index].data().subNodes.length;
        }
      }
      if (nodeFound && itemCount !== 0) {
        nodes[index].shift('x', distance * itemCount);
      }
      if (nodes[index].id() === id) {
        nodeFound = true;
      }
    }
  }

  removeActionNodes(id: string) {
    const nodes = this.cy.nodes();
    let nodeFound = false;
    const removableNodes: any[] = [];
    for (let index = 0; index < nodes.length; index++) {
      if (nodeFound) {
        if (!nodes[index].data().subNodes) {
          removableNodes.push(nodes[index]);
        }
      }
      if (nodes[index].id() === id) {
        nodeFound = true;
      }
    }
    console.log(removableNodes);
    removableNodes.forEach(removableNode => {
      this.cy.remove(removableNode);
    });
  }

  getNextNode(id: string): any {
    let nextNode: any;
    let nodeFound = false;
    const nodes = this.cy.nodes();
    for (let index = 0; index < nodes.length; index++) {
      if (nodeFound) {
        nextNode = nodes[index];
        break;
      }
      if (nodes[index].id() === id) {
        nodeFound = true;
      }
    }
    return nextNode;
  }
}
