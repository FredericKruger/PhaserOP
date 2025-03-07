const ServerInstance = require("../server_instance");
const Match = require("../match_objects/match");
const { CARD_TYPES } = require("../match_objects/match_enums");
const { CARD_STATES } = require("../match_objects/match_card");

class AI_Actions_Taken {
    constructor() {
        this.charactersPlayed = 0;
        this.attachedDon = 0;
        this.attacks = 0;
    }

    reset() {
        this.charactersPlayed = 0;
        this.attachedDon = 0;
        this.attacks = 0;
    }
}

class AI_Instance {

    /**
     * 
     * @param {ServerInstance} server 
     * @param {Match} match 
     */
    constructor(server, match) {
        this.server = server;
        this.match = match;
        this.matchPlayer = match.state.player2;

        this.actionsTaken = new AI_Actions_Taken();
        this.actionTaken = false;

        this.waitingForPlayerInput = false;

        // Load AI strategy configuration
        this.loadStrategyConfig();
    }

    /**
     * Load AI strategy configuration from JSON file
     */
    async loadStrategyConfig() {
        // Default strategy if file can't be loaded
        this.strategyConfig = await this.server.util.getAIStrategy('standard_ai');
    }

    /** Function that performs the mulligan */
    mulligan() {
        //Test if there is a 1 cost and a 2 cost card in the hand
        let oneCost = false;
        let twoCost = false;
        for(let card of this.matchPlayer.inHand) {
            if(card.cardData.cost === 1) oneCost = true;
            else if(card.cardData.cost === 2) twoCost = true;
        }

        //If it finds a one cost and a two cast don't mulligan
        if(oneCost && twoCost) return [];
        else {
            let oldCard = this.matchPlayer.inHand;
            for(let card of oldCard) this.matchPlayer.removeCardFromHand(card); //Remove Cards from hand

            let newCards = this.match.state.drawCards(this.matchPlayer, 5); //Draw 5 new cards
            
            for(let card of oldCard) this.matchPlayer.deck.add(card); //Add old cards to deck
            this.matchPlayer.deck.shuffle(); //Shuffle deck

            return newCards;
        }
    }

    /** Function that performs the AI turn */
    play() {
        console.log("AI TURN");
        this.actionsTaken.reset(); //Log the actions the AI has taken
        this.actionTaken = this.decideNextAction();
        while(this.actionTaken && !this.waitingForPlayerInput) {
            this.actionTaken = this.decideNextAction();
        }

        if(!this.waitingForPlayerInput) {
            console.log("AI END TURN");
            this.endTurn();
        }
    }

    /**
     * Decides the next action based on the priority configuration
     * @returns {boolean} Whether an action was taken
     */
    decideNextAction() {
        // Go through each priority in order
        for (const priority of this.strategyConfig.actionPriorities) {
            const action = this.evaluateAction(priority);
            if (action) {
                console.log(`AI executing: ${priority.action}`);
                this.playAction(action);

                if(action.function !== 'endTurn') return true;
                else return false;
            }
        }
        return false;
    }

    /**
     * Evaluates if an action from the priority list can be taken
     * @param {Object} priority - Action priority configuration
     * @returns {Object|null} Action object if possible, null otherwise
     */
    evaluateAction(priority) {
        switch (priority.action) {
            case "playCard":
                return this.evaluatePlayCard(priority);
            case "attachDon":
                return this.evaluateAttachDon(priority);
            case "attack":
                return this.evaluateAttack(priority);
            case "endTurn":
                return { function: 'endTurn' };
            default:
                return null;
        }
    }

