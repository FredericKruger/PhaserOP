class BaseComponentUI {

    /** Constructor
     * @param {GameScene} scene - The scene this component will be displayed in
     * @param {PlayerScene} playerScene - The player scene this component will be displayed in
     */
    constructor(scene, playerScene) {
        this.scene = scene;
        this.playerScene = playerScene;

        this.obj = [];
    }

    /** Function to set visibilty of the element
     * @param {boolean} visible - The visibility of the element
     */
    setVisible(visible) {
        for(let obj of this.obj) {
            obj.setVisible(visible);
        }
    }

}