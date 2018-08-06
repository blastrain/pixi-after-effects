export default class AEDataInterceptor {
  constructor(config) {
    this.config = config;
  }

  add(name, param) {
    if (!this.config) this.config = {};
    this.config[name] = param;
  }

  intercept(data) {
    if (data.layers) {
      data.layers.forEach((layer) => {
        this.intercept(layer);
      });
    }
    const cfg = this.config[data.nm] || this.config[data.p] || this.config[data.id];
    if (cfg) {
      if (cfg.text)      data.text      = cfg.text;
      if (cfg.rawText)   data.rawText   = cfg.rawText;
      if (cfg.image)     data.image     = cfg.image;
      if (cfg.imagePath) data.imagePath = cfg.imagePath;
      if (cfg.texture)   data.texture   = cfg.texture;
      if (cfg.isDisused) data.isDisused = cfg.isDisused;
      if (cfg.events)    data.events    = cfg.events;
      if (cfg.inPoint)   data.ip        = cfg.inPoint;
      if (cfg.outPoint)  data.op        = cfg.outPoint;
      if (cfg.blendMode) data.bmPIXI    = cfg.blendMode;
    }
    return data;
  }
}