    /**
     * Evaluates if a card can be played
     * @param {Object} priority - Play card priority configuration
     * @returns {Object|null} Action object if a card can be played
     */
    evaluatePlayCard(priority) {
        const cardType = priority.type || "CHARACTER";
        const strategy = priority.strategy || "highestCostFirst"; // Default strategy
    
        
        // Filter playable cards based on type and cost
        const playableCards = this.matchPlayer.inHand.filter(card => {
            // Check card type
            if (card.cardData.card !== CARD_TYPES[cardType]) return false;
            
            // Check if we have enough DON
            if (card.cardData.cost > this.matchPlayer.inActiveDon.length) return false;
            
            // Check if we have space for this card type
            if (cardType === "CHARACTER" && this.matchPlayer.inCharacterArea.length >= 5) return false;
            if (cardType === "STAGE" && this.matchPlayer.inStageLocation !== null) return false;
            
            return true;
        }); 
    
        if (playableCards.length === 0) return null;
    
        // Sort cards based on the selected strategy
        switch (strategy) {
            case "lowestCostFirst":
                playableCards.sort((a, b) => a.cardData.cost - b.cardData.cost);
                break;
            case "highestCostFirst": 
                playableCards.sort((a, b) => b.cardData.cost - a.cardData.cost);
                break;
            case "highestPowerFirst":
                playableCards.sort((a, b) => b.cardData.power - a.cardData.power);
                break;
            case "lowestPowerFirst":
                playableCards.sort((a, b) => a.cardData.power - b.cardData.power);
                break;
            case "random":
                // Shuffle the array for a random selection
                for (let i = playableCards.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [playableCards[i], playableCards[j]] = [playableCards[j], playableCards[i]];
                }
                break;
            default:
                // Default to highest cost first
                playableCards.sort((a, b) => b.cardData.cost - a.cardData.cost);
        }

        // Additional filters from priority if needed
        if (priority.minCost !== undefined) {
            playableCards = playableCards.filter(card => card.cardData.cost >= priority.minCost);
        }

        if (priority.maxCost !== undefined) {
            playableCards = playableCards.filter(card => card.cardData.cost <= priority.maxCost);
        }

        if (priority.attributes) {
            playableCards = playableCards.filter(card => 
                card.cardData.attributes && 
                priority.attributes.some(attr => card.cardData.attributes.includes(attr))
            );
        }

        if (playableCards.length > 0) {
            return {
                function: 'playCard',
                arg: playableCards[0].id
            };
        }

        return null;
    }

