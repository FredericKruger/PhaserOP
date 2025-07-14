class Ability {

    constructor(config) {
        this.id = config.id;
        this.text = config.text;
        this.art = config.art;
        
        this.type = config.type;
        this.phases = config.phases || []; // When this ability can be triggered
        this.conditions = config.conditions || []; // Array of conditions that must be met
        this.states = config.states || []; // Array of states that must be met
        this.actions = config.actions || []; // Array of actions to execute

        this.target = config.target || null; // Target of the ability

        // Tracking
        this.usedThisTurn = false;
        this.usedThisGame = false;
        /** @type {GameCardUI} */
        this.card = null
        /** @type {Aura} */
        this.aura = null;
    }

    /** Function to attach the card
     * @param {GameCardUI} card
     */
    attachToCard(card) {
        this.card = card;
    }

    /** Function to attach the card
     * @param {Aura} aura
     */
    attachToAura(aura) {
        this.aura = aura;
    }

    /** Function that tests if an ability can be activated
     * @param {string} gamePhase
     * @returns {boolean}
     */
    canActivate(gamePhase) {
        // Check if in correct phase
        if (this.phases.length > 0 && !this.phases.includes(gamePhase)) {
            //console.log(`Ability ${this.id} cannot be activated in phase ${this.phases} for phase ${gamePhase}`);
            return false;
        }

        if (this.states.length > 0 && !this.states.includes(this.card.state)) {
            //console.log(`Ability ${this.id} cannot be activated in state ${this.card.state}`);
            return false;
        }

        // Check all conditions
        for (const condition of this.conditions) {
            if (!this.evaluateCondition(condition, gamePhase)) {
                //console.log(`Ability ${this.id} cannot be activated due to condition ${condition.type}`);
                return false;
            }
        }

        return true;
    }

    /** Function to evalate the conditions 
     * @param {Object} condition
     * @param {string} gamePhase
     * @returns {boolean}
     */
    evaluateCondition(condition, gamePhase) {
        // Example condition evaluation
        switch (condition.type) {
            case 'ATTACHED_DON':
                return this.card.attachedDon.length >= condition.value;
            case 'AVAILABLE_DON':
                if(this.card.playerScene.activeDonDeck.getNumberOfActiveCards() >= condition.value) return true;
                return false;
            case 'CAN_BLOCK':
                if(this.card.canBlock && condition.value) return true;
                if(!this.card.canBlock && !condition.value) return true;
                return false;
            case 'CARD_RESTED':
                if(this.card.state === CARD_STATES.IN_PLAY_RESTED && condition.value) return true;
                else if(this.card.state !== CARD_STATES.IN_PLAY_RESTED && !condition.value) return true;
                return false;
            case 'CHARACTER_COUNT':
                return this.card.playerScene.characterArea.cards.length >= condition.value;
            case 'HAS_ATTACKED_THIS_TURN':
                if(this.card.hasAttackedThisTurn() && condition.value) return true;
                if(!this.card.hasAttackedThisTurn() && !condition.value) return true;
                return false; 
            case 'MIN_CARDS_IN_HAND':
                if(this.card.playerScene.hand.cards.length >= condition.value) return true;
                return false;
            case 'ONCE':
                if(this.usedThisTurn && condition.value === 'TURN') return false;
                if(this.usedThisGame && condition.value === 'GAME') return false;
                return true;
            case 'PLAYER_TURN':
                if(this.card.playerScene.isPlayerTurn && condition.value) return true;
                return false;
            case 'PLAYED_THIS_TURN':
                if(this.card.turnPlayed === this.card.scene.gameStateManager.currentTurn && condition.value) return true;
                if(this.card.turnPlayed !== this.card.scene.gameStateManager.currentTurn && !condition.value) return true;
                return false;
            case 'TOTAL_AVAILABLE_DON':
                if((this.card.playerScene.activeDonDeck.getNumberOfActiveCards() + this.card.playerScene.activeDonDeck.getNumberOfRestingCards()) >= condition.value) return true;
                return false;
            default:
                return true;
        }
    }

    /** Function to reset the turn variables */
    resetTurn() {
        this.usedThisTurn = false;
    }

    /** Function to execute active actions from the server 
     * * @param {GameCardUI} card - The card to execute the action on
     * @param {Object} abilityInfo - The ability info from the server
     * @param {boolean} activePlayer - If the action is active or passive
    */
    executeActions(card, abilityInfo, activePlayer) {
        let abilityTweens = [];
        
        for (let i = 0; i < abilityInfo.length; i++) {
            //console.log("Executing action: ", abilityInfo[i].name);
            const func = abilityActions[abilityInfo[i].name];
            if (func) abilityTweens = abilityTweens.concat(func(this.card.scene, card, abilityInfo[i], activePlayer));
        }

        //Set turn flags
        let condition = this.conditions.find(condition => condition.type === 'ONCE');
        if(condition) {
            if(condition.value === "TURN") this.usedThisTurn = true;
            if(condition.value === "GAME") this.usedThisGame = true;
        }

        return abilityTweens;
    }

    /** Function to execute passive actions 
     * * @param {GameCardUI} card - The card to execute the action on
     * @param {boolean} active - If the action is active or passive
     */
    executePassiveActions(card, active) {
        for (const action of this.actions) {
            const func = PassiveAbilityActions[action.name];
            if (func) func(this.card.scene, card, action.params, active);
        }
    }

    /** Functon to execute aura actions
     * * @param {GameCardUI} card - The card to execute the action on
     * @param {boolean} active - If the action is active or passive
     * @param {GameCardUI} target - The target of the action
     */
    executeAuraActions(card, active, target) {
        for (const action of this.actions) {
            const func = AuraAbilityActions[action.name];
            if (func) func(this.card.scene, card, action.params, active, target);
        }
    }

    /** Function to handle the trigger of the action button */
    trigger() {
        this.card.scene.game.gameClient.requestActivateAbility(this.card.id, this.id);
    }

    update() {}
    action() {}
    onFail() {}

    animate(card, abilityInfo, activePlayer = true) {
        return this.executeActions(card, abilityInfo, activePlayer);
    }

}

