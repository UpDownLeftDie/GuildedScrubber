import Team from "./Team";

export type Section = {
  name: string;
  items: {
    name: string;
    teams?: Team[];
  }[];
};

type Collection = Map<
  number,
  {
    [index: string]: string | Team[] | undefined;
    name: string;
    teams?: Team[];
  }
>;

export default class SelectableList {
  sections: Section[];
  isChecked: Map<string, Set<any>>;

  constructor(collection: Collection, itemsPropName: string) {
    this.sections = [];
    this.isChecked = new Map();

    for (const element of collection.values()) {
      this.isChecked.set(element.name, new Set());
      this.sections.push({
        name: element.name,
        items: element[itemsPropName],
      });
    }
  }
}
