import * as PIXI from 'pixi.js';
export default class ElementFinder {
  findByName(name: string, node: PIXI.Container) {
    return this.__findByName(name, node);
  }

  __findByName(name: string, node: PIXI.Container): PIXI.DisplayObject[] {
    const foundNodes: PIXI.DisplayObject[] = [];
    if (node.name === name) foundNodes.push(node);
    node.children.forEach((child) => {
      if (child.name === name) foundNodes.push(child);
      this.__findByName(name, child as PIXI.Container).forEach((subnode) => {
        foundNodes.push(subnode);
      });
    });
    return foundNodes;
  }
}
