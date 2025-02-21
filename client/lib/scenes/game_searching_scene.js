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
    this.titleBox = this.add.rectangle(
      this.title.x, 
      this.title.y, 
      this.title.width + 40, 
      this.title.height + 20, COLOR_ENUMS.OP_BLACK, 0.6).setOrigin(0.5);
    this.children.moveBelow(this.titleBox, this.title);
        
    this.matchFound = this.add.text(
        this.screenCenterX, 
        this.screenCenterY + 325, 
        "Match Found!", 
        {
            font: "1000 80px OnePieceFont",
            color: COLOR_ENUMS_CSS.OP_WHITE
        }
    ).setOrigin(0.5).setVisible(false);
    this.matchFoundBox = this.add.rectangle(
      this.matchFound.x, 
      this.matchFound.y, 
      this.matchFound.width + 40, 
      this.matchFound.height + 20, COLOR_ENUMS.OP_BLACK, 0.6).setOrigin(0.5).setVisible(false);
    this.children.moveBelow(this.matchFoundBox, this.matchFound);

    //Create cancel button
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
        fontsize: 40,
        fontfamily: "OnePieceFont",
        textColor: COLOR_ENUMS_CSS.OP_BLACK,
    });
    this.cancelButton.setInteractive();
    this.cancelButton.on("pointerover", () => {
      this.cancelButton.postFX.addGlow(COLOR_ENUMS.OP_WHITE, 2);
    });
    this.cancelButton.on("pointerout", () => {
      this.cancelButton.postFX.clear();   
    });
    this.cancelButton.on("pointerdown", () => {
        this.game.gameClient.requestLeaveMatchmaking();
    });
  }

  //Function to go back to deck selection
  goBackToDeckSelection() {
    this.scene.start(SCENE_ENUMS.DECK_SELECTION);
  }

  //Function to disable the cancel button if match was found
  disableCancelButton() {
    console.log("TODO BUG: CANCEL BUTTON NOT DISABLING");
    this.cancelButton.removeInteractive();
    this.cancelButton.setPostPipeline(PIPELINE_ENUMS.GREYSCALE_PIPELINE); //FIXME: Fix greyscalling button when disabled
  }

  startGameScene(board) {
    this.matchFound.setVisible(true);
    this.matchFoundBox.setVisible(true);
    this.time.delayedCall(1000, () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0); // Fade out over 1 second

      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENE_ENUMS.GAME_SCENE, {board: board});
      });
    });
  }

}