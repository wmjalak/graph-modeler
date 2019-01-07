export class GMTimelineModel {
  public constructor(init?: Partial<GMTimelineModel>) {
    Object.assign(this, init);
  }

  nodes: GMNode[] = [];
}

export class GMNode {
  public constructor(init?: Partial<GMNode>) {
    Object.assign(this, init);
  }

  data: {
    id: string;
    name: string;
    borderColor?: string;
    backgroundColor?: string;
    model?: any;
    subNodes?: GMNode[];
  };
}
