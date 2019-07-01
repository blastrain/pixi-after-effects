export default class ElementFinder {
  findByName(name, node) {
    const nodeMap = {};
    this.__findByName(name, node).forEach((subnode) => {
      nodeMap[subnode] = subnode;
    });
    return Object.values(nodeMap) || [];
  }

  __findByName(name, node) {
    const foundNodes = [];
    if (node.name === name) foundNodes.push(node);
    node.children.forEach((child) => {
      if (child.name === name) foundNodes.push(child);
      this.__findByName(name, child).forEach((subnode) => {
        foundNodes.push(subnode);
      });
    });
    return foundNodes;
  }
}
