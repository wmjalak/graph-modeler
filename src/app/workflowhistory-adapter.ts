import { GMTimelineModel, GMNode } from 'graph-modeler';

export class WorkFlowHistoryAdapter {
  static parse(workflowArray: any[], workflowDefinition: any): GMTimelineModel {
    const model = new GMTimelineModel();

    if (workflowArray instanceof Array) {
      const defaultBackgroundColor = '#949393';
      const defaultBorderColor = '#949393';
      const defaultBaseColor = '#949393';
      const defaultColor = '#000';
      const defaultIconColor = '#241F1F';
      const greenBackgroundColor = '#8CC04F';
      const redBackgroundColor = '#EE4C53';

      let subNodeFailure = false;
      let workFlowHasExecutedActions = false;

      workflowDefinition.stateDiagram.states.forEach((workflowState: any, index: number) => {
        const subNodes: GMNode[] = [];
        const name = workflowState['name'];
        const isCompleted = name === 'completed';

        let stateHasExecutedActions = false;

        const workflowItems = workflowArray.filter(
          (workflowItem: any) => workflowItem.fromState === workflowState.name
        );

        if (workflowItems && workflowItems.length > 0) {
          workflowItems.forEach((workflowItem: any) => {
            workflowItem.actionsExecuted.forEach((actionExecuted: any, actionIndex: number) => {
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
                actionExecuted['statusOK'] !== undefined
                  ? actionExecuted['statusOK'] === true
                  : false;

              stateHasExecutedActions = true;

              if (!actionSuccessful) {
                subNodeFailure = true;
              }
              subNodes.push(
                new GMNode({
                  data: {
                    id: workflowItem.id + '-' + actionIndex,
                    name: title,
                    color: defaultColor,
                    baseColor: defaultBaseColor,
                    borderColor: actionSuccessful ? defaultBorderColor : redBackgroundColor,
                    backgroundColor: actionSuccessful ? undefined : redBackgroundColor,
                    iconColor: actionSuccessful ? defaultIconColor : 'white',
                    icon: actionSuccessful ? 'check' : 'close',
                    executed: !subNodeFailure,
                    model: {
                      actionExecuted: actionExecuted,
                      workflowItem: workflowItem
                    }
                  }
                })
              );
            });
          });
        }

        if (stateHasExecutedActions) {
          workFlowHasExecutedActions = true;
        }

        model.nodes.push(
          new GMNode({
            data: {
              id: String(index),
              name: this.camelCaseToTitle(workflowState['name']),
              color: defaultColor,
              baseColor: defaultBaseColor,
              borderColor:
                isCompleted && !subNodeFailure ? greenBackgroundColor : defaultBackgroundColor,
              backgroundColor:
                isCompleted && !subNodeFailure
                  ? greenBackgroundColor
                  : index === 0 || isCompleted
                  ? defaultBackgroundColor
                  : undefined,
              iconColor: isCompleted ? 'white' : defaultIconColor,
              icon:
                (!subNodeFailure && stateHasExecutedActions) ||
                (isCompleted && !subNodeFailure && workFlowHasExecutedActions)
                  ? 'check'
                  : undefined,
              expanded: subNodeFailure,
              executed: !subNodeFailure,
              model: {
                workflowItemDefinition: workflowState,
                workflowItems: workflowItems
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
