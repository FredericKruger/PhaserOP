class GameCardUI extends BaseCardUI{

    //#region CONSTRUCTOR
    /**
     * 
     * @param {GameScene} scene 
     * @param {PlayerScene} playerScene 
     * @param {Object} config 
     */
    constructor(scene, playerScene, config){ 
        super(scene, playerScene, config);

        this.cardData = config.cardData;
        this.id = config.id;

        //Attahed Cards
        /** @type {Array<DonCardUI>} */
        this.attachedDon = [];
        /** @type {DonCardUI} */
        this.hoveredDon = null; //To store the hovered don card
        /** @type {Array<GameCardUI>} */
        this.attachedCounter = []; //To store the attached counter card
        /** @type {GameCardUI} */
        this.tempAttachedCounter = null; //To store the card that is currently hovered above
        /** @type {number} */
        this.eventCounterPower = 0; //To store the addition power given by a counter event
        /** @type {number} */
        this.turnEventPowerAmount = 0; //To store the addition power given by a turn event
        /** @type {number} */
        this.gameEventPowerAmount = 0; //To store the addition power given by a turn event

        /** @type {number} */
        this.passiveEventPower = 0; //To store the addition power given by a passive event

        //Abilities
        /** @type {Array<Ability>} */
        this.abilities = [];
        this.abilityButtons = [];

        //STATE VARIABLES
        this.fsmState = new InDeckState(this);
        this.isInPlayAnimation = false;

        this.donFanShowing = false;
        this.donFanManual = false;

        this.counterFanShowing = false;
        this.counterFanShowingManual = false;

        this.turnPlayed = true; //To store if the card was played in the current turn

        this.hasRush = false; //To store if the card has rush

        //Button visibility overrides to show in case of opponent activating buttons
        this.blockerButton_manualOverride = false;

        this.isTargetted = false;
        this.originalScale = null; //To store the original scale of the card    
        this.targetingTweens = [];
    }
    //#endregion

    //#region CREATE FUNCTION
    /**Function to create the card */
    create() {
        //Call Parent create
        super.create();
        
        //Prepare power box
        this.powerBox = this.scene.add.graphics();
        this.drawPowerBox(COLOR_ENUMS.OP_BLACK);
        this.powerBox.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.powerBox);

        //In Location Power Text
        this.locationPowerText = this.scene.add.text(
            0, this.backArt.displayHeight*0.5, '',
            {font: "1000 150px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "center",
                stroke: COLOR_ENUMS_CSS.OP_BLACK, strokeThickness: 10
            }
        ).setOrigin(0.5);
        this.obj.push(this.locationPowerText);

        //Prepare cost icon
        this.costIcon = this.scene.add.image(-this.backArt.displayWidth*0.46, -this.backArt.displayHeight*0.46, '');
        this.costIcon.setScale(1.8);
        this.costIcon.preFX.addGlow(COLOR_ENUMS.OP_WHITE, 4);
        this.costIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.costIcon);

        //Prepare powerTest
        this.powerText = this.scene.add.text(
            -this.backArt.displayWidth*0.5 + this.backArt.displayWidth*0.06, 
            -this.backArt.displayHeight*0.5 + this.backArt.displayHeight*0.175, 
            "10000", 
            {font: "60px OnePieceTCGFont", color: COLOR_ENUMS_CSS.OP_WHITE, align: "right"}
        );
        this.powerText.setAngle(-90);
        this.powerText.setOrigin(1, 0.5);
        this.powerText.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.powerText);

        //Prepare counter icon
        this.counterIcon = this.scene.add.image(-this.backArt.displayWidth*0.5 + this.backArt.displayWidth*0.175, -this.backArt.displayHeight*0.5 + this.backArt.displayHeight*0.015, ASSET_ENUMS.ICON_COUNTER);
        this.counterIcon.setScale(0.25);
        this.counterIcon.setVisible(this.state === CARD_STATES.IN_HAND);
        this.obj.push(this.counterIcon);

        //prepare buttons
        this.blockerButton = null;

        //Text for the attached don amount
        let textStyle =  {font: "1000 200px OnePieceFont", color: COLOR_ENUMS_CSS.OP_BLUE, align: "center"};
        if(this.playerScene.playerPosition === PLAYER_POSITIONS.TOP) textStyle = {font: "1000 200px OnePieceFont", color: COLOR_ENUMS_CSS.OP_RED, align: "center"};
        this.attachedDonText = this.scene.add.text(
            - this.backArt.displayWidth*0.5 - GAME_UI_CONSTANTS.CARD_ART_WIDTH/2*CARD_SCALE.DON_IN_ACTIVE_DON, 
            - GAME_UI_CONSTANTS.CARD_ART_HEIGHT*CARD_SCALE.DON_IN_ACTIVE_DON, 'x', 
            textStyle
        ).setOrigin(0.5);
        this.attachedDonText.setAngle(-20);
        this.attachedDonText.setVisible(false);
        this.obj.push(this.attachedDonText);

        this.setScale(this.currentScale);
    }

    //Draw the powerBox 
    drawPowerBox(color) {
        this.powerBox.clear();
        this.powerBox.fillStyle(color, 1); // Black color with 50% opacity
        this.powerBox.fillRoundedRect(
            -this.backArt.displayWidth*0.5, 
            -this.backArt.displayHeight*0.5, 
            this.backArt.displayWidth*0.12,
            this.backArt.displayHeight, 
            {tl: 10, tr: 0, br: 0, bl:10}); // 10 is padding, 15 is corner
    }
    //#endregion

    //#region UPDATE CARD DATA
    /** Update Card Data 
     * @param {Object} cardData
     * @param {boolean} flipCard
    */
    updateCardData(cardData, flipCard) {
        this.cardData = cardData;

        AbilityFactory.attachAbilitiesToCard(this, cardData.abilities); //Create the abilities
        
        let textures = [];
        let cardArtKey = this.cardData.art;

        let callback = () => {
            this.frontArt.setTexture(this.cardData.art);
            if(this.playerScene.player.isActivePlayer) {
                this.costIcon.setTexture(this.scene.game.utilFunctions.getCardCost(this.cardData.colors, this.cardData.cost));
                this.drawPowerBox(this.scene.game.utilFunctions.getCardColor(this.cardData.colors[0]));
                this.powerText.setText(this.cardData.power);
                this.counterIcon.setVisible(this.cardData.counter && this.state === CARD_STATES.IN_HAND);
            }

            this.locationPowerText.setText(this.cardData.power);
            this.locationPowerText.setVisible(this.state === CARD_STATES.IN_PLAY || this.state === CARD_STATES.IN_PLAY_RESTED);
            if(flipCard) this.flipCard();

            this.createAbilityButtons(); //Create the ability buttons

            this.setDepth(this.cardDepth);
        };

        textures.push({
            key: cardArtKey,
            path: `assets/cardart/${cardArtKey}.png`
        });

        for(let ability of this.abilities) {
            if(ability.art) {
                textures.push({
                    key: ability.art.art,
                    path: `assets/abilityart/${ability.art.art}.png`
                });
            }
        }

        this.scene.game.loaderManager.addJob(new LoaderJob(this.scene, textures, callback));       
    }

    /** function to create the ability buttons */
    createAbilityButtons() {
        for(let ability of this.abilities) {
            let abilityButton = new AbilityButton(this.scene, this, ability);
            this.obj.push(abilityButton);
            this.abilityButtons.push(abilityButton);
            this.add(abilityButton);

            if(ability.type === 'BLOCKER') this.blockerButton = abilityButton;
        }
    }

    //#endregion

    //#region STATE FUNCTIONS
    /** Set card state
     * @param {string} state
     */
    setState(state) {
        this.state = state;
        this.setFSMState(state);
        this.exertCard(this.state);
    }


    /** Set the Final State Machine state from the state
     * @param {string} state
     */
    setFSMState(state) {
        switch(state) {
            case CARD_STATES.IN_DECK:
            case CARD_STATES.IN_DISCARD:
            case CARD_STATES.IN_PLAY_ATTACHED:
                this.fsmState.exit(GAME_CARD_STATES.IN_DECK);
                break;
            case CARD_STATES.IN_HAND:
            case CARD_STATES.IN_HAND_HOVERED:
                this.fsmState.exit(GAME_CARD_STATES.IN_HAND);
                break;
            case CARD_STATES.IN_HAND_PASSIVE_PLAYER:
            case CARD_STATES.IN_HAND_HOVERED_PASSIVEPLAYER:
                this.fsmState.exit(GAME_CARD_STATES.IN_DECK);
                break;
            case CARD_STATES.TRAVELLING_FROM_HAND:
            case CARD_STATES.TRAVELLING_TO_DECK:
            case CARD_STATES.LEADER_TRAVELLING_TO_LOCATION:
            case CARD_STATES.TRAVELLING_TO_HAND:
            case CARD_STATES.IN_MULLIGAN: 
                this.fsmState.exit(GAME_CARD_STATES.TRAVELLING);
                break;
            case CARD_STATES.TRAVELLING_DURING_COUNTER:
                this.fsmState.exit(GAME_CARD_STATES.TRAVELLING_DURING_COUNTER);
                break;
            case CARD_STATES.IN_PLAY:
            case CARD_STATES.IN_PLAY_RESTED:
            case CARD_STATES.IN_PLAY_ATTACKING:
            case CARD_STATES.IN_PLAY_DEFENDING:
                this.fsmState.exit(GAME_CARD_STATES.IN_PLAY);
                break;
            case CARD_STATES.IN_PLAY_FIRST_TURN:
                this.fsmState.exit(GAME_CARD_STATES.FIRST_TURN);
                break;
        }
    }
    //#endregion

    //#region UPDATE UI FUNCTIONS
    /** Function to update the power of the card 
     * DON cards are only counted during tje players active turn
    */
    updatePowerText() {
        let currentPower = this.getPower();
        this.locationPowerText.setText(currentPower);

        if(currentPower > this.cardData.power) this.locationPowerText.setColor(COLOR_ENUMS_CSS.OP_GREEN);
        else if(currentPower < this.cardData.power) this.locationPowerText.setColor(COLOR_ENUMS_CSS.OP_RED);
        else this.locationPowerText.setColor(COLOR_ENUMS_CSS.OP_WHITE);
    }

    /** Function to update the number of attached Don */
    updateAttachedDonText() {
        this.attachedDonText.setText("x" + this.attachedDon.length);
        this.attachedDonText.setVisible(this.attachedDon.length > 1);
    }

    /** Function to reposition all the attached don cards 
     * @param {boolean} isNewCard - Whether a new card was just attached
     * @param {DonCardUI} newDonCard - The newly attached DON card (optional)
     */
    updateAttachedDonPosition(isNewCard = false, newDonCard = null) {
        // If there are no attached DON cards, nothing to do
        if (this.attachedDon.length === 0) return;
        
        // First, ensure all DON cards are properly depth-sorted
        for (let don of this.attachedDon) {
            this.scene.children.sendToBack(don);
        }

        // If a new card was just attached, animate it
        if (isNewCard) {
            // Duration settings for the animation
            const fanOutDuration = 200;
            const holdDuration = 500;
            const fanInDuration = 250;
            
            // Step 1: Fan out the existing DON cards
            this.fanOutDonCards(fanOutDuration);
            
            // Step 2: After fanning out, add the new card with effects
            if (newDonCard) {
                this.scene.time.delayedCall(fanOutDuration, () => {
                    this.animateNewDonCard(newDonCard, fanOutDuration);
                });
            }
            
            // Step 3: Fan all cards back in to their final position
            if(!this.getBounds().contains(this.scene.game.input.mousePointer.x, this.scene.game.input.mousePointer.y)) {
                this.scene.time.delayedCall(fanOutDuration + holdDuration, () => {
                    this.fanInDonCards(fanInDuration);
                });
            }
        } else {
            // For non-animated updates, just set the positions directly
            for (let don of this.attachedDon) {
                don.moveTo(this.x - this.displayWidth/2 + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.DON_IN_ACTIVE_DON, this.y, false, false, false);
            }
            
            // Update counter text without animation
            this.attachedDonText.setText("x" + this.attachedDon.length);
        }
        
        // Ensure power text is updated since DON cards affect power
        this.updatePowerText();
    }

    /** Function to reposition all the attached counter cards 
     * @param {boolean} isNewCard - Whether a new card was just attached
     * @param {GameCardUI} newCounterCard - The newly attached counter card (optional)
     */
    updateAttachedCounterPosition(isNewCard = false, newCounterCard = null) {
        // If there are no attached DON cards, nothing to do
        if (this.attachedCounter.length === 0) return;
        
        // First, ensure all DON cards are properly depth-sorted
        for (let counter of this.attachedCounter) {
            this.scene.children.sendToBack(counter);
        }

        // If a new card was just attached, animate it
        if (isNewCard) {
            // Duration settings for the animation
            const fanOutDuration = 200;
            const holdDuration = 500;
            const fanInDuration = 250;
            
            // Step 1: Fan out the existing DON cards
            this.fanOutCounterCards(fanOutDuration);
            
            // Step 2: After fanning out, add the new card with effects
            if (newCounterCard) {
                this.scene.time.delayedCall(fanOutDuration, () => {
                    this.animateNewCounterCard(newCounterCard, fanOutDuration);
                });
            }
            
            // Step 3: Fan all cards back in to their final position
            if(!this.getBounds().contains(this.scene.game.input.mousePointer.x, this.scene.game.input.mousePointer.y)) {
                this.scene.time.delayedCall(fanOutDuration + holdDuration, () => {
                    this.fanInCounterCards(fanInDuration);
                });
            }
        } else {
            let counterStartPosition = this.displayHeight / 2 * 0.45;
            for(let attachedCounter of this.attachedCounter) {
                this.scene.children.sendToBack(attachedCounter);
                attachedCounter.scaleTo(CARD_SCALE.DON_IN_ACTIVE_DON, true, false, false);   
                
                if (this.angle === -90) {
                    attachedCounter.moveTo(this.x - counterStartPosition, this.y - this.displayWidth * 0.25, true, false, false);
                    attachedCounter.angleTo(-70, true, false, false); // Adjust angle accordingly
                } else {
                    attachedCounter.moveTo(this.x + this.displayWidth * 0.25, this.y - counterStartPosition, true, false, false);
                    attachedCounter.angleTo(20, true, false, false);
                }

                counterStartPosition -= 5;
            }
        }
    }
    //#endregion

    //#region UTIL FUNCTIONS
    /** Function to set the exert art
     * @param {string} state
     */
    exertCard(state) {
        if(this.cardData && this.cardData.card === CARD_TYPES.CHARACTER) {
            switch(state) {
                case CARD_STATES.IN_PLAY_RESTED:
                case CARD_STATES.IN_PLAY_ATTACKING:
                    this.angleTo(-90, true, false, false);
                    //this.frontArt.angle = -90;
                    break;
                case CARD_STATES.IN_PLAY:
                case CARD_STATES.IN_PLAY_FIRST_TURN:
                    this.angleTo(0, true, false, false);
                    //this.frontArt.angle = 0;
                    break;
                default:
                    break;
            }
        } else if(this.cardData && this.cardData.card === CARD_TYPES.LEADER) {
            switch(state) {
                case CARD_STATES.IN_PLAY_RESTED:
                case CARD_STATES.IN_PLAY_ATTACKING:
                    this.angleTo(-90, true, false, false);
                    //this.frontArt.angle = -90;
                    break;
                case CARD_STATES.IN_PLAY:
                case CARD_STATES.IN_PLAY_FIRST_TURN:
                    this.angleTo(0, true, false, false);
                    //this.frontArt.angle = 0;
                    break;
                case CARD_STATES.IN_PLAY_DEFENDING:
                default:
                    break;
            }
        } else if(this.cardData && this.cardData.card === CARD_TYPES.STAGE) {
            switch(state) {
                case CARD_STATES.IN_PLAY_RESTED:
                    this.angleTo(-90, true, false, false);
                    //this.frontArt.angle = -90;
                    break;
                case CARD_STATES.IN_PLAY:
                case CARD_STATES.IN_PLAY_FIRST_TURN:
                    this.angleTo(0, true, false, false);
                    //this.frontArt.angle = 0;
                    break;
                default:
                    break;
            }
        } 
    }

    /** Checks if a card has a specific ability type
     * @param {string} abilityType
     * @returns {boolean}
     */
    hasAbility(abilityType) {
        if(this.abilities.length === 0) return false;

        for(let ability of this.abilities) {
            if(ability.type === abilityType) return true;
        }   
        return false;
    }

    /** Function that returns an ability according to the abiliy Id 
     * @param {string} abilityId
     * @returns {Ability}
    */
    getAbility(abilityId) {
        for(let ability of this.abilities) {
            if(ability.id === abilityId) return ability;
        }
        return null;
    }

    /** Function to test if any ability can be activates
     * @returns {boolean}
     */
    canActivateAbilities() {
        for(let ability of this.abilities) 
            if(ability.canActivate(this, this.scene.gameState.name)) return true;

        return false;
    }

    /** Function to return a cards power
     * @returns {number}
     */
    getPower() {
        let currentPower = this.cardData.power;
        //If the card is in play and it is the players turn add the power of the attached don cards
        if(this.playerScene.isPlayerTurn) {
            currentPower += this.attachedDon.length*1000;
            if(this.hoveredDon !== null) currentPower += 1000;
            currentPower += this.turnEventPowerAmount;
        }
        currentPower += this.gameEventPowerAmount; //Add power from permanent effects   
        currentPower += this.eventCounterPower;
        currentPower += this.passiveEventPower;
        if(this.tempAttachedCounter) currentPower += this.tempAttachedCounter.cardData.counter;
        for(let counter of this.attachedCounter) currentPower += counter.cardData.counter;

        return currentPower;
    }

    /** Function to retrieve an attached don from the id
     * @param {number} donId
     * @returns {DonCardUI}
     */
    getAttachedDon(donId) {
        return this.attachedDon.find(don => don.id === donId);
    }

    /** Function to remove a don card form the attached array
     * @param {number} donId
     */
    removeAttachedDon(donId) {
        this.attachedDon = this.attachedDon.filter(don => don.id !== donId);
        this.attachedDonText.setText("x" + this.attachedDon.length);
    }

    /** Function to retrieve an attached counter card from the id
     * @param {number} counterId
     * @returns {GameCardUI}
     */
    getAttachedCounter(cardid) {
        return this.attachedCounter.find(counter => counter.id === cardid);
    }

    /** Function to remove a counter card from the attached array
     * @param {number} cardId
     */
    removeAttachedCounter(cardId) {
        this.attachedCounter = this.attachedCounter.filter(counter => counter.id !== cardId);
    }

    /** Function to find the appropriate ability button
     * @param {string} buttonID
     * @returns {AbilityButton}
     */
    getAbilityButton(buttonID) {
        for(let button of this.abilityButtons) {
            if(button.name === buttonID) return button;
        }
        return null;
    }

    /** Reset abilities for the turn */
    resetTurn() {
        this.turnEventPowerAmount = 0; //reset power counter
        for(let ability of this.abilities) {
            ability.resetTurn();
        }
    }

    //#endregion
    
    //#region ANIMATION FUNCTIONS
    /** Function that moves the card to a location
     * @param {number} x
     * @param {number} y
     * @param {boolean} useTween
     * @param {boolean} chainTween
     * @param {boolean} clearPreviousTween
     */
    moveTo(x, y, useTween, chainTween, clearPreviousTween, playCardEffect = false) {
        if(clearPreviousTween) this.scene.tweens.killTweensOf(this);

        let duration = 200;
        if(this.state === CARD_STATES.TRAVELLING_DECK_HAND) duration = 700;

        if(useTween) {
            this.scene.tweens.add({
                targets: this,
                x: x,
                y: y,
                duration: duration,
                ease: 'linear',
                onUpdate: () => {
                    if(this.attachedDon.length > 0) this.updateAttachedDonPosition();
                    if(this.attachedCounter !== null) this.updateAttachedCounterPosition();
                },
                onComplete: () => {
                    this.x = x;
                    this.y = y;

                    if(this.state === CARD_STATES.TRAVELLING_DECK_HAND) this.setState(CARD_STATES.IN_HAND);

                    // Move attached DON cards and Counters
                    if(this.attachedDon.length > 0) this.updateAttachedDonPosition();
                    if(this.attachedCounter !== null) this.updateAttachedCounterPosition();
                }
            });
        } else {
            this.x = x;
            this.y = y;

            // Move attached DON cards and Counters
            if(this.attachedDon.length > 0) this.updateAttachedDonPosition();
            if(this.attachedCounter !== null) this.updateAttachedCounterPosition();
        }
    }

    /** Function to create an animation to enter the character ARea
     * @param {number} posX
     * @param {number} posY
     */
    enterCharacterArea(posX, posY) {
        const duration = 300;

        this.scene.tweens.add({
            targets: this,
            x: posX,
            y: posY,
            scale: CARD_SCALE.IN_LOCATION,
            duration: duration,
            ease: 'Cubic.easeIn', // More dramatic easing for card playing
            onComplete: () => {
                this.x = posX;
                this.y = posY;
                this.isInPlayAnimation = false;

                if(this.state === CARD_STATES.TRAVELLING_DECK_HAND) this.setState(CARD_STATES.IN_HAND);
                
                // Play dust explosion effect if this is a card being played
                this.playDustExplosionEffect();

                if(this.cardData.card === CARD_TYPES.CHARACTER) {
                    this.scene.time.delayedCall(300, () => {
                        this.startDizzyAnimation();
                    });
                }
            }
        });
    }

    /** 
     * Creates and plays the dust explosion effect beneath the card
     * @private
     */
    playDustExplosionEffect() {
        // Create dust explosion sprite at the card's position but slightly lower
        const dustExplosion = this.scene.add.sprite(
            this.x, 
            this.y, // Position it below the card
            ASSET_ENUMS.DUST_EXPLOSION_SPRITESHEET
        ).setScale(2.75).setOrigin(0.5);
        
        // Set the depth to be just below the card
        dustExplosion.setDepth(this.depth - 1);
        
        // Play the dust explosion animation
        dustExplosion.play(ANIMATION_ENUMS.DUST_EXPLOSION_ANIMATION);
        
        // Add a camera shake effect for more impact
        this.scene.cameras.main.shake(100, 0.005);
        
        // Add a slight scale bounce to the card
        this.scene.tweens.add({
            targets: this,
            scaleX: this.scaleX * 1.1,
            scaleY: this.scaleY * 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Quad.easeOut'
        });
        
        // Remove the explosion sprite once the animation completes
        dustExplosion.once('animationcomplete', () => {
            dustExplosion.destroy();
        });
    }

    /** Function to start the dizzy Animation */
    startDizzyAnimation() {
        if(this.turnPlayed && !this.hasRush) {
            this.dizzySprite = this.scene.add.sprite(
                0,
                -this.height/4, 
                ASSET_ENUMS.DIZZY_SPRITESHEET).setScale(2).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_PLAY);
            this.add(this.dizzySprite);
            this.dizzySprite.play(ANIMATION_ENUMS.DIZZY_ANIMATION);
        }
    }

    /** Function to stop the dizzy Animation */
    stopDizzyAnimation() {
        if(this.dizzySprite) {
            this.dizzySprite.destroy();
        }
    }

    /**
     * Animate a new DON card being added
     * @param {DonCardUI} newDonCard - The new DON card
     * @param {number} delay - Delay before animation starts
     */
    animateNewDonCard(newDonCard, delay = 0) {
        // Define the position where the new card will go
        let fanOutX = this.x - this.displayWidth/2;
        let fanOutY = this.y;

        if(this.angle === -90) {
            fanOutX = this.x - this.displayHeight/2;
            fanOutY = this.y;
        }
        
        // Move the new DON card into position with a nice animation
        this.scene.tweens.add({
            targets: newDonCard,
            x: fanOutX,
            y: fanOutY,
            angle: -20,
            scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.1, // Make it slightly larger for emphasis
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Pulse animation on the new card
                this.scene.tweens.add({
                    targets: newDonCard,
                    scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut',
                    onComplete: () => {
                        this.attachedDonText.setText("x" + this.attachedDon.length);
                        if(this.donFanShowing) this.attachedDonText.setVisible(this.attachedDon.length > 1);
                    }
                });
            }
        });
    }

    /**
     * Fan out DON cards for display
     * @param {number} duration - Animation duration in milliseconds
     */
    fanOutDonCards(duration = 200) {
        // Define the fan-out positions
        let fanOutX = this.x - this.displayWidth/2;
        let fanOutY = this.y;

        if(this.angle === -90) {
            fanOutX = this.x - this.displayHeight/2;
            fanOutY = this.y;
        }
        
        this.donFanShowing = true;

        for (let i = 0; i < this.attachedDon.length; i++) {
            const don = this.attachedDon[i];
            const offset = i * 5;
            
            this.scene.tweens.add({
                targets: don,
                x: fanOutX,
                y: fanOutY,
                angle: -20 - (i * 1), // Fan them at slightly different angles
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                duration: duration,
                ease: 'Back.easeOut',
                onComplete: () => {
                    if(this.donFanShowing) this.attachedDonText.setVisible(this.attachedDon.length > 1);
                }
            });
        }
    }

    /**
     * Fan in DON cards to their final position
     * @param {number} duration - Animation duration in milliseconds
     */
    fanInDonCards(duration = 250) {
        // Determine the final position
        let finalX = this.x - this.displayWidth/2 + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.DON_IN_ACTIVE_DON;
        let finalY = this.y;

        if(this.angle === -90) {
            finalX = this.x - this.displayHeight/2 + GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.DON_IN_ACTIVE_DON;
            finalY = this.y;
        }

        // Fan all cards back in
        for (let i = 0; i < this.attachedDon.length; i++) {
            const don = this.attachedDon[i];
            
            this.scene.tweens.add({
                targets: don,
                x: finalX,
                y: finalY,
                angle: 0,
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                duration: duration,
                ease: 'Quad.easeInOut',
                onStart: () => {
                    if(i === this.attachedDon.length - 1) {
                        this.attachedDonText.setVisible(false);
                        this.donFanShowing = false;
                    }
                }
            });
        }
    }

    /**
     * Animate a new counter card being added
     * @param {GameCardUI} newCounterCard - The new counter card
     * @param {number} delay - Delay before animation starts
     */
    animateNewCounterCard(newCounterCard, delay = 0) {
        // Define the position where the new card will go
        let fanOutX = this.x + this.displayWidth/2;
        let fanOutY = this.y - this.displayHeight/6 + this.attachedCounter.length * 5;

        if(this.angle === -90) {
            let fanOutX = this.x + this.displayHeight/2;
            let fanOutY = this.y - this.displayWidth/6 + this.attachedCounter.length * 3;
        }
        
        // Move the new DON card into position with a nice animation
        this.scene.tweens.add({
            targets: newCounterCard,
            x: fanOutX,
            y: fanOutY,
            angle: 20,
            scale: CARD_SCALE.DON_IN_ACTIVE_DON * 1.1, // Make it slightly larger for emphasis
            duration: 200,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Pulse animation on the new card
                this.scene.tweens.add({
                    targets: newCounterCard,
                    scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    /**
     * Fan out DON cards for display
     * @param {number} duration - Animation duration in milliseconds
     */
    fanOutCounterCards(duration = 200, manualFaning = false) {
        // Define the fan-out positions
        let fanOutX = this.x + this.displayWidth/2;
        let fanOutY = this.y - this.displayHeight/6;

        if(this.angle === -90) {
            fanOutX = this.x + this.displayHeight/2;
            fanOutY = this.y + this.displayWidth/6;
        }
        
        this.counterFanShowing = true;
        if(manualFaning) this.counterFanShowingManual = true;

        for (let i = 0; i < this.attachedCounter.length; i++) {
            const counter = this.attachedCounter[i];
            let offset = i * 5;
            if(this.angle === -90) offset = i * 2;
            
            this.scene.tweens.add({
                targets: counter,
                x: fanOutX,
                y: fanOutY + offset,
                angle: 20 + (i * 1), // Fan them at slightly different angles
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                duration: duration,
                ease: 'Back.easeOut'
            });
        }
    }

    /**
     * Fan in DON cards to their final position
     * @param {number} duration - Animation duration in milliseconds
     */
    fanInCounterCards(duration = 250, manualFaning = false) {
        // Determine the final position
        let finalX = this.x + this.displayWidth/2 - GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.DON_IN_ACTIVE_DON;
        let finalY = this.y;

        if(this.angle === -90) {
            finalX = this.x + this.displayHeight/2 - GAME_UI_CONSTANTS.CARD_ART_WIDTH*CARD_SCALE.DON_IN_ACTIVE_DON;
            finalY = this.y;
        }

        // Fan all cards back in
        for (let i = 0; i < this.attachedCounter.length; i++) {
            const counter = this.attachedCounter[i];
            
            this.scene.tweens.add({
                targets: counter,
                x: finalX,
                y: finalY,
                angle: 0,
                scale: CARD_SCALE.DON_IN_ACTIVE_DON,
                duration: duration,
                ease: 'Quad.easeInOut',
                onStart: () => {
                    if(i === this.attachedCounter.length - 1) {
                        if(manualFaning) this.counterFanShowingManual = false;
                        this.counterFanShowing = false;
                    }
                }
            });
        }
    }
    //#endregion

}