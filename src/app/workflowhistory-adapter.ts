import { GMTimelineModel, GMNode } from 'graph-modeler';

export class WorkFlowHistoryAdapter {
  static parse(histories: any[]): GMTimelineModel {
    const model = new GMTimelineModel();

    if (histories) {
      histories.forEach((historyItem: any, historyItemIndex: number) => {
        const subNodes: GMNode[] = [];

        const actionsExecuted = historyItem['actionsExecuted'];
        const historyItemId = historyItem['id'];

        if (actionsExecuted && actionsExecuted.length > 0) {
          actionsExecuted.forEach((actionExecuted, actionsExecutedIndex) => {
            subNodes.push(
              new GMNode({
                data: {
                  id: historyItemId + '-' + actionsExecutedIndex,
                  name: this.camelCaseToTitle(actionExecuted['name']),
                  borderColor: '#949393',
                  backgroundColor: '#949393',
                  model: {
                    eventRequest: actionExecuted['eventRequest'],
                    started: actionExecuted['started'],
                    completed: actionExecuted['completed']
                  }
                }
              })
            );
          });
        }

        model.nodes.push(
          new GMNode({
            data: {
              id: String(historyItemId),
              name: this.camelCaseToTitle(historyItem['taskName'] || historyItem['toState']),
              borderColor: '#949393',
              backgroundColor: '#949393',
              model: {
                workflowInstanceId: historyItem['workflowInstanceId']
              },
              subNodes: subNodes
            }
          })
        );
      });
      return model;
    }
  }

  private static camelCaseToTitle(camelCase: string): string {
    if (!camelCase) {
      return '';
    }

    const pascalCase: string = camelCase.charAt(0).toUpperCase() + camelCase.substr(1);
    return pascalCase
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z])([0-9])/gi, '$1 $2')
      .replace(/([0-9])([a-z])/gi, '$1 $2');
  }
}
