class OrangeToPurplePipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
    constructor(game) {
        super({
            game: game,
            fragShader: game.cache.shader.get('purpleToOrange').fragmentSrc
        });
    }
}