class LoaderScene extends Phaser.Scene {
    constructor() {
        super({key: SCENE_ENUMS.LOADER});
    }

    preload(){
        // Init screen handling
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND1).setScale(1);
        this.add.image(screenCenterX, screenCenterY, ASSET_ENUMS.BACKGROUND2).setScale(2);
        this.add.image(screenCenterX, screenCenterY-320, ASSET_ENUMS.LOGO).setOrigin(0.5, 0.5).setScale(1);

        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(COLOR_ENUMS.OP_RED, 0.2);
        progressBox.fillRect(screenCenterX-160, screenCenterY+70, 320, 50);

        let loadingText = this.make.text({
            x : screenCenterX,
            y : screenCenterY+50,
            text: "Loading...",
            style: {
                font: "24px OnePieceFont",
                color: COLOR_ENUMS_CSS.OP_CREAM
            }
        });
        loadingText.setOrigin(0.5, 0.5);
  
        let percentText = this.make.text({
            x : screenCenterX,
            y : screenCenterY+70+25,
            text: "0%",
            style: {
                font: "18px OnePieceFont",
                color: COLOR_ENUMS_CSS.OP_CREAM
            }
        });
        percentText.setOrigin(0.5, 0.5);

        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + "%");
            progressBar.clear();
            progressBar.fillStyle(COLOR_ENUMS.OP_RED, 1);
            progressBar.fillRect(screenCenterX-150, screenCenterY+80, 300 * value, 30);
        });

        // @ts-ignore
        this.load.on('fileprogress', function(file) {
            //assetText.setText("loading asset: " + file.key);
        });
        this.load.on('complete', function() {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });

        let assetPath = 'assets/data';
        this.load.json(DATA_ENUMS.PLAYER_ICONS, `${assetPath}/playericons.json`); //icon list

        assetPath = 'assets/backgrounds/';
        this.load.image(ASSET_ENUMS.LEATHER_BACKGROUND, `${assetPath}/leather_background.jpg`);
        this.load.image(ASSET_ENUMS.MAP_BACKGROUND, `${assetPath}/map_background.webp`);
        this.load.image(ASSET_ENUMS.BACKGORUND4, `${assetPath}/backgroundshop.png`);
        this.load.image(ASSET_ENUMS.BACKGROUND5, `${assetPath}/background4.jpg`);
        this.load.image(ASSET_ENUMS.DECK_SELECTION_BACKGROUND, `${assetPath}/background_deckselection.jpeg`);
        this.load.image(ASSET_ENUMS.MATCH_READY_BACKGROUND, `${assetPath}/match_ready_background.jpg`);
        
        assetPath = 'assets/backgrounds/battle_backgrounds';
        this.load.image(ASSET_ENUMS.BATTLE_BACKGROUND_FOOSHA_VILLAGE, `${assetPath}/battle_background_foosha_village.webp`);
        this.load.image(ASSET_ENUMS.BATTLE_BACKGROUND_BARATIE, `${assetPath}/battle_background_baratie.jpg`);
        this.load.image(ASSET_ENUMS.BATTLE_BACKGROUND_ARLONG_PARK, `${assetPath}/battle_background_arlongpark.webp`);

        assetPath = 'assets/elements'
        this.load.image(ASSET_ENUMS.ARROW_RIGHT, `${assetPath}/rightarrow.png`);
        this.load.image(ASSET_ENUMS.ARROW_LEFT, `${assetPath}/leftarrow.png`);
        this.load.image(ASSET_ENUMS.DELETE_ICON, `${assetPath}/deletedeckicon.png`);
        this.load.image(ASSET_ENUMS.PACK_NUMBER_BANNER, `${assetPath}/numberBanner.png`);

        assetPath = "assets/icons/menuicons";
        this.load.image(ASSET_ENUMS.ICON_STORE, `${assetPath}/storeIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_OPEN_PACK, `${assetPath}/openPackIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_LOUGOUT, `${assetPath}/logoutIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_RANDOM_MATCH, `${assetPath}/randomMatchIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_VS_AI, `${assetPath}/vsAIIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_COLLECTION, `${assetPath}/collectionIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_COST, `${assetPath}/costIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_COLLECTION_SET, `${assetPath}/collectionSetIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_SEARCH, `${assetPath}/searchIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_NEW_CARD, `${assetPath}/newCardIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_DONE, `${assetPath}/doneIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_BERRIES, `${assetPath}/berriesIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_BUY, `${assetPath}/buyIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_PLAY, `${assetPath}/playIcon.png`);
        this.load.image(ASSET_ENUMS.ICON_LIFE, `${assetPath}/lifeIcon.png`);

        assetPath = "assets/icons/setfiltericons";
        this.load.image(ASSET_ENUMS.SET_FILTER_ALL, `${assetPath}/setFilterAll.png`);
        this.load.image(ASSET_ENUMS.SET_FILTER_OP01, `${assetPath}/setFilterOP01.png`);
        this.load.image(ASSET_ENUMS.SET_FILTER_OP02, `${assetPath}/setFilterOP02.png`); 
        this.load.image(ASSET_ENUMS.SET_FILTER_OP03, `${assetPath}/setFilterOP03.png`);
        this.load.image(ASSET_ENUMS.SET_FILTER_ST01, `${assetPath}/setFilterST01.png`);
        this.load.image(ASSET_ENUMS.SET_FILTER_ST02, `${assetPath}/setFilterST02.png`);
        this.load.image(ASSET_ENUMS.SET_FILTER_ST03, `${assetPath}/setFilterST03.png`);
        this.load.image(ASSET_ENUMS.SET_FILTER_ST04, `${assetPath}/setFilterST04.png`);

        assetPath = 'assets/icons/playericons';
        this.load.image(ASSET_ENUMS.AVATAR_DEFAULT,  `${assetPath}/icon1.png`);
        this.load.image(ASSET_ENUMS.AVATAR_AI,  `${assetPath}/icon1.png`);

        assetPath = 'assets/backart';
        this.load.image(ASSET_ENUMS.CARD_BACK1,  `${assetPath}/sleeve-0.png`);
        this.load.image(ASSET_ENUMS.CARD_BACK2,  `${assetPath}/don-sleeve-0.png`);

        assetPath = 'assets/packart';
        this.load.image(ASSET_ENUMS.PACK_ART_OP01,  `${assetPath}/OP01.png`);
        this.load.image(ASSET_ENUMS.PACK_ART_OP02,  `${assetPath}/OP02.png`);
        this.load.image(ASSET_ENUMS.PACK_ART_OP03,  `${assetPath}/OP03.png`);
        this.load.image(ASSET_ENUMS.PACK_ART_ST01,  `${assetPath}/ST01.png`);
        this.load.image(ASSET_ENUMS.PACK_ART_ST02,  `${assetPath}/ST02.png`);
        this.load.image(ASSET_ENUMS.PACK_ART_ST03,  `${assetPath}/ST03.png`);
        this.load.image(ASSET_ENUMS.PACK_ART_ST04,  `${assetPath}/ST04.png`);

        assetPath = 'assets/icons/banners';
        this.load.image(ASSET_ENUMS.BANNER_OP01, `${assetPath}/OP01_banner.webp`);	
        this.load.image(ASSET_ENUMS.BANNER_OP02, `${assetPath}/OP02_banner.webp`);
        this.load.image(ASSET_ENUMS.BANNER_OP03, `${assetPath}/OP03_banner.webp`);
        this.load.image(ASSET_ENUMS.BANNER_ST01, `${assetPath}/ST01_banner.webp`);
        this.load.image(ASSET_ENUMS.BANNER_ST02, `${assetPath}/ST02_banner.webp`);
        this.load.image(ASSET_ENUMS.BANNER_ST03, `${assetPath}/ST03_banner.webp`);
        this.load.image(ASSET_ENUMS.BANNER_ST04, `${assetPath}/ST04_banner.webp`);

        assetPath = 'assets/icons/colorsymbols';
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_RED,  `${assetPath}/OP_RED.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_GREEN,  `${assetPath}/OP_GREEN.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_BLUE,  `${assetPath}/OP_BLUE.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_PURPLE,  `${assetPath}/OP_PURPLE.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_BLACK,  `${assetPath}/OP_BLACK.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_YELLOW,  `${assetPath}/OP_YELLOW.png`);
        this.load.image(ASSET_ENUMS.ICON_FONT_RED,  `${assetPath}/OP_FONT_RED.png`);
        this.load.image(ASSET_ENUMS.ICON_FONT_GREEN,  `${assetPath}/OP_FONT_GREEN.png`);
        this.load.image(ASSET_ENUMS.ICON_FONT_BLUE,  `${assetPath}/OP_FONT_BLUE.png`);
        this.load.image(ASSET_ENUMS.ICON_FONT_PURPLE,  `${assetPath}/OP_FONT_PURPLE.png`);
        this.load.image(ASSET_ENUMS.ICON_FONT_BLACK,  `${assetPath}/OP_FONT_BLACK.png`);
        this.load.image(ASSET_ENUMS.ICON_FONT_YELLOW,  `${assetPath}/OP_FONT_YELLOW.png`);

        assetPath = 'assets/icons/costicons';
        this.load.image(ASSET_ENUMS.COST_BLACK_0,  `${assetPath}/BLACK_0.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_1,  `${assetPath}/BLACK_1.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_2,  `${assetPath}/BLACK_2.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_3,  `${assetPath}/BLACK_3.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_4,  `${assetPath}/BLACK_4.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_5,  `${assetPath}/BLACK_5.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_6,  `${assetPath}/BLACK_6.png`);
        this.load.image(ASSET_ENUMS.COST_BLACK_8,  `${assetPath}/BLACK_8.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_0,  `${assetPath}/BLUE_0.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_1,  `${assetPath}/BLUE_1.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_2,  `${assetPath}/BLUE_2.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_3,  `${assetPath}/BLUE_3.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_4,  `${assetPath}/BLUE_4.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_5,  `${assetPath}/BLUE_5.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_6,  `${assetPath}/BLUE_6.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_7,  `${assetPath}/BLUE_7.png`);
        this.load.image(ASSET_ENUMS.COST_BLUE_9,  `${assetPath}/BLUE_9.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_1,  `${assetPath}/GREEN_1.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_2,  `${assetPath}/GREEN_2.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_3,  `${assetPath}/GREEN_3.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_4,  `${assetPath}/GREEN_4.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_5,  `${assetPath}/GREEN_5.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_6,  `${assetPath}/GREEN_6.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_7,  `${assetPath}/GREEN_7.png`);
        this.load.image(ASSET_ENUMS.COST_GREEN_8,  `${assetPath}/GREEN_8.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_0,  `${assetPath}/PURPLE_0.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_1,  `${assetPath}/PURPLE_1.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_2,  `${assetPath}/PURPLE_2.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_3,  `${assetPath}/PURPLE_3.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_4,  `${assetPath}/PURPLE_4.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_5,  `${assetPath}/PURPLE_5.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_6,  `${assetPath}/PURPLE_6.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_7,  `${assetPath}/PURPLE_7.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_8,  `${assetPath}/PURPLE_8.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_9,  `${assetPath}/PURPLE_9.png`);
        this.load.image(ASSET_ENUMS.COST_PURPLE_10,  `${assetPath}/PURPLE_10.png`);
        this.load.image(ASSET_ENUMS.COST_RED_1,  `${assetPath}/RED_1.png`);
        this.load.image(ASSET_ENUMS.COST_RED_2,  `${assetPath}/RED_2.png`);
        this.load.image(ASSET_ENUMS.COST_RED_3,  `${assetPath}/RED_3.png`);
        this.load.image(ASSET_ENUMS.COST_RED_4,  `${assetPath}/RED_4.png`);
        this.load.image(ASSET_ENUMS.COST_RED_5,  `${assetPath}/RED_5.png`);
        this.load.image(ASSET_ENUMS.COST_RED_6,  `${assetPath}/RED_6.png`);
        this.load.image(ASSET_ENUMS.COST_RED_7,  `${assetPath}/RED_7.png`);
        this.load.image(ASSET_ENUMS.COST_RED_9,  `${assetPath}/RED_9.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_1,  `${assetPath}/YELLOW_1.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_2,  `${assetPath}/YELLOW_2.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_3,  `${assetPath}/YELLOW_3.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_4,  `${assetPath}/YELLOW_4.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_5,  `${assetPath}/YELLOW_5.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_9,  `${assetPath}/YELLOW_8.png`);
        this.load.image(ASSET_ENUMS.COST_YELLOW_10,  `${assetPath}/YELLOW_10.png`);

        assetPath = 'assets/icons/leadercolorsymbols';
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_BLACK,  `${assetPath}/LEADER_BLACK.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_BLACK_YELLOW,  `${assetPath}/LEADER_BLACK_YELLOW.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_BLUE_PURPLE,  `${assetPath}/LEADER_BLUE_PURPLE.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_BLUE,  `${assetPath}/LEADER_BLUE.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_GREEN_BLUE,  `${assetPath}/LEADER_GREEN_BLUE.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_GREEN_YELLOW,  `${assetPath}/LEADER_GREEN_YELLOW.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_GREEN,  `${assetPath}/LEADER_GREEN.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_PURPLE_BLACK,  `${assetPath}/LEADER_PURPLE_BLACK.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_PURPLE,  `${assetPath}/LEADER_PURPLE.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_RED_BLACK,  `${assetPath}/LEADER_RED_BLACK.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_RED_GREEN,  `${assetPath}/LEADER_RED_GREEN.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_RED,  `${assetPath}/LEADER_RED.png`);
        this.load.image(ASSET_ENUMS.ICON_SYMBOL_LEADER_YELLOW,  `${assetPath}/LEADER_YELLOW.png`);

        assetPath = 'assets/icons/leaderportraits';
        this.load.image(ASSET_ENUMS.LEADER_OP01_001,  `${assetPath}/rleaderart_OP01-001.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_002,  `${assetPath}/rleaderart_OP01-002.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_003,  `${assetPath}/rleaderart_OP01-003.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_031,  `${assetPath}/rleaderart_OP01-031.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_060,  `${assetPath}/rleaderart_OP01-060.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_061,  `${assetPath}/rleaderart_OP01-061.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_062,  `${assetPath}/rleaderart_OP01-062.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP01_091,  `${assetPath}/rleaderart_OP01-091.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_001,  `${assetPath}/rleaderart_OP02-001.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_002,  `${assetPath}/rleaderart_OP02-002.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_025,  `${assetPath}/rleaderart_OP02-025.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_026,  `${assetPath}/rleaderart_OP02-026.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_049,  `${assetPath}/rleaderart_OP02-049.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_071,  `${assetPath}/rleaderart_OP02-071.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_072,  `${assetPath}/rleaderart_OP02-072.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP02_093,  `${assetPath}/rleaderart_OP02-093.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_001,  `${assetPath}/rleaderart_OP03-001.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_021,  `${assetPath}/rleaderart_OP03-021.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_022,  `${assetPath}/rleaderart_OP03-022.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_040,  `${assetPath}/rleaderart_OP03-040.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_058,  `${assetPath}/rleaderart_OP03-058.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_076,  `${assetPath}/rleaderart_OP03-076.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_077,  `${assetPath}/rleaderart_OP03-077.png`);
        this.load.image(ASSET_ENUMS.LEADER_OP03_099,  `${assetPath}/rleaderart_OP03-099.png`);
        this.load.image(ASSET_ENUMS.LEADER_ST01_001,  `${assetPath}/rleaderart_ST01-001.png`);
        this.load.image(ASSET_ENUMS.LEADER_ST02_001,  `${assetPath}/rleaderart_ST02-001.png`);
        this.load.image(ASSET_ENUMS.LEADER_ST03_001,  `${assetPath}/rleaderart_ST03-001.png`);
        this.load.image(ASSET_ENUMS.LEADER_ST04_001,  `${assetPath}/rleaderart_ST04-001.png`);

        assetPath = 'assets/icons/attributesymbols';
        this.load.image(ASSET_ENUMS.ICON_ATTRIBUTE_SYMBOL_RANGED,  `${assetPath}/RANGED.png`);
        this.load.image(ASSET_ENUMS.ICON_ATTRIBUTE_SYMBOL_SLASH,  `${assetPath}/SLASH.png`);
        this.load.image(ASSET_ENUMS.ICON_ATTRIBUTE_SYMBOL_SPECIAL,  `${assetPath}/SPECIAL.png`);
        this.load.image(ASSET_ENUMS.ICON_ATTRIBUTE_SYMBOL_STRIKE,  `${assetPath}/STRIKE.png`);
        this.load.image(ASSET_ENUMS.ICON_ATTRIBUTE_SYMBOL_WISDOM,  `${assetPath}/WISDOM.png`);

        assetPath = 'assets/icons/deckselectionbanners';
        this.load.image(ASSET_ENUMS.BANNER_RED, `${assetPath}/banner_red.png`);
        this.load.image(ASSET_ENUMS.BANNER_GREEN, `${assetPath}/banner_green.png`);
        this.load.image(ASSET_ENUMS.BANNER_BLUE, `${assetPath}/banner_blue.png`);
        this.load.image(ASSET_ENUMS.BANNER_BLACK, `${assetPath}/banner_black.png`);
        this.load.image(ASSET_ENUMS.BANNER_PURPLE, `${assetPath}/banner_purple.png`);
        this.load.image(ASSET_ENUMS.BANNER_YELLOW, `${assetPath}/banner_yellow.png`);

        assetPath = 'assets/icons';
        this.load.image(ASSET_ENUMS.ICON_COUNTER, `${assetPath}/counter_icon.png`);

        assetPath = 'assets/images';
        this.load.image(ASSET_ENUMS.IMAGE_INTRO_LUFFY,  `${assetPath}/luffy_intro.png`);
        this.load.image(ASSET_ENUMS.IMAGE_INTRO_STARTER_MESSAGE,  `${assetPath}/starter_message.png`);
        this.load.image(ASSET_ENUMS.IMAGE_INTRO_DESCRIPTION_ST01,  `${assetPath}/description_ST01.png`);
        this.load.image(ASSET_ENUMS.IMAGE_INTRO_DESCRIPTION_ST02,  `${assetPath}/description_ST02.png`);
        this.load.image(ASSET_ENUMS.IMAGE_INTRO_DESCRIPTION_ST03,  `${assetPath}/description_ST03.png`);
        this.load.image(ASSET_ENUMS.IMAGE_INTRO_DESCRIPTION_ST04,  `${assetPath}/description_ST04.png`);
        this.load.image(ASSET_ENUMS.IMAGE_PACK_OPEN_TITLE, `${assetPath}/openPackTitle.png`);
        this.load.image(ASSET_ENUMS.IMAGE_SHOP_TITLE, `${assetPath}/shopTitle.png`);
        this.load.image(ASSET_ENUMS.IMAGE_DECK_SELECTION_TITLE, `${assetPath}/deckSelectionTitle.png`);
        this.load.image(ASSET_ENUMS.IMAGE_PACK_OPEN_PLACEHOLDER, `${assetPath}/openPackPlaceholder.png`);
        this.load.image(ASSET_ENUMS.IMAGE_SHOP_ITEM_PLACEHOLDER, `${assetPath}/shopitemPlaceholder.png`);
        this.load.image(ASSET_ENUMS.IMAGE_SHOP_EMPTY_PLACEHOLDER, `${assetPath}/shopEmptyPlaceholder.png`);	
        this.load.image(ASSET_ENUMS.IMAGE_TREASURE_CHEST, `${assetPath}/treasure_chest.png`);
        this.load.image(ASSET_ENUMS.IMAGE_MULLIGAN_TITLE, `${assetPath}/mulliganTitle.png`);

        assetPath = 'assets/shaders';
        this.load.glsl(SHADER_ENUMS.GREYSCALE_SHADER, `${assetPath}/greyscale_shader.frag`);
        this.load.glsl(SHADER_ENUMS.ORANGE_TO_PURPLE_SHADER, `${assetPath}/purple_to_orange_shader.frag`);
        this.load.glsl(SHADER_ENUMS.BLUE_TINT_SHADER, `${assetPath}/dark_blue_tint_shader.frag`);
        this.load.glsl(SHADER_ENUMS.GLOWING_BORDER_BLUE_SHADER, `${assetPath}/glowing_border_blue_shader.frag`);
        this.load.glsl(SHADER_ENUMS.RIGHT_BORDER_RIPPED_SHADER, `${assetPath}/right_border_ripped_shader.frag`);
        this.load.glsl(SHADER_ENUMS.LEFT_BORDER_RIPPED_SHADER, `${assetPath}/left_border_ripped_shader.frag`);
        this.load.glsl(SHADER_ENUMS.BURNING_SHADER, `${assetPath}/burning_shader.frag`);
        this.load.glsl(SHADER_ENUMS.BLURING_SHADER, `${assetPath}/blurring_shader.frag`);

        assetPath = 'assets/images/game';
        this.load.image(ASSET_ENUMS.GAME_ACTIVE_PLAYER_INFO, `${assetPath}/activePlayerInfo.png`);
        this.load.image(ASSET_ENUMS.GAME_PASSIVE_PLAYER_INFO, `${assetPath}/passivePlayerInfo.png`);
        this.load.image(ASSET_ENUMS.GAME_DON_SMALL, `${assetPath}/don_small.png`);
        this.load.image(ASSET_ENUMS.GAME_PHASE_BOX, `${assetPath}/phaseBox.png`);
        this.load.image(ASSET_ENUMS.GAME_VS_ICON, `${assetPath}/vsIcon.png`);
        this.load.image(ASSET_ENUMS.GAME_ONOMATOPE_IMAGE, `${assetPath}/onomatope.png`);
        this.load.image(ASSET_ENUMS.GAME_NEXT_TURN_IMAGE, `${assetPath}/nextTurnIcon.png`);
        this.load.image(ASSET_ENUMS.GAME_START_TURN_IMAGE, `${assetPath}/startTurnIcon.png`);

        assetPath = 'assets/cardart';
        this.load.image(ASSET_ENUMS.DON_CARD, `${assetPath}/don.png`);
        
        assetPath = 'assets/spritesheets';
        this.load.spritesheet(ASSET_ENUMS.SKULL_SPRITESHEET, `${assetPath}/skull_spritesheet.png`, { frameWidth: 400, frameHeight: 300 });	
        this.load.spritesheet(ASSET_ENUMS.GOING_MERRY_SPRITESHEET, `${assetPath}/merry_loader.png`, { frameWidth: 524, frameHeight: 321 });
        this.load.spritesheet(ASSET_ENUMS.LOADING_SPRITESHEET, `${assetPath}/loading_gif.png`, { frameWidth: 479, frameHeight: 236 });

        assetPath = 'assets/dom';
        this.load.html('nameform', `${assetPath}/loginform.html`);

        this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI'); //plugins
        
        this.load.plugin('rexcirclemaskimageplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcirclemaskimageplugin.min.js', true);
        this.load.plugin('rextexteditplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rextexteditplugin.min.js', true);
        this.load.plugin('rexbbcodetextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexbbcodetextplugin.min.js', true);
        this.load.plugin('rexroundrectangleplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectangleplugin.min.js', true);
        this.load.plugin('rexroundrectanglecanvasplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexroundrectanglecanvasplugin.min.js', true);
    }

    create() {
        const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
        const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
        
        // @ts-ignore
        this.renderer.pipelines.add(PIPELINE_ENUMS.GREYSCALE_PIPELINE, new GreyscalePipeline(this.game));
        // @ts-ignore
        this.renderer.pipelines.add(PIPELINE_ENUMS.PURPLE_TO_ORANGE_PIPELINE, new OrangeToPurplePipeline(this.game));
        this.renderer.pipelines.add(PIPELINE_ENUMS.BLUE_TINT_PIPELINE, new BlueTintPipeline(this.game));
        this.renderer.pipelines.add(PIPELINE_ENUMS.GLOWING_BORDER_BLUE_PIPELINE, new GlowingBorderBluePipeline(this.game));
        this.renderer.pipelines.add(PIPELINE_ENUMS.RIGHT_BORDER_RIPPED_PIPELINE, new RightBorderRippedPipeline(this.game));
        this.renderer.pipelines.add(PIPELINE_ENUMS.LEFT_BORDER_RIPPED_PIPELINE, new LeftBorderRippedPipeline(this.game));
        this.renderer.pipelines.add(PIPELINE_ENUMS.BURNING_PIPELINE, new BurningPipeline(this.game));
        this.renderer.pipelines.add(PIPELINE_ENUMS.BLURING_PIPELINE, new BlurringPipeline(this.game));

        ///create Animations
        this.anims.create({
            key: ANIMATION_ENUMS.SKULL_WAITING_ANIMATION,
            frames: this.anims.generateFrameNumbers(ASSET_ENUMS.SKULL_SPRITESHEET, { start: 0, end: 231 }),
            frameRate: 60,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATION_ENUMS.GOING_MERRY_ANIMATION,
            frames: this.anims.generateFrameNumbers(ASSET_ENUMS.GOING_MERRY_SPRITESHEET, { start: 0, end: 23}),
            frameRate: 60,
            repeat: -1
        });

        this.anims.create({
            key: ANIMATION_ENUMS.LOADING_ANIMATION,
            frames: this.anims.generateFrameNumbers(ASSET_ENUMS.LOADING_SPRITESHEET, { start: 0, end: 114}),
            frameRate: 20,
            repeat: -1
        });

        let welcomeText = this.make.text({
            x : screenCenterX,
            y : screenCenterY+50,
            text: "Welcome to One Piece",
            style: {
                font: "24px OnePieceFont",
                color: COLOR_ENUMS_CSS.OP_CREAM
            }
        });
        welcomeText.setOrigin(0.5, 0.5);

        this.time.addEvent({
            delay: 10,
            loop: false,
            callback: () => {
                this.scene.start(SCENE_ENUMS.LOGIN);
            }
        })
    }
}