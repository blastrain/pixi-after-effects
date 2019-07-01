export default class ElementDeltaPlayer {
  frameRate: number;
  inFrame: number;
  outFrame: number;
  isLoop: boolean;
  isCompleted: boolean;
  updater: ((value: number) => void);
  completed: () => void;
  isPlaying: boolean;
  firstTime: (number | null);
  nowTime: number;
  elapsedTime: number;

  constructor(frameRate : number, inFrame : number, outFrame : number,  updater : ((value : number) => void), completed : () => void) {
    this.frameRate   = frameRate;
    this.inFrame     = inFrame;
    this.outFrame    = outFrame;
    this.isLoop      = false;
    this.isCompleted = false;
    this.updater     = updater;
    this.completed   = completed;
  }

  showFirstFrame() {
    this.updater(0);
  }

  update(deltaTime : number) {
    if (this.frameRate === 0) return;
    if (!this.isPlaying) return;
    if (!this.elapsedTime) {
      this.elapsedTime = 0;
    }
    if (this.isCompleted) return;
    this.elapsedTime += deltaTime;
    let currentFrame = this.inFrame + this.elapsedTime * this.frameRate / 1000.0;
    if (currentFrame > this.outFrame) {
      currentFrame = this.outFrame - 0.01;
      if (this.isLoop) {
        this.elapsedTime = 0;
      } else {
        this.isCompleted = true;
        if (this.completed) this.completed();
        return;
      }
    }
    this.updater(currentFrame);
  }

  play(isLoop : boolean) {
    this.isLoop      = isLoop || false;
    this.isCompleted = false;
    this.isPlaying   = true;
  }

  pause() {
    this.isPlaying = false;
  }

  resume() {
    this.isPlaying = true;
  }

  stop() {
    this.isCompleted = true;
    this.isPlaying   = false;
    this.elapsedTime = 0;
    this.showFirstFrame();
  }
}
