class BlueTintPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {

    /**
     * 
     * @param {Phaser.Game} game 
     */
    constructor(game) {
        super({
            game: game,
            fragShader: game.cache.shader.get(SHADER_ENUMS.BLUE_TINT_SHADER).fragmentSrc
        });
    }
}