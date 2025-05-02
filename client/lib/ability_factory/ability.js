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
        for (const action of this.actions) {
            const func = abilityActions[action.name];
            if (func) abilityTweens = abilityTweens.concat(func(this.card.scene, card, abilityInfo[action.name], activePlayer));
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
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    activateExertedDon: (scene, card, info, activePlayer) => {
        //Get Defender Card
        let donCards = [];
        for(let donId of info.donId) donCards.push(card.playerScene.getDonCardById(donId));

        let targetingManager = new TargetManager(scene, 'EVENT', 'ACTIVATE_EXERTED_DON', card.id);
        targetingManager.targetArrow.originatorObject = card;
        let arrowTweens = targetingManager.targetArrow.animateToPosition(card.playerScene.playerInfo.restingDonplaceholder.x, card.playerScene.playerInfo.restingDonplaceholder.y, 600);
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
            tweens = tweens.concat(scene.animationLibrary.repayDonAnimation(donCard.playerScene, donCard, delay));
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

            let movingAnimation = scene.animationLibrary.animation_move_don_activearea2characterarea(donCard, character, delay);
            tweens.push({
                    targets: {},  // Empty object as target
                    scale: 0,         // Dummy property
                    onStart: () => {
                        donCard.setDepth(DEPTH_VALUES.DON_DRAGGED);
                    },
                    delay: delay,
                    duration: 1
            });
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
    /** Function to add Counter to Defender
     * @param {GameScene} scene
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    restDon: (scene, card, info, activePlayer) => {
        //Get Defender Card
        let donCards = [];
        for(let donId of info.donId) donCards.push(card.playerScene.getDonCardById(donId));
        let delay = 0;

        let targetingManager = new TargetManager(scene, 'EVENT', 'REST_DON', card.id);
        targetingManager.targetArrow.originatorObject = card;
        let arrowTweens = targetingManager.targetArrow.animateToPosition(card.playerScene.playerInfo.activeDonPlaceholder.x, card.playerScene.playerInfo.activeDonPlaceholder.y, 600);
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
            tweens = tweens.concat(scene.animationLibrary.payDonAnimation(donCard.playerScene, donCard, delay));
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
    }
};