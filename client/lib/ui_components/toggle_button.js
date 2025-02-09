class ToggleButton extends Button {
    constructor(config) {
        super(config);

        this.toggled = false;

        // Create the glow effect
        this.glow = this.scene.add.graphics();
        this.glow.fillStyle(0xffffff, 0.5);
        this.glow.fillRoundedRect(
            -config.width / 2, -config.height / 2,
            config.width, config.height,
            config.radius
        );
        this.glow.setAlpha(0); // Start with the glow effect hidden
        this.add(this.glow);
    }

    onHover() {
        this.scene.tweens.add({
            targets: this.glow,
            alpha: 1,
            duration: 200,
            ease: 'Sine.easeInOut'
        });
    }

    onOut() {
        this.scene.tweens.add({
            targets: this.glow,
            alpha: 0,
            duration: 200,
            ease: 'Sine.easeInOut'
        });
    }

    toggle() {
        this.toggled = !this.toggled;
        if (this.toggled) {
            this.background.setFillStyle(COLOR_ENUMS.OP_GREEN); // Change to a lighter color when toggled
        } else {
            this.background.setFillStyle(COLOR_ENUMS.OP_ORANGE); // Change back to the original color when not toggled
        }
    }
}