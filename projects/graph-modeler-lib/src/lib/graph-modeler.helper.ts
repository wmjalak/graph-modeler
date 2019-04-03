import { GMTimelineModel } from './graph-modeler.types';
import { ElementsDefinition, EdgeDefinition } from 'cytoscape';

export enum ModelerEdgeCurveType {
  STRAIGHT,
  CURVE_DOWN,
  CURVE_UP
}

const CurveTypeDistances = {
  STRAIGHT: [0.5],
  CURVE_DOWN: [-9, 7],
  CURVE_UP: [7, -9]
};

const CurveTypeWeights = {
  STRAIGHT: [0.5],
  OTHER: [0.25, 0.75]
};

export class GraphModelerHelper {
  static includes(stringArray: string[], value: string): boolean {
    return stringArray && stringArray.length > 0
      ? stringArray.findIndex(s => s === value) > -1
      : false;
  }

  static handleSubNodes(
    cytoscapeInstance: any,
    doOpen: boolean,
    node: any,
    nextNode: any,
    nodeXDistance: number,
    nodeYPosition: number
  ): any {
    if (!doOpen) {
      if (nextNode) {
        const nodes = cytoscapeInstance.filter('node[parentId = "' + nextNode.id() + '"]');
        nodes.remove(); // remove subnodes
      }
      return cytoscapeInstance.nodes();
    }
    const items: any[] = [];

    const nodeXPosition = node.position('x');

    const nextNodeId = nextNode.id();

    const subNodes = [...nextNode.data().subNodes];

    const edgeSources: any[] = [];
    edgeSources.push(node.data());
    subNodes.forEach((subNode, index) => {
      const data = { ...subNode.data };
      data.parentId = nextNodeId;
      items.push({
        group: 'nodes',
        data: data,
        position: {
          x: nodeXPosition + (index + 1) * nodeXDistance,
          y: nodeYPosition + 25
        }
      });

      edgeSources.push(data);

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
          nextNode.data(),
          ModelerEdgeCurveType.CURVE_UP
        )
      );
    }

    cytoscapeInstance.add(items);
    return cytoscapeInstance.nodes();
  }

  static handleStraightEdges(cytoscapeInstance: any, doOpen: boolean, node: any, nextNode: any) {
    if (doOpen) {
      const connectedEdges = node.connectedEdges(el => {
        return !el.target().anySame(node);
      });
      cytoscapeInstance.remove(connectedEdges);
    } else {
      cytoscapeInstance.add(
        GraphModelerHelper.getEdge(node.data(), nextNode.data(), ModelerEdgeCurveType.STRAIGHT)
      );
    }
  }

  static getEdge(source: any, target: any, curveType: ModelerEdgeCurveType): EdgeDefinition {
    const hasSubNodes = target.subNodes && target.subNodes.length > 0;
    return {
      group: 'edges',
      data: {
        source: source.id,
        target: target.id,
        color: source.baseColor,
        curve: curveType === ModelerEdgeCurveType.STRAIGHT ? 'bezier' : 'unbundled-bezier',
        controlPointDistances:
          curveType === ModelerEdgeCurveType.STRAIGHT
            ? CurveTypeDistances.STRAIGHT
            : curveType === ModelerEdgeCurveType.CURVE_DOWN
            ? CurveTypeDistances.CURVE_DOWN
            : CurveTypeDistances.CURVE_UP,
        controlPointWeights:
          curveType === ModelerEdgeCurveType.STRAIGHT
            ? CurveTypeWeights.STRAIGHT
            : CurveTypeWeights.OTHER,
        level:
          curveType === ModelerEdgeCurveType.CURVE_DOWN
            ? 'curve-down'
            : hasSubNodes && curveType === ModelerEdgeCurveType.STRAIGHT
            ? 'top'
            : '',
        lineStyle: !source.executed && !target.executed ? 'dashed' : 'solid'
      }
    };
  }

  static shiftBaseNodes(
    cytoscapeInstance: any,
    doOpen: boolean,
    currentNode: any,
    nextNode: any,
    xDistance: number
  ) {
    const parentNodes: string[] = [];
    let nodeFound = false;

    cytoscapeInstance.nodes().forEach((node: any) => {
      const id = node.id();
      if (!nodeFound) {
        if (id === currentNode.id()) {
          nodeFound = true;
        }
      } else if (nodeFound) {
        const parentId = node.data().parentId;
        if (parentId === undefined) {
          parentNodes.push(id);
        }
        if (
          parentId === undefined ||
          (parentId && GraphModelerHelper.includes(parentNodes, parentId))
        ) {
          const distance = doOpen ? xDistance : -xDistance;
          const shiftCount = nextNode ? nextNode.data().subNodes.length : 0;
          node.shift('x', distance * shiftCount);
        }
      }
    });
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
        result.edges.push(
          this.getEdge(
            result.nodes[nodeCount - 2].data,
            result.nodes[nodeCount - 1].data,
            ModelerEdgeCurveType.STRAIGHT
          )
        );
      }
    });

    return result;
  }
}
