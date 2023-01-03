export default class SelectableList {
  constructor(collections, itemsPropName) {
    this.sections = [];
    this.isChecked = new Map();

    for (const collection of collections.values()) {
      this.isChecked.set(collection.name, new Set());
      this.sections.push({
        name: collection.name,
        items: collection[itemsPropName],
      });
    }
  }
}
