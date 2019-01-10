import { GMTimelineModel, GMNode } from 'graph-modeler';

export class WorkFlowHistoryAdapter {
  static parse(histories: any[]): GMTimelineModel {
    const model = new GMTimelineModel();

    if (histories instanceof Array) {
      const defaultBackgroundColor = '#949393';
      const defaultBorderColor = '#949393';
      const defaultBaseColor = '#949393';
      const defaultColor = '#000';
      const defaultIconColor = '#241F1F';
      const greenBackgroundColor = '#8CC04F';
      const redBackgroundColor = '#EE4C53';

      histories.forEach((historyItem: any, historyItemIndex: number) => {
        const subNodes: GMNode[] = [];

        const actionsExecuted = historyItem['actionsExecuted'];
        const historyItemId = historyItem['id'];
        let subNodeFailure = false;

        if (actionsExecuted && actionsExecuted.length > 0) {
          actionsExecuted.forEach((actionExecuted: any, actionsExecutedIndex: number) => {
            const ctxChanges = actionExecuted['ctxChanges'];
            const title =
              ctxChanges && ctxChanges['result'] !== undefined
                ? ctxChanges['result']
                : actionExecuted['exceptionMessage']
                ? actionExecuted['exceptionMessage']
                : actionExecuted['eventRequest']
                ? this.camelCaseToTitle(actionExecuted['eventRequest'])
                : this.camelCaseToTitle(actionExecuted['name']);

            const actionSuccessful =
              actionExecuted['statusOK'] !== undefined ? actionExecuted['statusOK'] : false;
            const actionFailure =
              actionExecuted['statusOK'] !== undefined
                ? actionExecuted['statusOK'] === false
                : false;
            if (actionFailure) {
              subNodeFailure = true;
            }

            subNodes.push(
              new GMNode({
                data: {
                  id: historyItemId + '-' + actionsExecutedIndex,
                  name: title,
                  color: defaultColor,
                  baseColor: defaultBaseColor,
                  borderColor: actionFailure ? redBackgroundColor : defaultBorderColor,
                  backgroundColor: actionFailure ? redBackgroundColor : undefined,
                  iconColor: actionFailure ? 'white' : defaultIconColor,
                  icon: actionSuccessful ? 'check' : actionFailure ? 'close' : undefined,
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
        const isCompleted = name === 'completed';
        const backgroundColor = isCompleted ? greenBackgroundColor : defaultBackgroundColor;

        model.nodes.push(
          new GMNode({
            data: {
              id: String(historyItemId),
              name: this.camelCaseToTitle(name),
              color: defaultColor,
              baseColor: defaultBaseColor,
              borderColor: backgroundColor,
              backgroundColor:
                historyItemIndex === 0 || historyItemIndex === histories.length - 1
                  ? backgroundColor
                  : undefined,
              iconColor: isCompleted ? 'white' : defaultIconColor,
              icon: !subNodeFailure && historyItemIndex !== 0 ? 'check' : undefined,
              expanded: subNodeFailure,
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
