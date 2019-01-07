import { CytoscapeOptions, ElementsDefinition } from 'cytoscape';

const completedIcon =
  '%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20\
height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20\
d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20d%3D%22M9%2016.2L4.8%2012l-1.4%201.4L9%2019\
%2021%207l-1.4-1.4L9%2016.2z%22%2F%3E%3C%2Fsvg%3E';

export class GraphModelerSettings {
  static properties(element: any, graphData: ElementsDefinition): CytoscapeOptions {
    const dagreLayout = {
      name: 'dagre',
      directed: true,
      edgeSep: 100,
      rankDir: 'LR',
      padding: 0,
      fit: true,
      animate: false,
      animationDuration: 500,
      spacingFactor: 1,
      nodeDimensionsIncludeLabels: false
    };
    const presetLayout = {
      name: 'preset'
    };

    const readOnly = true;
    const ITEM_MAX_WIDTH = 60;

    const firstNodeId =
      graphData && graphData.nodes && graphData.nodes.length > 0
        ? graphData.nodes[0].data.id
        : '-1';
    const lastNodeId =
      graphData && graphData.nodes && graphData.nodes.length > 0
        ? graphData.nodes[graphData.nodes.length - 1].data.id
        : '-1';

    return {
      container: element,
      layout: dagreLayout,
      style: [
        {
          selector: 'node',
          style: {
            shape: 'ellipse',

            width: '10',
            height: '10',

            content: 'data(name)',
            'text-wrap': 'wrap',
            'text-max-width': ITEM_MAX_WIDTH,
            'background-color': 'data(backgroundColor)',
            'background-opacity': (ele: any) => {
              const id = ele.id();
              return firstNodeId === id || lastNodeId === id ? '1' : '0';
            },
            'background-fit': 'cover',
            'background-image': (ele: any) => {
              const name = String(ele.data().name).toLowerCase();
              if (name === 'completed') {
                return 'data:image/svg+xml;utf8,' + completedIcon;
              }
              return 'none';
            },
            color: '#000', // text color
            'font-size': 8,
            'border-color': 'data(borderColor)',
            'border-width': 1
          }
        },
        {
          selector: 'edge',
          style: {
            'curve-style': 'data(curve)',
            'control-point-distances': 'data(controlPointDistances)', // normal
            'control-point-weights': 'data(controlPointWeights)',
            width: '2'
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
      maxZoom: 2.5,
      userPanningEnabled: false,
      autoungrabify: readOnly,
      autolock: false,
      boxSelectionEnabled: false
    };
  }
}