    /**
     * Evaluates if DON cards can be attached
     * @param {Object} priority - Attach DON priority configuration
     * @returns {Object|null} Action object if DON can be attached
     */
    evaluateAttachDon(priority) {
        // Check if there are characters and DON cards in hand
        const characters = this.matchPlayer.inCharacterArea.filter(char => 
            char.state !== CARD_STATES.IN_PLAY_RESTED // Only consider active characters
        );
        
        const donCards = this.matchPlayer.inActiveDon.filter(don =>
            don.state === CARD_STATES.DON_ACTIVE // Only consider active DON cards
        );
        
        // If we have no DON or no characters, we can't do anything
        if (characters.length === 0 || donCards.length === 0) {
            return null;
        }
        
        // Check for favorable attacks first
        const opponentPlayer = this.match.state.current_active_player.currentMatchPlayer === this.matchPlayer 
        ? this.match.state.current_passive_player.currentMatchPlayer 
        : this.match.state.current_active_player.currentMatchPlayer;

        const opponentCharacters = [...opponentPlayer.inCharacterArea];
        const leaderTarget = opponentPlayer.inLeaderLocation;

        // If there are no targets, no point in attaching DON
        if (opponentCharacters.length === 0 && !leaderTarget) {
            return null;
        }

        // Sort opponent characters by power (weakest first)
        opponentCharacters.sort((a, b) => a.getPower(false) - b.getPower(false));

        // Look for characters that would benefit from DON attachment to create favorable matchups
        for (const character of characters) {
            const currentPower = character.getPower(true);
            const powerAfterDon = currentPower + 1000; // Each DON adds 1 power

            // Check if adding DON would create a favorable matchup against opponent characters
            let willCreateFavorableMatchup = false;

            for (const opponentChar of opponentCharacters) {
                // If current power is less than opponent but DON would make it equal/greater
                if (currentPower < opponentChar.getPower(false) && powerAfterDon >= opponentChar.getPower(false)) {
                    willCreateFavorableMatchup = true;
                    break;
                }
            }

            // Check if adding DON would enable attacking the leader
            if (!willCreateFavorableMatchup && leaderTarget) {
                if (currentPower < leaderTarget.getPower(false) && powerAfterDon >= leaderTarget.getPower(false)) {
                    willCreateFavorableMatchup = true;
                }
            }

            // If adding DON would create a favorable matchup, do it
            if (willCreateFavorableMatchup) {
                return {
                    function: 'attachDon',
                    arg: {
                        donCardId: donCards[0].id,
                        characterId: character.id
                    }
                };
            }
        }

        // Improved fallback strategy: Check if we can create favorable matches by attaching
        // multiple DON cards to any character
        if (this.actionsTaken.charactersPlayed > 0 && this.actionsTaken.attacks === 0) {
            // If we have at least one character and DON cards
            // Sort characters by potential (highest power first)
            characters.sort((a, b) => b.getPower(true) - a.getPower(true));
            
            // Find the strongest opponent character or leader
            let strongestOpponent = null;
            let strongestOpponentPower = 0;
            
            if (opponentCharacters.length > 0) {
                strongestOpponent = opponentCharacters.reduce((max, char) => 
                    char.getPower(false) > max.getPower(false) ? char : max, opponentCharacters[0]);
                strongestOpponentPower = strongestOpponent.getPower(false);
            }
            
            if (leaderTarget && leaderTarget.getPower(false) > strongestOpponentPower) {
                strongestOpponentPower = leaderTarget.getPower(false);
            }
            
            // Check our strongest character
            const ourStrongestChar = characters[0];
            const currentPower = ourStrongestChar.getPower(true);
            
            // Calculate how many DON cards we'd need to match the strongest opponent
            const donNeeded = Math.ceil((strongestOpponentPower - currentPower) / 1000);
            
            // If we have enough DON cards to create a favorable match
            if (donNeeded <= donCards.length && donNeeded > 0) {
                console.log(`AI attaching DON to create favorable match. Need ${donNeeded} DON cards.`);
                return {
                    function: 'attachDon',
                    arg: {
                        donCardId: donCards[0].id,
                        characterId: ourStrongestChar.id
                    }
                };
            }
            
            // If we don't have enough DON to create a favorable match,
            // don't waste our DON cards - better to save them or play more characters
        }

        // Otherwise, don't attach DON now - better to play more characters
        return null;
    }

    /**
     * Evaluates if an attack can be made
     * @param {Object} priority - Attack priority configuration
     * @returns {Object|null} Action object if an attack can be made
     */
    evaluateAttack(priority) {
        // Find characters that can attack 
        const attackers = this.matchPlayer.inCharacterArea.filter(char => 
            char.state !== CARD_STATES.IN_PLAY_RESTED && char.state !== CARD_STATES.IN_PLAY_FIRST_TURN  // Not tapped and not just summoned
        );
        
        // Find opponent characters or leader to attack
        const opponentPlayer = this.match.state.current_active_player.currentMatchPlayer === this.matchPlayer 
            ? this.match.state.current_passive_player.currentMatchPlayer 
            : this.match.state.current_active_player.currentMatchPlayer;
            
        //FIXME FILTER targets by state for now can attack anyone            
        const targets = [...opponentPlayer.inCharacterArea];
        const leaderTarget = opponentPlayer.inLeaderLocation;
        
        if (attackers.length > 0) {
            // Sort attackers by power (highest first)
            attackers.sort((a, b) => b.getPower(true) - a.getPower(true));
        
            if (targets.length > 0) {
                // Sort targets by power (weakest first)
                targets.sort((a, b) => a.getPower(false) - b.getPower(false));
            
                // Find a favorable matchup where attacker power >= target power
                for (const attacker of attackers) {
                    for (const target of targets) {
                        if (attacker.getPower(true) >= target.getPower(false)) {
                            return {
                                function: 'attack',
                                arg: {
                                    attackerId: attacker.id,
                                    targetId: target.id
                                }
                            };
                        }
                    }
                }
            }
    
            // Only allow attacking the leader if we have a character with power >= leader's power
            if (leaderTarget) {
                const strongestAttacker = attackers[0]; // Already sorted by power (highest first)
                if (strongestAttacker.getPower(true) >= leaderTarget.getPower(false)) {
                    return {
                        function: 'attack',
                        arg: {
                            attackerId: strongestAttacker.id,
                            targetId: leaderTarget.id
                        }
                    };
                }
            }
        }
        
        return null;
    }

