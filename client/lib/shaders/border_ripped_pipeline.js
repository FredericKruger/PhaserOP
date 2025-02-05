class RightBorderRippedPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {

    /**
     * 
     * @param {Phaser.Game} game 
     */
    constructor(game) {
        super({
            game: game,
            fragShader: game.cache.shader.get(SHADER_ENUMS.RIGHT_BORDER_RIPPED_SHADER).fragmentSrc
        });
    }
}

class LeftBorderRippedPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {

    /**
     * 
     * @param {Phaser.Game} game 
     */
    constructor(game) {
        super({
            game: game,
            fragShader: game.cache.shader.get(SHADER_ENUMS.LEFT_BORDER_RIPPED_SHADER).fragmentSrc
        });
    }
}