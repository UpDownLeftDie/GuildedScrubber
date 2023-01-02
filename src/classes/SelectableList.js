export default class SelectableList {
  constructor(collections, itemsPropName) {
    this.sections = [];
    this.isChecked = new Map();

    for (const collection of collections.values()) {
      this.isChecked.set(collection.name, new Set());
      console.log({ collection, itemsPropName });
      this.sections.push({
        name: collection.name,
        items: collection[itemsPropName],
      });
    }
  }
}
