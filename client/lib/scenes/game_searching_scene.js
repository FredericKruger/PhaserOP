class GameSearchingScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENE_ENUMS.GAME_SEARCHING_SCENE });
  }

  init() {
    this.game.gameClient.gameSearchingScene = this;
  }

  create() {
    this.screenCenterX = this.cameras.main.width / 2;
    this.screenCenterY = this.cameras.main.height / 2;

    let backgroundImage = this.add.image(this.screenCenterX, this.screenCenterY, ASSET_ENUMS.MAP_BACKGROUND).setOrigin(0.5);

    // Calculate the scale factor
    let scaleX = this.cameras.main.width / backgroundImage.width;
    let scaleY = this.cameras.main.height / backgroundImage.height;
    let scale = Math.max(scaleX, scaleY);

    // Apply the scale factor
    backgroundImage.setScale(scale);

    // Center the image
    backgroundImage.setPosition(this.screenCenterX, this.screenCenterY);

    // Create the animated sprite
    this.waitingAnimation = this.add.sprite(
          this.screenCenterX,
          this.screenCenterY, 
          ASSET_ENUMS.LOADING_SPRITESHEET).setScale(1).setOrigin(0.5);
    this.waitingAnimation.play(ANIMATION_ENUMS.LOADING_ANIMATION);

      //Create title
      this.title = this.add.text(this.screenCenterX, this.screenCenterY - 175, "Searching for a Worthy Opponent", {
          font: "1000 80px OnePieceFont",
          color: COLOR_ENUMS_CSS.OP_WHITE
      }).setOrigin(0.5);

      //Create cance button
      this.cancelButton = new Button({
          scene: this,
          x: this.screenCenterX,
          y: this.screenCenterY + 250,
          width: 200,
          height: 50,
          backgroundcolor: COLOR_ENUMS.OP_CREAM,
          outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
          radius: 10,
          text: "Cancel",
          fontsize: 24,
          fontfamily: "OnePieceFont"
      });
  }
}