class StoreScene extends Phaser.Scene {

    constructor() {
        super({ key: SCENE_ENUMS.STORE });

        this.shelfItems = [];
        this.selectedButton = null;

        this.shopUIElements = new ShopUIElements(this);
    }
    
    init() {
        this.game.gameClient.storeScene = this;
    }

    create() {
        this.shopUIElements.init();

        this.add.image(this.shopUIElements.screenCenterX, this.shopUIElements.screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1); //add background image

        //Create the shop Panel
        this.shopUIElements.createShopPanel();

        //Create top menu panel
        this.shopUIElements.createTopMenuPanel();

        //Create Title
        this.shopUIElements.createTitle();

        //Create Player Berries
        this.shopUIElements.createPlayerBerries();

        //Create Menu Buttons
        this.shopUIElements.createMenuButtons();
        this.selectedButton = this.shopUIElements.packButton;
        this.selectedButton.toggle();

         //Create ScrollPanel
        let topMenuPanelBounds = this.shopUIElements.topMenuPanelBounds;
        this.scrollPanel = new ScrollPanel(this, 
            topMenuPanelBounds.x, topMenuPanelBounds.y, 
            topMenuPanelBounds.width, topMenuPanelBounds.height, 
            {scollSpeed: 1, depth: 1},
            false, {backgroundColor: COLOR_ENUMS.OP_BLACK, alpha: 1, round: 5});
        this.scrollPanel.setVisible(true);

        //Generate Shelf Items
        this.generateShelfItems("PACKS");

        // Create back button
        this.shopUIElements.createButtons(); 
        
        //Prepare purchase panel
        this.purchasePanel = new PurchasePanel(this, this.shopUIElements.screenCenterX, this.shopUIElements.screenCenterY);
    }

    /** 
     * Generate Shelf Items
     */
    generateShelfItems(itemType) {
        //Reset first
        this.shelfItems.forEach(item => {
            this.scrollPanel.removeElement(item);
            item.destroy();
        });
        this.shelfItems = [];

        //filter the shop items from the data
        let shopItems = this.game.gameClient.shopData.find(item => item.type === itemType);

        //Create Shelp Items
        for(let item of shopItems.items){
            let config = {
                x: 0,
                y: 0,
                art: item.name,
                name: item.name,
                description: item.description,
                price: item.price,
                isplaceholder: false,
                itemtype: itemType
            }
            let shopItem = new ShopItemVisual(this, config);
            this.shelfItems.push(shopItem);
            this.scrollPanel.addElement(shopItem);

            shopItem.on('pointerdown', () => {
                //Open the purchase panel
                this.purchasePanel.launch(item, itemType);
            });
        }

        //Add Empty Placeholder
        let shopItem = new ShopItemVisual(this, {
            x: 0,
            y: 0,
            isplaceholder: true
        });
        this.shelfItems.push(shopItem);
        this.scrollPanel.addElement(shopItem);

        if(this.shelfItems.length > 0) {
            //Position Shelf Items
            let itemWidth = this.shelfItems[0].displayWidth;
            let itemHeight = this.shelfItems[0].displayHeight;

            let startX = this.scrollPanel.width/2 - itemWidth - 25;
            let startY = 25 + itemHeight/2;

            for(let i = 0; i<this.shelfItems.length; i++){
                let item = this.shelfItems[i];
                let itemX = startX + (i % 3) * (itemWidth + 25);
                let itemY = startY + Math.floor(i / 3) * (itemHeight + 25);
                item.setPosition(itemX, itemY);
            }
        }
        this.scrollPanel.updateScrollcontainer();

    }

    /** Function that activates buying the shopItem 
     * 
     * */ 
    buyItem(item, itemType) {
        this.game.gameClient.playerBuyItem(item, itemType);
    }

    /** Function that sets the player berries */
    setPlayerBerries() {
        this.shopUIElements.setPlayerBerries(this.game.gameClient.playerSettings.berries);
    }

    /** Function to return to the title scene */
    returnToTitle() {
        this.scene.start(SCENE_ENUMS.TITLE);
    }

}