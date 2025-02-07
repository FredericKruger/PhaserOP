/** @typedef {Button} Button */
class Button extends Phaser.GameObjects.Container {

    /**
     * 
     * @param {object} config
     * config.scene
     * config.x
     * config.y
     * condig.width
     * config.height
     * config.backgroundcolor
     * config.outlinecolor
     * config.radius
     * config.text
     * config.round 
     */
    constructor(config) {
        super(config.scene, config.x, config.y);

        this.obj = [];

        if(config.round) {
            this.background = config.scene.add.circle(
                0,
                0,
                config.width,
                config.backgroundcolor, 
                1
            );
            this.background.setStrokeStyle(5, config.outlinecolor);
        } else {
            this.background = config.scene.add.rexRoundRectangleCanvas(
                0, 
                0, 
                config.width,
                config.height, 
                config.radius, 
                config.backgroundcolor, 
                config.outlinecolor,
                5
            );
        }

        this.background.setOrigin(0.5, 0.5);
        this.obj.push(this.background);

        let textColor = config.textColor || COLOR_ENUMS_CSS.OP_CREAM;
        this.text = config.scene.add.text(0, 0, config.text, {
            fontFamily: 'OnePieceFont',
            font: config.fontsize + "px " + config.fontfamily,
            color: textColor
        });
        this.text.setOrigin(0.5, 0.5);
        this.obj.push(this.text);
   
        this.add([this.background, this.text]);

        if(config.round){
            this.setSize(config.width*2, config.height*2);
        } else {
            this.setSize(config.width, config.height);
        }

        config.scene.add.existing(this);

        this.setInteractive();
    }

    /* Function to set the background color only */
    /**
     * @param {any} color
     */
    setBackgroundColor (color) {
        this.background.setFillStyle(color); //setStrokeStyle
    }

    /* Function to set the background color and the outline */
    /**
     * @param {any} color1
     * @param {any} color2
     */
    setDoubleBackgroundColor (color1, color2) {
        this.background.setFillStyle(color1, color2, true);
    }

    /* Function to set the text */
    /**
     * @param {string} t
     */
    setText(t) {
        this.text.setText(t);
    }
}