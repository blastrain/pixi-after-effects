import * as element from './element';

/**
 * @class Asset
 */
export default class Asset {
  constructor(loader, data, jsonPath) {
    this.id = data.id;
    this.layers = data.layers || [];
    if (data.isDisused) return;
    if (data.texture) {
      this.texture = data.texture;
    } else if (data.imagePath) {
      this.imagePath = data.imagePath;
      if (loader.imagePathProxy) {
        this.imagePath = loader.imagePathProxy(data.imagePath);
      }
    } else if (data.p) {
      const contents = data.u.split('/').filter(content => content !== '');
      let imagePath  = [jsonPath, ...contents, data.p].join('/');
      if (loader.imagePathProxy) {
        imagePath = loader.imagePathProxy(imagePath);
      }
      this.imagePath = imagePath;
    }
    if (data.bmPIXI) {
      this.blendMode = data.bmPIXI;
    }
  }

  /**
   * Create All Elements
   *
   * @memberof Asset#
   * @return {Array} - The Element collection
   */
  createLayers() {
    return this.layers
      .map(layer => element.ElementFactory.create(layer))
      .filter(layer => layer !== null);
  }

  /**
   * Create Element collection
   *
   * @memberof Asset#
   * @param {number}   - The index of layer
   * @return {Element} - The newly Element instance
   */
  createLayerByIndex(index) {
    const foundLayers = this.layers.filter(layer => layer.ind === index);
    if (foundLayers.length === 0) return null;

    return element.ElementFactory.create(foundLayers[0]);
  }
}
