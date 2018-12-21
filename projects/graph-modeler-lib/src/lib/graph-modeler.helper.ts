import { ModelerEdge } from './graph-modeler.types';

export enum ModelerEdgeCurveType {
  STRAIGHT,
  CURVE_DOWN,
  CURVE_UP
}

export class GraphModelerHelper {
  static includes(stringArray: string[], value: string): boolean {
    console.log('stringArray', stringArray);
    return stringArray && stringArray.length > 0
      ? stringArray.findIndex(s => s === value) > -1
      : false;
  }

  static getEdge(source: string, target: string, curveType: ModelerEdgeCurveType): ModelerEdge {
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
}
