import { GMTimelineModel, GMNode } from 'graph-modeler';

export class WorkFlowHistoryAdapter {
  static parse(histories: any[]): GMTimelineModel {
    const model = new GMTimelineModel();

    if (histories) {
      const defaultBorderColor = '#949393';
      const defaultBackgroundColor = '#949393';
      const greenBackgroundColor = '#8CC04F';
      const redBackgroundColor = '#EE4C53';

      histories.forEach((historyItem: any, historyItemIndex: number) => {
        const subNodes: GMNode[] = [];

        const actionsExecuted = historyItem['actionsExecuted'];
        const historyItemId = historyItem['id'];
        let expanded = false;

        if (actionsExecuted && actionsExecuted.length > 0) {
          actionsExecuted.forEach((actionExecuted: any, actionsExecutedIndex: number) => {

            const actionFailure = actionExecuted['statusOK'] !== undefined ? actionExecuted['statusOK'] === false : false;
            if (actionFailure) {
              expanded = true;
            }

            subNodes.push(
              new GMNode({
                data: {
                  id: historyItemId + '-' + actionsExecutedIndex,
                  name: this.camelCaseToTitle(actionExecuted['name']),
                  borderColor: actionFailure ? redBackgroundColor : defaultBorderColor,
                  backgroundColor: actionFailure ? redBackgroundColor : undefined,
                  icon: actionFailure ? 'close' : undefined,
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

        const name = historyItem['taskName'] || historyItem['toState'];
        const backgroundColor = name === 'completed' ? greenBackgroundColor : defaultBackgroundColor;

        model.nodes.push(
          new GMNode({
            data: {
              id: String(historyItemId),
              name: this.camelCaseToTitle(name),
              borderColor: backgroundColor,
              backgroundColor: historyItemIndex === 0 || historyItemIndex === histories.length - 1 ? backgroundColor : undefined,
              icon: name === 'completed' ? 'check' : undefined,
              expanded: expanded,
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