    /** Function called by the ai to finish his turn. Tells the game engine to start the next turn */
    endTurn(){
        this.match.state.current_passive_player.socket.emit('game_complete_current_turn');
    }

     /** 
     * Function that executes an action 
     * @param {Object} action - The action to execute
     */
     playAction(action) {
        switch (action.function) {
            case 'playCard':
                this.match.startPlayCard(this.match.state.current_active_player, action.arg);
                this.actionsTaken.charactersPlayed++;
                break;
            case 'attachDon':
                // Implement DON attachment
                this.match.startAttachDonToCharacter(
                    this.match.state.current_active_player,
                    action.arg.donCardId,
                    action.arg.characterId
                );
                this.actionsTaken.attachedDon++;
                break;
            case 'attack':
                // Implement attack
                this.match.startAttackPhase(
                    this.match.state.current_active_player,
                    action.arg.attackerId,
                    action.arg.targetId
                );
                this.actionsTaken.attacks++;
                this.waitingForPlayerInput = true;
                break;
            case 'endTurn':
                this.actionTaken = false;
                break;
        }
    }

    //#region BLOCK STRATEGY

    startBlockPhase() {
        console.log("AI BLOCK PHASE");
        let blockDecision = this.evaluateBlock();
        console.log(blockDecision);
        this.executeBlock(blockDecision);
    }

