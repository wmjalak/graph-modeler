import { CytoscapeOptions } from 'cytoscape';

export class GraphModelerSettings {
  static properties(element: any, graphData: any): CytoscapeOptions {
    const layout = {
      name: 'dagre', // breadthfirst
      directed: true,
      rankDir: 'LR',
      padding: 0,
      fit: true,
      animationDuration: 500,
    };
    const readOnly = true;
    return {
      container: element,

      layout: layout,

      style: [
        {
          selector: 'node',
          style: {
            shape: 'data(shapeType)',
            // width: 'mapData(50, 10, 100, 30, 100)',

            width: 'data(weigth)',
            height: 'data(weigth)',

            // 'shape-polygon-points': [-1, 0.5],
            // 'padding-top': 0,
            // 'padding': 1,
            content: 'data(name)',
            'text-wrap': 'wrap',
            'text-max-width': 60,
            // 'text-outline-width': 1,
            // 'text-outline-color': 'blue',
            // 'background-color': 'transparent',

            // 'visibility': 'data(testValue)',

            'background-color': 'data(backgroundColor)',
            'background-opacity': 'data(backgroundOpacity)',

            color: '#000', // text color
            'font-size': 8,
            // y: '100',
            'border-color': 'data(borderColor)',
            'border-width': 1
          }
        },
        {
          selector: 'edge',
          style: {
            // 'curve-style': 'bezier',

            /*
            'curve-style': 'unbundled-bezier',
            'control-point-distances': 10,
            'control-point-weights': 0.5,
            */

            // 'curve-style': 'unbundled-bezier',

            'curve-style': 'data(curve)',

            // 'control-point-distances': [-5, 5], // curved
            // 'control-point-weights': [0.25, 0.75],
            // 'control-point-distances': [0.5], // normal
            // 'control-point-weights': [0.5],

            'control-point-distances': 'data(controlPointDistances)', // normal
            'control-point-weights': 'data(controlPointWeights)',

            // opacity: 0.266,
            // width: 'mapData(10, 10, 100, 2, 16)',
            width: '2'

            // 'target-arrow-shape': 'triangle'
          }
        },
        {
          selector: ':selected',
          style: {
            'border-width': 2,
            'border-color': 'black'
          }
        },
        {
          selector: 'edge.questionable',
          style: {
            'line-style': 'dotted',
            'target-arrow-shape': 'diamond'
          }
        },
        {
          selector: '.faded',
          style: {
            opacity: 0.25,
            'text-opacity': 0
          }
        },
        {
          selector: '.subnode',
          style: {
            'padding-top': '20px'
          }
        },
        {
          selector: '.newpos',
          style: {
            'padding-top': '20px'
          }
        }
      ],


      minZoom: 1,
      elements: { ...graphData },
      userZoomingEnabled: false,
      maxZoom: 4.0,
      // zoomingEnabled: true,
      // panningEnabled: false,
      userPanningEnabled: false, // use this
      autoungrabify: readOnly,
      boxSelectionEnabled: false

      // autounselectify: true,
      /*
      autounselectify: false
      */
    };
  }
}
