export default class ElementDeltaPlayer {
    constructor(frameRate, totalFrame, updater, completed) {
        this.frameRate   = frameRate;
        this.totalFrame  = totalFrame;
        this.isLoop      = false;
        this.isCompleted = false;
        this.updater     = updater;
        this.completed   = completed;
    }

    showFirstFrame() {
        this.updater(0);
    }

    update(deltaTime) {
        if (this.frameRate === 0) return;
        if (!this.isPlaying) return;
        if (!this.elapsedTime) {
          this.elapsedTime = 0;
        }
        if (this.isCompleted) return;
        this.elapsedTime += deltaTime;
        let currentFrame = (this.elapsedTime * this.frameRate / 1000.0) % this.totalFrame;
        if (currentFrame > this.totalFrame) {
            if (!this.isLoop) {
                currentFrame = this.totalFrame - 0.01;
                this.isCompleted = true;
                if (this.completed) this.completed();
            }
        }
        this.updater(currentFrame);
    }

    play(isLoop) {
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