const abilityActions = {
    //#region addCounterToCard
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    addCounterToCard: (scene, card, info, activePlayer) => {
        //Get Defender Card
        let defender = scene.activePlayerScene.getCard(info.defenderId);
        if(defender === undefined) defender = scene.passivePlayerScene.getCard(info.defenderId);
 
        let targetingManager = null;
        let tweens = [];
        if(!activePlayer) {
            targetingManager = new TargetManager(scene, 'EVENT', 'ADD_COUNTER', card.id);
            targetingManager.targetArrow.originatorObject = card;
            let arrowTweens = targetingManager.targetArrow.animateToPosition(defender.x, defender.y, 600);
            tweens = tweens.concat([
                {
                    onStart: () => { //Add Tween for target arrow
                        targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                    },
                    delay: 100,
                }
            ]);
            tweens = tweens.concat(arrowTweens);
        }

        // Create new enhanced animation for counter addition
        tweens = tweens.concat([
            {
                onStart: () => {
                    // Set the counter value
                    defender.eventCounterPower += info.counterAmount;
                    
                    // Create a glow effect around the card
                    defender.showGlow(COLOR_ENUMS.OP_GREEN);
                    
                    // Create a floating number effect showing the buff
                    const floatingText = scene.add.text(
                        defender.x, 
                        defender.y - 20, 
                        `+${info.counterAmount}`, 
                        {
                            fontFamily: 'OnePieceFont',
                            fontSize: '32px',
                            color: '#00ff00',
                            stroke: '#000000',
                            strokeThickness: 4,
                            shadow: { blur: 5, color: '#000000', fill: true }
                        }
                    )
                    .setOrigin(0.5)
                    .setDepth(DEPTH_VALUES.CARD_ATTACKING + 10);
                    
                    // Store reference to remove it later
                    defender.floatingBuffText = floatingText;
                    
                    // Pulse the card
                    scene.tweens.add({
                        targets: defender,
                        scaleX: defender.scaleX * 1.2,
                        scaleY: defender.scaleY * 1.2,
                        duration: 200,
                        yoyo: true,
                        repeat: 1,
                        ease: 'Sine.easeInOut'
                    });
                },
                targets: defender.locationPowerText,
                scale: { from: 1, to: 1.8 }, // Increased scale
                duration: 400,
                yoyo: true,
                ease: 'Back.easeOut'
            },
            {
                // Float the buff text upward
                targets: () => defender.floatingBuffText,
                y: '-=70',
                alpha: { from: 1, to: 0 },
                duration: 1200,
                ease: 'Power2',
                onComplete: () => {
                    // Clean up the text
                    if (defender.floatingBuffText) {
                        defender.floatingBuffText.destroy();
                        delete defender.floatingBuffText;
                    }
                    
                    // Clean up particles
                    if (defender.buffParticles) {
                        defender.buffParticles.destroy();
                        delete defender.buffParticles;
                    }
                    
                    // Hide the glow
                    defender.hideGlow();
                }
            }
        ]);

        if(!activePlayer) {
            tweens = tweens.concat([{
                targets: defender.locationPowerText,
                scale: 1,
                duration: 10,
                onStart: () => {
                    targetingManager.targetArrow.stopTargeting();
                    targetingManager = null;
                }
            }]);
        }

        return tweens;  
    },
    //#endregion
    //#region activeExertedDon
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    activateExertedDon: (scene, card, info, activePlayer) => {
        let playerScene = card.playerScene;
        if(info.player === "opponent") playerScene = card.playerScene.opponentPlayerScene;

        //Get Defender Card
        let donCards = [];
        for(let donId of info.donId) donCards.push(playerScene.getDonCardById(donId));

        let targetingManager = new TargetManager(scene, 'EVENT', 'ACTIVATE_EXERTED_DON', card.id);
        targetingManager.targetArrow.originatorObject = card;
        let arrowTweens = targetingManager.targetArrow.animateToPosition(playerScene.playerInfo.restingDonplaceholder.x, playerScene.playerInfo.restingDonplaceholder.y, 600);
        let tweens = [
            {
                onStart: () => { //Add Tween for target arrow
                    targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                },
                delay: 100,
            }
        ];
        tweens = tweens.concat(arrowTweens);

        tweens.push({
            onStart: () => { //Add Tween for target arrow
                for(let donCard of donCards) donCard.setState(CARD_STATES.DON_ACTIVE);
            },
            targets: {},
            scale: 1,
            duration: 1
        });
        for(let donCard of donCards) {
            tweens = tweens.concat(scene.animationLibrary.repayDonAnimation(playerScene, donCard, delay));
            delay += 200; //Increase animation delay tracker
        }
        tweens.push({
            targets: {},
            scale: 1,
            duration: 1,
            onComplete: () => {
                targetingManager.targetArrow.stopTargeting();
                targetingManager = null;
            }
        });
        return tweens; 
    },
    //#endregion
    //#region addPowerToCard
    /** Function to add Counter to Defender
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    addPowerToCard: (scene, card, info, activePlayer) => {
        let tweens = [];

        let target = scene.getCard(info.cardId);
        let amount = info.addedPower;
        let duration = info.duration;

        let targetingManager = null;
        if(!activePlayer) {
            targetingManager = new TargetManager(scene, 'EVENT', 'ADD_POWER', card.id);
            targetingManager.targetArrow.originatorObject = card;
            let arrowTweens = targetingManager.targetArrow.animateToPosition(target.x, target.y, 600);
            tweens = tweens.concat([
                {
                    onStart: () => { //Add Tween for target arrow
                        targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                    },
                    delay: 100,
                }
            ]);
            tweens = tweens.concat(arrowTweens);
        }

        // Create new enhanced animation for counter addition
        tweens = tweens.concat([
            {
                onStart: () => {
                    // Set the counter value
                    switch(duration) {
                        case "TURN":
                            target.turnEventPowerAmount += amount;
                            break;
                        case "GAME":
                            target.gameEventPowerAmount += amount;
                            break;
                    }
                    
                    // Create a glow effect around the card
                    target.showGlow(COLOR_ENUMS.OP_GREEN);
                    
                    // Create a floating number effect showing the buff
                    const floatingText = scene.add.text(
                        target.x, 
                        target.y - 20, 
                        `+${amount}`, 
                        {
                            fontFamily: 'OnePieceFont',
                            fontSize: '32px',
                            color: '#00ff00',
                            stroke: '#000000',
                            strokeThickness: 4,
                            shadow: { blur: 5, color: '#000000', fill: true }
                        }
                    )
                    .setOrigin(0.5)
                    .setDepth(DEPTH_VALUES.CARD_ATTACKING + 10);
                    
                    // Store reference to remove it later
                    target.floatingBuffText = floatingText;
                    
                    // Pulse the card
                    scene.tweens.add({
                        targets: target,
                        scaleX: target.scaleX * 1.2,
                        scaleY: target.scaleY * 1.2,
                        duration: 200,
                        yoyo: true,
                        repeat: 1,
                        ease: 'Sine.easeInOut'
                    });
                },
                targets: target.locationPowerText,
                scale: { from: 1, to: 1.8 }, // Increased scale
                duration: 400,
                yoyo: true,
                ease: 'Back.easeOut'
            },
            {
                // Float the buff text upward
                targets: () => target.floatingBuffText,
                y: '-=70',
                alpha: { from: 1, to: 0 },
                duration: 1200,
                ease: 'Power2',
                onComplete: () => {
                    // Clean up the text
                    if (target.floatingBuffText) {
                        target.floatingBuffText.destroy();
                        delete target.floatingBuffText;
                    }
                    
                    // Clean up particles
                    if (target.buffParticles) {
                        target.buffParticles.destroy();
                        delete target.buffParticles;
                    }
                    
                    // Hide the glow
                    target.hideGlow();

                    target.updatePowerText();
                }
            }
        ]);

        if(!activePlayer) {
            tweens = tweens.concat([{
                targets: target.locationPowerText,
                scale: 1,
                duration: 10,
                onStart: () => {
                    targetingManager.targetArrow.stopTargeting();
                    targetingManager = null;
                }
            }]);
        }

        return tweens; 
    },
    //#endregion
    //#region attachDonCard
    /** Function to add Counter to Defender
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    attachDonCard: (scene, card, info, activePlayer) => {
        const character = scene.getCard(info.targetId);
        let delay = 0;
        let tweens = [];
        
        if(info.donId.length === 0) return tweens;

        let targetingManager = null;
        if(!activePlayer) {
            targetingManager = new TargetManager(scene, 'EVENT', 'ATTACH_DON', card.id);
            targetingManager.targetArrow.originatorObject = card;
            let arrowTweens = targetingManager.targetArrow.animateToPosition(character.x, character.y, 600);
            tweens.push({
                    onStart: () => { //Add Tween for target arrow
                        targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                    },
                    delay: 100,
            });
            tweens = tweens.concat(arrowTweens);
        }

        for(let donId of info.donId) {
            let donCard = scene.getDonCard(donId);
            let player = donCard.playerScene;

            tweens.push({
                    targets: {},  // Empty object as target
                    scale: 0,         // Dummy property
                    onStart: () => {
                        donCard.setDepth(DEPTH_VALUES.DON_DRAGGED);
                        donCard.alpha = 1;
                        donCard.setVisible(true);
                    },
                    delay: delay,
                    duration: 1
            });
            let movingAnimation = scene.animationLibrary.animation_move_don_activearea2characterarea(donCard, character, delay);
            tweens = tweens.concat(movingAnimation);
            tweens.push({
                    targets: {},  // Empty object as target
                    scale: 0,         // Dummy property
                    onStart: () => {
                        donCard.setState(CARD_STATES.DON_ATTACHED);
                        donCard.setDepth(DEPTH_VALUES.DON_IN_PILE);
                        character.attachedDon.push(donCard); //Add to character pile
                        character.updateAttachedDonPosition(true, donCard);

                        const donImage = scene.add.image(character.x, character.y + character.displayHeight*0.25, ASSET_ENUMS.GAME_DON_SMALL).setDepth(character.depth+1).setScale(0);
                        scene.tweens.chain({
                            targets: donImage,
                            tweens: scene.animationLibrary.don_image_appearing_animation(donImage, delay)
                        });

                        // Update the power text with animation
                        character.updatePowerText();
                        if (character.powerText) {
                            scene.tweens.add({
                                targets: character.powerText,
                                scale: 1.5,
                                duration: 150,
                                delay: delay,
                                yoyo: true,
                                ease: 'Back.easeOut'
                            });
                        }
                        
                        // Update the UI with pulse effect
                        player.playerInfo.updateCardAmountTexts();
                        scene.tweens.add({
                            targets: player.playerInfo.restingDonCardAmountText,
                            scale: 1.2,
                            duration: 100,
                            delay: delay,
                            yoyo: true,
                            ease: 'Sine.easeOut'
                        });
                    },
                    duration: 10,
                    delay: delay
            });
            delay = delay + 500;
        }

        if(!activePlayer) {
            tweens.push({
                targets: {},
                scale: 1,
                duration: 10,
                onStart: () => {
                    targetingManager.targetArrow.stopTargeting();
                    targetingManager = null;
                }
            });
        }

        return tweens;
    },
    //#endregion
    //#region changeCardState
    /** Function to add Counter to Defender
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    changeCardState: (scene, card, info, activePlayer) => {
        let target = scene.getCard(info.restedCardId);
        let newState = info.cardState;
        let tweens = [];

        tweens.push({
            targets: {},
            scale: 1,
            duration: 1,
            onStart: () => {target.setState(newState);}
        });

        return tweens;
    },
    //#endregion
    //#region createAura
    /** Function to add Counter to Defender
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    createAura: (scene, card, info, activePlayer) => {
        let tweens = [];
        let targetingManager = null;
        if(!activePlayer) {
            let targetCard = scene.getCard(info.targetId);
            targetingManager = new TargetManager(scene, 'EVENT', 'ATTACH_DON', card.id);
            targetingManager.targetArrow.originatorObject = card;
            let arrowTweens = targetingManager.targetArrow.animateToPosition(targetCard.x, targetCard.y, 600);
            tweens.push({
                    onStart: () => { //Add Tween for target arrow
                        targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                    },
                    delay: 100,
            });
            tweens = tweens.concat(arrowTweens);
        }

        //Create a new aura
        let aura = new Aura(scene, info.targetId, info.auraId, info.auraData);
        scene.auraManager.addAura(aura);

        if(!activePlayer) {
            tweens.push({
                targets: {},
                scale: 1,
                duration: 10,
                onStart: () => {
                    targetingManager.targetArrow.stopTargeting();
                    targetingManager = null;
                }
            });
        }

        return tweens;
    },
    //#endregion
    //#region createSelectionManager
    /** Function to create a Selection Manager
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    createSelectionManager: (scene, card, info, activePlayer) => {
        let tweens = [];

        const targetFilter = new Target({
        }, null);

        //SHOW CARD SELECTION PANEL
        scene.currentSelectionManager = new SelectionPanel(scene, {
            selectionTitle: "Choose Targets",
            allowCancel: false
        }, activePlayer);

        // Show the panel with cards to select from
        tweens = tweens.concat([{
            targets: {},
            alpha: 1,
            duration: 1,
            onStart: () => {
                scene.currentSelectionManager.prepareSelection(info.cardPool);
            }
        }]);

        return tweens;
    },
    //#endregion
    //#region discardCard
    /** Function to add Counter to Defender
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    discardCard: (scene, card, info, activePlayer) => {
        const target = scene.getCard(info.cardId);
        let tweens = [];

        let targetingManager = null;
        if(!activePlayer) {
            targetingManager = new TargetManager(scene, 'EVENT', 'DISCARD', card.id);
            targetingManager.targetArrow.originatorObject = card;
            let arrowTweens = targetingManager.targetArrow.animateToPosition(target.x, target.y, 600);
            tweens.push({
                    onStart: () => { //Add Tween for target arrow
                        targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                    },
                    delay: 100,
            });
            tweens = tweens.concat(arrowTweens);
        }
        if(target.state.startsWith("IN_PLAY") && target.cardData.animationinfo) {
            tweens = tweens.concat([{
                targets: {},
                alpha: 1,
                duration: 1,
                onStart: () => {
                    //Show chat bubble
                    new ChatBubble(
                        scene, 
                        target.getSpeechBubblePosition(),
                        target.cardData.animationinfo.speeches.defeated
                    ).show(1500);
                }
            }, {
                targets: {},
                alpha: 1,
                duration: 1,
                delay: 1200
            }]);
        } else if (target.state.startsWith("IN_HAND")) {
            tweens = tweens.concat([{
                targets: target,
                onStart: () => {
                    target.isInPlayAnimation = true;
                },
                y: target.y - 200,
                duration: 200
            }]);
        }

        tweens = tweens.concat(scene.gameStateManager.discardCard(target.id, info.discardAction, activePlayer, false));

        if(!activePlayer) {
            tweens.push({
                targets: {},
                scale: 1,
                duration: 10,
                onStart: () => {
                    targetingManager.targetArrow.stopTargeting();
                    targetingManager = null;
                }
            });
        }

        return tweens;
    },
    //#endregion
    //#region drawCards
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    drawCards: (scene, card, info, activePlayer) => {
        let tweens = [];

        let playerScene = card.playerScene;
        let delay = 200;
        let reveal = info.reveal;

        for(let serverCard of info.drawnCards) {
            let deckVisual = null;

            if(info.cardPool === "DECK") deckVisual = playerScene.deck.getTopCardVisual();

            //Create a new Duel Card
            let drawnCard = new GameCardUI(scene, playerScene, {
                x: deckVisual.x,
                y: deckVisual.y,
                state: CARD_STATES.IN_DECK,
                scale: CARD_SCALE.IN_DECK,
                artVisible: false,
                id: serverCard.id,
                depth: DEPTH_VALUES.CARD_IN_DECK
            });
            if(serverCard.cardData) {
                drawnCard.updateCardData(serverCard.cardData, false); //in some case we only pass the id
            };

            tweens.push({
                targets: {},
                scale: 1,
                duration: 1,
                delay : delay,
                onStart: () => {
                    drawnCard.setDepth(DEPTH_VALUES.CARD_IN_HAND);
                    scene.children.bringToTop(drawnCard);
                    drawnCard.setState(CARD_STATES.TRAVELLING_TO_HAND);
                }
            });
            if(info.cardPool === "DECK") {
                if(activePlayer) tweens = tweens.concat(scene.animationLibrary.animation_move_card_deck2hand(drawnCard, 0));
                else tweens = tweens.concat(scene.animationLibraryPassivePlayer.animation_move_card_deck2hand(drawnCard, 0, reveal));
            }
            tweens.push({
                targets: {},
                scale: 1,
                duration: 1,
                onStart: () => {
                    playerScene.hand.addCards([drawnCard], {setCardState: true, setCardDepth: true, updateUI: true});
                    if(info.cardPool === "DECK") { 
                        playerScene.deck.popTopCardVisual(); //Remove the top Card Visual
                        if(info.cardPool === "DECK") deckVisual.destroy();
                    }
                }
            });
        }

        return tweens;
    },
    //#endregion
    //#region hideSelectionManager
    /** Function to hide the selection Manager
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    hideSelectionManager : (scene, card, info, activePlayer) => {
        let tweens = [];
        tweens.push({
            targets: {},
            scale: 1,
            duration: 1,
            onComplete: () => {
                scene.currentSelectionManager.animatePanelDisappearance();
            }
        });
        return tweens; 
    },
    //#endregion
    //#region moveCardsToDeck
    /** Function to move cards to deck
     *  @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    moveCardsToDeck: (scene, card, info, activePlayer) => {
        let tweens = [];

        //actionResults.from = params.from;
        //actionResults.to = params.to;
        //actionResults.numberOfCards = cardPool.length;
        // Get player scene
        const playerScene = info.player === "opponent" ? card.playerScene.opponentPlayerScene : card.playerScene;
    
        // Get target deck
        const deck = playerScene.deck;
        const animationDuration = 200;
        const delay = 150;
    
        // If no cards to move, return empty tweens
        if (info.numberOfCards === 0) { return tweens; }

        tweens.push({
            targets: {},
            scale: 1,
            duration: 1,
            onStart: () => {
                // Process each card
                let directionMultiplier = 1;
                for(let i = 0; i<info.numberOfCards; i++) {
                    let deckVisual = null;

                    let scaleOut = 0;
                    let scaleIn = 0;

                    switch(info.from) {
                        case "TOP":
                            //deckVisual = deck.getTopCardVisual();
                            deckVisual = deck.unhingeTopCardVisual();
                            break;
                        case "BOTTOM":
                            deckVisual = deck.getBottomCardVisual();
                            break;
                    }
                    
                    switch(info.to) {
                        case "TOP":
                            //deckVisual = deck.getTopCardVisual();
                            scaleOut = CARD_SCALE.IN_DECK*1.2;
                            scaleIn = CARD_SCALE.IN_DECK*1;
                            break;
                        case "BOTTOM":
                            scaleOut = CARD_SCALE.IN_DECK*0.8;
                            scaleIn = CARD_SCALE.IN_DECK*0.9;
                            break; 
                    }

                    let posXOut = deckVisual.x - ((deckVisual.displayWidth + 20));
                    if(!activePlayer) posXOut = deckVisual.x + ((deckVisual.displayWidth + 20));
                    const postXIn = deckVisual.x; // Adjust Y position based on direction

                    scene.tweens.add({
                        targets: deckVisual,
                        x: posXOut,
                        scale: scaleOut,
                        duration: animationDuration,
                        delay: delay*1.75*i,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            switch(info.from) {
                                case "TOP":
                                    scene.children.moveBelow(deckVisual, deck.getBottomCardVisual()); // Move the card visual below the deck
                                    break;
                                case "BOTTOM":
                                    scene.children.moveAbove(deckVisual, deck.getTopCardVisual()); // Move the card visual below the deck
                                    break;
                            }
                            
                            scene.tweens.add({
                                targets: deckVisual,
                                x: postXIn,
                                scale: scaleIn,
                                duration: animationDuration,
                                ease: 'Sine.easeIn',
                                onComplete: () => {
                                    deckVisual.scale = CARD_SCALE.IN_DECK;
                                }
                            });
                        }
                    }); 

                    directionMultiplier *= -1; // Reverse direction for each card
                }   
            }
        });

        tweens.push({
            targets: {},
            scale: 1,
            duration: 1,
            delay:info.numberOfCards * delay + animationDuration * 2 + animationDuration,
            onStart: () => {
                //realign deck visuals
                deck.realignDeckVisuals();
            }
        });         

        return tweens;
    },
    //#endregion
    //#region restDon
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    restDon: (scene, card, info, activePlayer) => {
        let playerScene = card.playerScene;
        if(info.player === "opponent") playerScene = card.playerScene.opponentPlayerScene;

        //Get Defender Card
        let donCards = [];
        for(let donId of info.donId) donCards.push(playerScene.getDonCardById(donId));
        let delay = 0;

        let targetingManager = new TargetManager(scene, 'EVENT', 'REST_DON', card.id);
        targetingManager.targetArrow.originatorObject = card;
        let arrowTweens = targetingManager.targetArrow.animateToPosition(playerScene.playerInfo.activeDonPlaceholder.x, playerScene.playerInfo.activeDonPlaceholder.y, 600);
        let tweens = [
            {
                onStart: () => { //Add Tween for target arrow
                    targetingManager.targetArrow.startManualTargetingXY(card, card.x, card.y);
                },
                delay: 100,
            }
        ];
        tweens = tweens.concat(arrowTweens);

        tweens.push({
            onStart: () => { //Add Tween for target arrow
                for(let donCard of donCards) donCard.setState(CARD_STATES.DON_RESTED);
            },
            targets: {},
            scale: 1,
            duration: 1
        });
        for(let donCard of donCards) {
            tweens = tweens.concat(scene.animationLibrary.payDonAnimation(playerScene, donCard, delay));
            delay += 200; //Increase animation delay tracker
        }
        tweens.push({
            targets: {},
            scale: 1,
            duration: 1,
            onComplete: () => {
                targetingManager.targetArrow.stopTargeting();
                targetingManager = null;
            }
        });
        return tweens; 
    },
    //#endregion
    //#region returnDonToDeck
    /** Function to return the don cards to the deck
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    returnDonToDeck: (scene, card, info, activePlayer) => {
        let tweens = [];
        return tweens;
    },
    //#endregion
    //#region returnCardToHand
    /** Function to return a card to hand
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    returnCardToHand: (scene, card, info, activePlayer) => {
        let tweens = [];
        return tweens;
    },
    //#endregion
    //#region selectCards
    /** Function to select cards
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    selectCards: (scene, card, info, activePlayer) => {
        let tweens = [];

        tweens.push({
            onStart: () => {
                // Start the selection process
                scene.currentSelectionManager.startSelection(info);
            },
            targets: {},
            alpha: 1,
            duration: 1
        });
        
        return tweens;
    },
    //#endregion
    //#region target
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    target: (scene, card, info, activePlayer) => {
        let tweens = [];
        if(!activePlayer) return tweens; //No need to target if not active player
        tweens.push({
            onStart: () => {
                // Start the selection process
                let targetManager = new TargetManager(scene, 'EVENT', info.actionId, info.playedCard);
                scene.targetManagers.push(targetManager);

                if(activePlayer) targetManager.loadFromTargetData(info.targets);
                scene.gameStateManager.startAbilityTargeting(info.playedCard, activePlayer);
            },
            targets: {},
            alpha: 1,
            duration: 1
        });
        return tweens;
    }
    //#endregion
};