    /**
     * Evaluates whether the AI should block an attack
     * @returns {Object|null} Block decision object or null to not block
     */
    evaluateBlock() {
        // Get the blocking strategy from the configuration
        const blockStrategy = this.strategyConfig.blockStrategy || {
            blockLeader: true,
            highCostThreshold: 3,
            blockOnlyFavorable: false,
            lifeThreshold: 1,
            criticalLifeThreshold: 0
        };

        const defenderCard = this.match.attackManager.attack.defender;
        const attackerCard = this.match.attackManager.attack.attacker;

        console.log(attackerCard.getPower(true));
        console.log(defenderCard.getPower(false));
        //check is the attacker will lose the attack
        if(attackerCard.getPower(true) < defenderCard.getPower(false)) return { function: 'noBlock' };

        // Get current AI life points
        const currentLife = this.matchPlayer.life;
        const isLifeCritical = currentLife <= blockStrategy.criticalLifeThreshold;
        const isLifeLow = currentLife <= blockStrategy.lifeThreshold;
    
        console.log(`AI evaluating block. Current life: ${currentLife}, Is critical: ${isLifeCritical}, Is low: ${isLifeLow}`);
        
        // If the target is the leader and our strategy is to protect it
        const isTargetLeader = defenderCard.cardData.card === CARD_TYPES.LEADER;
        if (isTargetLeader && blockStrategy.blockLeader) {
            console.log("AI considering blocking attack on leader");
        }
        
        // If the target is a high-cost character worth protecting
        const isHighCostCard = defenderCard.cardData.cost >= blockStrategy.highCostThreshold;
        if (isHighCostCard) {
            console.log(`AI considering blocking attack on high-cost card (${defenderCard.cardData.cost})`);
        }

        // Calculate how threatening this attack is to AI's survival
        // If this attack would reduce life to critical levels, prioritize blocking
        const isThreateningAttack = isTargetLeader && (
            currentLife <= blockStrategy.criticalLifeThreshold
        );

        if (isThreateningAttack) {
            console.log(`Attack is threatening to drop AI life to critical levels`);
        }
        
        // Should we block this attack?
        const shouldBlock = isThreateningAttack || 
            ((isTargetLeader || isHighCostCard) && (isLifeCritical || isLifeLow)) ||
            isLifeCritical;
        
        if (!shouldBlock) {
            console.log("AI decides not to block this attack");
            return { function: 'noBlock' };
        }
        
        // Find all potential blockers (untapped characters)
        const potentialBlockers = this.matchPlayer.inCharacterArea.filter(char => 
            char.getAbilityByType("BLOCKER") && char.getAbilityByType("BLOCKER").canActivate(char, this.match.state.current_phase)
        );
        
        if (potentialBlockers.length === 0) {
            console.log("AI has no available blockers");
            return { function: 'noBlock' };
        }

        // When life is critical, be willing to sacrifice more valuable cards
        const isDesperateSituation = isLifeCritical || isThreateningAttack;
    
        
        // Choose the best blocker based on power comparison
        potentialBlockers.sort((a, b) => {
            // In desperate situations, prioritize by raw blocking power
            if (isDesperateSituation) {
                return b.getPower(false) - a.getPower(false); // Highest power first
            
            }
            // If we only want favorable blocks
            if (blockStrategy.blockOnlyFavorable && !isLifeLow) {
                const aPowerAdvantage = a.getPower(false) - attackerCard.getPower(true);
                const bPowerAdvantage = b.getPower(false) - attackerCard.getPower(true);
                return bPowerAdvantage - aPowerAdvantage; // Higher advantage first
            } 
            
            // Otherwise, find the most suitable blocker (lowest power that can survive or trade)
            else {
                // First prioritize cards that can survive the block
                const aCanSurvive = a.getPower(false) > attackerCard.getPower(true);
                const bCanSurvive = b.getPower(false) > attackerCard.getPower(true);
                
                if (aCanSurvive && !bCanSurvive) return -1; // A can survive, B can't
                if (!aCanSurvive && bCanSurvive) return 1;  // B can survive, A can't
                
                // If both can survive or neither can survive
                // - In low life situations, prioritize higher power cards
                // - Otherwise use the weakest card that can do the job
                if (isLifeLow) {
                    return b.getPower(false) - a.getPower(false); // Higher power first for low life
                } else {
                    return a.getPower(false) - b.getPower(false); // Lower power first normally
                }
            }
        });
        
        // Get the best blocker
        const bestBlocker = potentialBlockers[0];
        
        // Only block if we meet the strategy requirements
        // But ignore favorable-only requirement if life is critical
        if (blockStrategy.blockOnlyFavorable && 
            !isLifeCritical && 
            !isLifeLow &&
            bestBlocker.getPower(false) < attackerCard.getPower(true)) {
            console.log("AI avoids unfavorable block in non-critical situation");
            return { function: 'noBlock' };
        }
        
        const blockerAbility = bestBlocker.getAbilityByType("BLOCKER");

        console.log(`AI chooses to block with ${bestBlocker.cardData.name} (Power: ${bestBlocker.getPower(false)})`);
        return {
            function: 'block',
            arg: {
                blocker: bestBlocker,
                ability: blockerAbility
            }
        };
    }

    /** Function to execute the AI Block
     * @param {Object} blockDecision - The block decision
     */
    executeBlock(blockDecision) {
        console.log(blockDecision);
        switch(blockDecision.function) {
            case 'block':
                blockDecision.arg.ability.action(blockDecision.arg.blocker, this.match);
                break;
            case 'noBlock':
                this.match.flagManager.handleFlag(this.match.state.current_active_player, 'COUNTER_PHASE_READY');
                this.match.flagManager.handleFlag(this.match.state.current_passive_player, 'COUNTER_PHASE_READY');
                break;
        }
    }

    //#endregion

}

module.exports = AI_Instance;