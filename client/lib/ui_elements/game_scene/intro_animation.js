
class IntroAnimationPlayerContainer extends Phaser.GameObjects.Container {

    /** Constructor
     * @param {GameScene} scene - The scene this animation will be played in
     * @param {Object} leader - The leader object of the player
     * @param {string} name - The name of the player
     * @param {Object} position - The position of the container
     * @param {string} side - The side of the container
     */
    constructor(scene, leader, name, position, side) {
        super(scene, position.x, position.y);

        if(side === 'left') {
            this.leaderImage = scene.add.image(0, 0, this.scene.game.utilFunctions.getLeaderArt(leader.cardData.art)).setScale(1.3);
            this.leaderName = this.scene.add.text(-this.leaderImage.displayWidth/2 - 20, 0, 
                leader.cardData.name, {font: "1000 60px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}).setOrigin(1, 0.5);
            this.playerName = this.scene.add.text(-this.leaderImage.displayWidth/2 - 20, this.leaderName.displayHeight*0.5 + 10, 
                name, {font: "1000 35px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}).setOrigin(1, 0.5);
    
            this.setPosition(-this.leaderImage.displayWidth/2, position.y);
        } else {
            this.leaderImage = scene.add.image(0, 0, this.scene.game.utilFunctions.getLeaderArt(leader.cardData.art)).setScale(1.3);
            this.leaderName = this.scene.add.text(this.leaderImage.displayWidth/2 + 20, 0, 
                leader.cardData.name, {font: "1000 60px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}).setOrigin(0, 0.5);
            this.playerName = this.scene.add.text(this.leaderImage.displayWidth/2 + 20, this.leaderName.displayHeight*0.5 + 10, 
                name, {font: "1000 35px OnePieceFont", color: COLOR_ENUMS_CSS.OP_WHITE}).setOrigin(0, 0.5);
    
            this.setPosition(this.scene.screenWidth + this.leaderImage.displayWidth/2, position.y);
        }

        this.add([this.leaderImage, this.leaderName, this.playerName]);
        this.scene.add.existing(this);
    }

}

class IntroAnimation extends BaseComponentUI{

    /** Constructor
     * @param {GameScene} scene - The scene this animation will be played in
     * @param {Object} activePlayerLeader - The leader object of the active player
     * @param {Object} passivePlayLeader - The leader object of the passive player
     * @param {string} activePlayerName - The name of the active player
     * @param {string} passivePlayerName - The name of the passive player
     * 
     */
    constructor(scene, activePlayerLeader, passivePlayLeader) {
        super(scene, null);

        //keep to pass on to the setup at the end of the animation
        this.activePlayerLeader = activePlayerLeader.cardData;
        this.passivePlayLeader = passivePlayLeader.cardData;
 
        this.onomatopeImage = this.scene.add.image(this.scene.screenCenterX, this.scene.screenCenterY, ASSET_ENUMS.GAME_ONOMATOPE_IMAGE)
            .setOrigin(0.5)
            .setScale(1.5)
            .setVisible(false);
        this.obj.push(this.onomatopeImage);
        this.vsImage = this.scene.add.image(this.scene.screenCenterX, this.scene.screenCenterY, ASSET_ENUMS.GAME_VS_ICON)
            .setOrigin(0.5)
            .setScale(1.5)
            .setVisible(false);
        this.obj.push(this.vsImage);

        this.activePlayerIntroContainer = new IntroAnimationPlayerContainer(scene, 
            activePlayerLeader, this.scene.game.gameClient.username, 
            {x:0 , y: this.scene.screenHeight*0.25}, 'left');
        this.obj.push(this.activePlayerIntroContainer);
                                                                
        this.passivePlayerIntroContainer = new IntroAnimationPlayerContainer(scene, 
            passivePlayLeader, this.scene.game.gameClient.passivePlayerName, 
            {x:this.scene.screenWidth , y: this.scene.screenHeight*0.75}, 'right');
        this.obj.push(this.passivePlayerIntroContainer);
    }

    /** Function to create the ui */
    startAnimation() {
        //Play the onomatope
        this.scene.tweens.add({
            targets: this.activePlayerIntroContainer,
            x: this.scene.screenWidth*0.33,
            ease: 'Power2',
            duration: 1000,
            onComplete: () => {
                this.scene.tweens.add({
                    onStart: () => {this.onomatopeImage.setVisible(true);},
                    targets: this.onomatopeImage,
                    scale: {from : 1.5, to: 1},
                    delay: 1000,
                    duration: 500,
                    ease: 'Power2',
                    onComplete: () => {
                        this.scene.tweens.add({
                            onStart: () => {this.vsImage.setVisible(true);},
                            targets: this.vsImage,
                            scale: {from : 1.5, to: 1},
                            delay: 200,
                            duration: 500,
                            ease: 'Power2',
                            onComplete: () => {
                                this.scene.tweens.add({
                                    targets: this.passivePlayerIntroContainer,
                                    x: this.scene.screenWidth*0.66,
                                    delay: 1000,
                                    duration: 1000,
                                    ease: 'Power2',
                                    onComplete: () => {
                                        this.scene.time.delayedCall(1000, () => {
                                            this.setVisible(false);
                                            this.destroyAll();
                                            this.scene.gameStateManager.setupScene(this.activePlayerLeader, this.passivePlayLeader);
                                        });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        });
    }

    /** Function to destroy all the elements of the panel */
    destroyAll() {
        for(let obj of this.obj) {
            obj.destroy();
        }
    }

}