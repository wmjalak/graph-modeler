import { CytoscapeOptions, ElementsDefinition } from 'cytoscape';

const checkIcon =
  'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20\
height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3Cpath%20fill%3D%22none%22%20\
d%3D%22M0%200h24v24H0z%22%2F%3E%3Cpath%20d%3D%22M9%2016.2L4.8%2012l-1.4%201.4L9%2019\
%2021%207l-1.4-1.4L9%2016.2z%22%2F%3E%3C%2Fsvg%3E';

const closeIcon =
  'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20\
height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%3E%3C\
path%20d%3D%22M19%206.41L17.59%205%2012%2010.59%206.41%205%205%206.41%2010.59%2012%20\
5%2017.59%206.41%2019%2012%2013.41%2017.59%2019%2019%2017.59%2013.41%2012z%22/%3E%3C\
path%20d%3D%22M0%200h24v24H0z%22%20fill%3D%22none%22/%3E%3C/svg%3E';

const icons = {
  'check': checkIcon,
  'close': closeIcon
};

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
            'background-color': (ele: any) => {
              const backgroundColor = ele.data().backgroundColor;
              return backgroundColor ? backgroundColor : 'transparent';
            },
            'background-opacity': (ele: any) => {
              return (ele.data().backgroundColor) ? '1' : '0';
            },
            'background-fit': 'cover',
            'background-image': (ele: any) => {
              const icon = ele.data().icon ? String(ele.data().icon).toLowerCase() : undefined;
              return icon ? icons[icon] : 'none';
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
