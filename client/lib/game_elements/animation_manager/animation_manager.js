class AnimationManager {

    /**
     * 
     * @param {GameScene} scene 
     */
    constructor(scene) {
        this.scene = scene;

        this.isPlayingAnimation = false;
        this.finishedAnimation = false;

        this.animationStack = [];
    }

    addAnimation(animation){
        animation.animation.on('complete', () => {
            this.finishedAnimation = true; 
            this.endAnimation();
        }, this);

        this.animationStack.push(animation);

        if(!this.isPlayingAnimation) this.playNext();
    }

    endAnimation(){
        this.isPlayingAnimation = false;
        let delay = this.animationStack[0].delay;

        if(this.finishedAnimation) this.animationStack.shift();

        this.scene.time.delayedCall(delay, this.playNext, [], this);
    }

    playNext(){
        if(this.animationStack.length>0){
            this.isPlayingAnimation = true;
            this.finishedAnimation = false;
            this.animationStack[0].animation.restart();
        }
    }

    isBusy(){
        let busy = this.isPlayingAnimation || this.animationStack.length>0;
        return busy;
    }

}