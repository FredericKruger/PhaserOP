const maxCardsPerPage =  8;
const maxCardsPerCol = 2;

class CollectionBook {

    constructor (config, scene) {

        this.scene = scene;

        /*const screenCenterX = this.scene.cameras.main.worldView.x + this.scene.cameras.main.width / 2;
        const screenCenterY = this.scene.cameras.main.worldView.y + this.scene.cameras.main.height / 2;
        const screenWidth = this.scene.cameras.main.width;*/

        this.selectedCard = 0;

        this.pageMax = 1;
        this.pageMin = 1;
        this.currentPage = 1;
        this.currentColorPage = 1;
        this.selectedColor = 1;

        this.objToUpdate = [];
        this.cardVisuals = [];

        this.tabs = new RexPlugins.UI.Tabs( this.scene, {
            x: config.x, //900
            y: config.y,

            panel: this.rexUI.add.roundRectangle(0, 0, config.width, config.height, 20, OP_CREAM),

            topButtons: [
                this.createCollectionBookTab(this.scene, 0, OP_GREEN),
                this.createCollectionBookTab(this.scene, 0, OP_BLUE),
                this.createCollectionBookTab(this.scene, 0, OP_RED),
                this.createCollectionBookTab(this.scene, 0, OP_PURPLE),
                this.createCollectionBookTab(this.scene, 0, OP_BLACK),
                this.createCollectionBookTab(this.scene, 0, OP_YELLOW)
            ],

            space: {
                top: 5,
                topButtonsOffset: 5,
                topButton: 5
            }
        });

        /** INITIALIZE TABS */
        /*for(let i=0; i<this.colorCardInfo.length; i++) {
            if(this.colorCardInfo[i].totalPages === 0) {
                this.tabs.hideButton('top', i);
                this.colorCardInfo[i].hidden = true;
            }
        }*/

        //this.updateMinMaxPage();
        this.tabs.layout();

    }

    /** CREATE TAB FUNCTION */
    createCollectionBookTab = function (scene, direction, frame) {
        let radius;
        switch (direction) {
            case 0:
                radius = {
                    tl: 10,
                    tr: 10
                }
                break;
        }
        let backgroundColor = frame;

        return scene.rexUI.add.label({
            width: 60,
            height: 50,
            background: scene.rexUI.add.roundRectangle(0, 0, 50, 50, radius, backgroundColor),
            space: {
                bottom: 0,//-110,
                left: 5
            }
        })
    }

}
