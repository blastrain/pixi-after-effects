import { Element, ElementData } as element from './element';

export interface AssetData {
  id : string;
  layers : any;
  isDisused : boolean;
  texture : any;
  imagePath : string;
  p : string;
  u : string;
  bmPIXI : PIXI.BLEND_MODES;
};

/**
 * @class Asset
 */
export class Asset {
  id: string;
  layers: ElementData[];
  texture: any;
  imagePath: string;
  blendMode: number;

  constructor(loader : any, data : AssetData, jsonPath : string) {
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
      const contents = data.u.split('/').filter((content : string) => content !== '');
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
  createLayerByIndex(index : number) {
    const foundLayers = this.layers.filter(layer => layer.ind === index);
    if (foundLayers.length === 0) return null;

    return element.ElementFactory.create(foundLayers[0]);
  }
}