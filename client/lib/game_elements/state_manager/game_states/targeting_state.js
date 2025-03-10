class TargetingState extends GameState {

    constructor(scene, previousState) {
        super(scene, GAME_STATES.TARGETING, previousState);
    } 

    enter() {
        super.enter();
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(NEXT_TURN_BUTTON_FSM_STATES.CANCEL);
    }

    onPointerOver(pointer, gameObject) {
        gameObject.fsmState.onPointerOver(pointer, gameObject);
    }

    onPointerOut(pointer, gameObject) {
        gameObject.fsmState.onPointerOut(pointer, gameObject);
    }
    
    onPointerDown(pointer, gameObject) {
        if(pointer.rightButtonDown()) {
            this.scene.actionLibrary.cancelTargetingAction();
        } else {
            if(gameObject === this.scene.gameStateUI.nextTurnbutton) this.scene.gameStateUI.nextTurnbutton.fsmState.onPointerDown(pointer, gameObject);
            if(gameObject instanceof GameCardUI) this.scene.targetManager.addTarget(gameObject);
        }
    }

    update() {
        if(this.scene.targetingArrow.isTargeting) {
            let posX = this.scene.input.mousePointer.x;
            let posY = this.scene.input.mousePointer.y;

            this.scene.targetingArrow.update(posX, posY);

            if(this.scene.targetManager.targetAction === 'ATTACK_CARD_ACTION') {
                let relX = posX / this.scene.screenWidth;
                let relY = posY / this.scene.screenHeight;
                this.scene.game.gameClient.requestUpdateTragetingPassivePlayer(relX, relY);
            }
        }

        if(this.scene.eventArrow.isTargeting) {
            let posX = this.scene.input.mousePointer.x;
            let posY = this.scene.input.mousePointer.y;

            this.scene.eventArrow.update(posX, posY);
        }

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.fsmState.isValidTarget();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.fsmState.isValidTarget();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.fsmState.isValidTarget();

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.activePlayerScene.hand.cards) card.fsmState.update(); 
        for(let card of this.scene.activePlayerScene.characterArea.cards) card.fsmState.update();
        for(let card of this.scene.activePlayerScene.leaderLocation.cards) card.fsmState.update();
        for(let card of this.scene.activePlayerScene.stageLocation.cards) card.fsmState.update();

        //Update all cards in the hand to reflect if they can take an action
        for(let card of this.scene.passivePlayerScene.characterArea.cards) card.fsmState.update();
        for(let card of this.scene.passivePlayerScene.leaderLocation.cards) card.fsmState.update();
        for(let card of this.scene.passivePlayerScene.stageLocation.cards) card.fsmState.update();
    }

    exit(newState) {
        this.scene.gameStateUI.nextTurnbutton.fsmState.exit(this.scene.gameStateUI.nextTurnbutton.fsmState.previousState);
        super.exit(newState); 
    }
}