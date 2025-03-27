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
    }

    /** Function to attach the card
     * @param {GameCardUI} card
     */
    attachTo(card) {
        this.card = card;
    }

    /** Function that tests if an ability can be activated
     * @param {string} gamePhase
     * @returns {boolean}
     */
    canActivate(gamePhase) {
        // Check if in correct phase
        if (this.phases.length > 0 && !this.phases.includes(gamePhase)) {
            return false;
        }

        if (this.states.length > 0 && !this.states.includes(this.card.state)) {
            return false;
        }

        // Check all conditions
        for (const condition of this.conditions) {
            if (!this.evaluateCondition(condition, gamePhase)) {
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
            case 'CHARACTER_COUNT':
                return this.card.playerScene.characterArea.cards.length >= condition.value;
            case 'CARD_RESTED':
                if(this.card.state === CARD_STATES.IN_PLAY_RESTED && condition.value) return true;
                return false;
            case 'PLAYER_TURN':
                if(this.card.playerScene.isPlayerTurn && condition.value) return true;
                return false;
            case 'ONCE':
                if(this.usedThisTurn && condition.value === 'TURN') return false;
                if(this.usedThisGame && condition.value === 'GAME') return false;
                return true;
            case 'AVAILABLE_DON':
                if(this.card.playerScene.activeDonDeck.getNumberOfActiveCards() >= condition.value) return true;
                return false;
            // More conditions...
            default:
                return true;
        }
    }

    /** Function to reset the turn variables */
    resetTurn() {
        this.usedThisTurn = false;
    }

    /** Function to execute active actions from the server */
    executeActions(card, abilityInfo, activePlayer) {
        let abilityTweens = [];
        for (const action of this.actions) {
            const func = abilityActions[action.name];
            if (func) {
                abilityTweens = abilityTweens.concat(func(card, abilityInfo[action.name], activePlayer));
            }
        }

        return abilityTweens;
    }

    /** Function to execute active actions from the server */
    executePassiveActions(card, active) {
        for (const action of this.actions) {
            const func = passiveAbilityActions[action.name];
            if (func) {
                func(card, action.params, active);
            }
        }
    }

    /** Function to handle the trigger of the action button */
    trigger() {this.card.scene.game.gameClient.requestPerformAbility(this.card.id, this.id);}

    update() {}
    action() {}
    onFail() {}

    animate(card, abilityInfo, activePlayer = true) {
        return this.executeActions(card, abilityInfo, activePlayer);
    }

}

const abilityActions = {
    /** Function to add Counter to Defender
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    addCounterToCard: (card, info, activePlayer) => {
        //Get Defender Card
        let defender = card.scene.activePlayerScene.getCard(info.defenderId);
        if(defender === undefined) defender = card.scene.passivePlayerScene.getCard(info.defenderId);
 
        let tweens = [];
        if(!activePlayer) {
            card.scene.eventArrow.originatorObject = card;
            let arrowTweens = card.scene.eventArrow.animateToPosition(defender.x, defender.y, 600);
            tweens = tweens.concat([
                {
                    onStart: () => { //Add Tween for target arrow
                        card.scene.eventArrow.startManualTargetingXY(card, card.x, card.y);
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
                    const floatingText = card.scene.add.text(
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
                    card.scene.tweens.add({
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
                    card.scene.eventArrow.stopTargeting();
                }
            }]);
        }

        return tweens;  
    },
    /** Function to add Counter to Defender
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    activateExertedDon: (card, info, activePlayer) => {
        //Get Defender Card
        let donCards = [];
        for(let donId of info.donId) donCards.push(card.playerScene.getDonCardById(donId));
        card.scene.eventArrow.originatorObject = card;
        let arrowTweens = card.scene.eventArrow.animateToPosition(card.playerScene.playerInfo.restingDonplaceholder.x, card.playerScene.playerInfo.restingDonplaceholder.y, 600);
        let tweens = [
            {
                onStart: () => { //Add Tween for target arrow
                    card.scene.eventArrow.startManualTargetingXY(card, card.x, card.y);
                },
                delay: 100,
            }
        ];
        tweens = tweens.concat(arrowTweens);
        tweens = tweens.concat([{
                onStart: () => { //Add Tween for target arrow
                    for(let donCard of donCards) donCard.setState(CARD_STATES.DON_ACTIVE);
                },
                targets: card.playerScene.playerInfo.restingDonCardAmountText,
                scale: {from: 1, to: 1.2},
                duration: 150,
                onComplete: () => {
                    card.playerScene.playerInfo.updateRestingCardAmountText();
                }
            }, {
                targets: card.playerScene.playerInfo.restingDonCardAmountText,
                scale: {from: 1.2, to: 1},
                duration: 150,
            }, {
                targets: card.playerScene.playerInfo.activeDonCardAmountText,
                scale: {from: 1, to: 1.2},
                duration: 150,
                onComplete: () => {
                    card.playerScene.playerInfo.updateActiveCardAmountText();
                }
            }, {
                targets: card.playerScene.playerInfo.activeDonCardAmountText,
                scale: {from: 1.2, to: 1},
                duration: 150,
                onComplete: () => {
                    card.scene.eventArrow.stopTargeting();
                }
            }
        ]);
        return tweens; 
    },
    /** Function to add Counter to Defender
     * @param {GameCardUI} card
     * @param {Object} info
     * @returns {Object}
     */
    addPowerToCard: (card, info, activePlayer) => {
        //Get Defender Card
        return tweens; 
    }
};