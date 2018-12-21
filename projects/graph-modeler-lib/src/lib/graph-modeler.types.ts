export class ModelerModel {
  nodes: ModelerNode[] = [];
  edges: ModelerEdge[] = [];
}

export class ModelerNode {

  public constructor(init?: Partial<ModelerNode>) {
    Object.assign(this, init);
  }


  data: {
    id: string;
    name: string;
    shapeType: string;
    borderColor: string;
    weigth: number;
    backgroundColor: string;
    backgroundOpacity: string;
    testValue: string;
    subNodes: ModelerNode[];
  };

}

export class ModelerEdge {

  public constructor(init?: Partial<ModelerEdge>) {
    Object.assign(this, init);
  }

  group: string;
  data: {
    source: string;
    target: string;
    curve: string;
    controlPointDistances: number[];
    controlPointWeights: number[];
  };
}
