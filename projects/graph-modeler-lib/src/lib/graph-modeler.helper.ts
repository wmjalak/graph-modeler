import { GMTimelineModel } from './graph-modeler.types';
import { ElementsDefinition, EdgeDefinition } from 'cytoscape';

export enum ModelerEdgeCurveType {
  STRAIGHT,
  CURVE_DOWN,
  CURVE_UP
}

export class GraphModelerHelper {
  static includes(stringArray: string[], value: string): boolean {
    return stringArray && stringArray.length > 0
      ? stringArray.findIndex(s => s === value) > -1
      : false;
  }

  static handleStraightEdges(cytoscapeInstance: any, open: boolean, node: any, nextNode: any) {
    if (open) {
      const connectedEdges = node.connectedEdges(el => {
        return !el.target().anySame(node);
      });
      // cytoscapeInstance.remove(connectedEdges);
      connectedEdges.animate(
        {
          position: nextNode.position(),
          css: {
            opacity: 0
          }
        },
        {
          duration: 100,
          complete: () => {
            cytoscapeInstance.remove(connectedEdges);
          }
        }
      );
    } else {
      cytoscapeInstance.add(
        GraphModelerHelper.getEdge(node.id(), nextNode.id(), ModelerEdgeCurveType.STRAIGHT)
      );
    }
  }

  static getEdge(source: string, target: string, curveType: ModelerEdgeCurveType): EdgeDefinition {
    return {
      group: 'edges',
      data: {
        source: source,
        target: target,
        curve: curveType === ModelerEdgeCurveType.STRAIGHT ? 'bezier' : 'unbundled-bezier',
        controlPointDistances:
          curveType === ModelerEdgeCurveType.STRAIGHT
            ? [0.5]
            : curveType === ModelerEdgeCurveType.CURVE_DOWN
            ? [-5, 5]
            : [5, -5],
        controlPointWeights: curveType === ModelerEdgeCurveType.STRAIGHT ? [0.5] : [0.25, 0.75]
      }
    };
  }

  static shiftBaseNodes(
    cytoscapeInstance: any,
    node: any,
    nextNode: any,
    open: boolean,
    xDistance: number
  ) {
    const distance = open ? xDistance : -xDistance;
    const parentNodes: string[] = [];
    let nodeFound = false;
    const shiftCount = nextNode ? nextNode.data().subNodes.length : 0;

    cytoscapeInstance.nodes().forEach(ele => {
      if (!nodeFound) {
        const id = ele.id();
        if (id === node.id()) {
          nodeFound = true;
        }
      } else if (nodeFound) {
        const id = ele.id();
        const parentId = ele.data().parentId;
        if (parentId === undefined) {
          parentNodes.push(id);
        }
        if (
          parentId === undefined ||
          (parentId && GraphModelerHelper.includes(parentNodes, parentId))
        ) {
          ele.shift('x', distance * shiftCount);
        }
      }
    });
  }

  static removeActionNodes(cytoscapeInstance: any, node: any, nextNode: any) {
    if (nextNode) {
      const nextNodeId = nextNode.id();
      const nodes = cytoscapeInstance.filter('node[parentId = "' + nextNodeId + '"]');
      nodes.remove();
    }
  }

  static getAsCytoscapeFormat(data: any): ElementsDefinition {
    if (data instanceof GMTimelineModel) {
      return this.getFromGMTimelineModel(data);
    }
  }

  static getFromGMTimelineModel(data: GMTimelineModel): ElementsDefinition {
    const result: ElementsDefinition = {
      nodes: [],
      edges: []
    };

    data.nodes.forEach((node, index) => {
      result.nodes.push(node);

      const nodeCount = result.nodes.length;

      if (nodeCount > 1) {
        result.edges.push({
          data: {
            source: result.nodes[nodeCount - 2].data.id,
            target: result.nodes[nodeCount - 1].data.id,
            curve: 'bezier',
            controlPointDistances: [0.5],
            controlPointWeights: [0.5]
          }
        });
      }
    });

    return result;
  }
}
