export default class SelectableList {
  constructor(collections, itemsPropName) {
    this.sections = [];
    console.log(collections);
    for (const collection of collections.values()) {
      this.sections.push({
        sectionName: collection.name,
        items: collection[itemsPropName],
      });
    }
    console.log({ sections: this.sections });
  }
}
