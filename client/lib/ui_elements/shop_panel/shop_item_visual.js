class ShopItemVisual extends Phaser.GameObjects.Container {

    constructor(scene, config) {
        super(scene, config.x, config.y);

        this.scene = scene;

        this.placeholder = this.scene.add.image(0, 0, ASSET_ENUMS.IMAGE_SHOP_ITEM_PLACEHOLDER).setScale(0.25).setOrigin(0);
        
        this.art = this.scene.add.image(0, 0, '');
        if(!config.isplaceholder) {
            this.art.setTexture(`PACK_ART_${config.art}`);
            this.art.setScale(0.37);
            this.art.setPosition(this.placeholder.displayWidth / 2,  this.art.displayHeight / 2);
        } else {
            this.art.setVisible(false);
        }

        this.nameText = this.scene.add.text(this.placeholder.displayWidth / 2, this.placeholder.displayHeight / 2 + 60, '', {
            font: "35px OnePieceFont",
            color: COLOR_ENUMS_CSS.OP_BLACK
        }).setOrigin(0.5);
        if(!config.isplaceholder) {
            this.nameText.setText(config.name);
        } else {
            this.nameText.setVisible(false);
        }

        this.descriptionText = this.scene.add.text(this.placeholder.displayWidth / 2, this.placeholder.displayHeight / 2 + 85, '', {
            font: "25px OnePieceFont",
            color: COLOR_ENUMS_CSS.OP_BLACK
        }).setOrigin(0.5);
        if(!config.isplaceholder) {
            this.descriptionText.setText(config.description);
        } else {
            this.descriptionText.setVisible(false);
        }

        this.priceText = this.scene.add.text(this.placeholder.displayWidth / 2 + 30, this.placeholder.displayHeight / 2 + 155, '', {
            font: "30px OnePieceTCGFont",
            color: COLOR_ENUMS_CSS.OP_BLACK
        }).setOrigin(1);
        if(!config.isplaceholder) {
            this.priceText.setText(config.price);
        } else {
            this.priceText.setVisible(false);
        }

        this.add([this.placeholder, this.art, this.nameText, this.descriptionText, this.priceText]);
        this.setSize(this.placeholder.displayWidth, this.placeholder.displayHeight);

        this.scene.add.existing(this); 
    }

}