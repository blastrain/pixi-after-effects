export default class ElementFinder {
  constructor() {}

  findByName(name, node) {
    let nodeMap = {};
    this.__findByName(name, node).forEach((node) => {
      nodeMap[node] = node;
    });
    return Object.values(nodeMap) || [];
  }

  __findByName(name, node) {
    let foundNodes = [];
    if (node.name === name) foundNodes.push(node);
    node.children.forEach((child) => {
      if (child.name === name) foundNodes.push(child);
      this.__findByName(name, child).forEach((node) => {
        foundNodes.push(node);
      });
    });
    return foundNodes;
  }
}
