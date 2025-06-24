/**
 * Card Selection Panel - A flexible UI component for selecting cards based on criteria
 * Similar to mulligan panel but with support for target requirements and varying selection counts
 */
class SelectionPanel extends BaseComponentUI {
    /**
     * @param {GameScene} scene - The scene that will contain the card selection panel
     * @param {Object} config - Configuration options
     * @param {number} config.minSelectCount - Minimum number of cards to select
     * @param {number} config.maxSelectCount - Maximum number of cards to select
     * @param {string} config.selectionTitle - Title to display for the selection panel
     * @param {string} config.selectionDescription - Description of what the player is selecting for
     * @param {Target|Object} config.targetFilter - Target object or config to filter valid cards
     * @param {Function} config.onSelectComplete - Callback when selection is complete
     * @param {Function} config.onCancel - Callback when selection is canceled (optional)
     * @param {boolean} config.allowCancel - Whether selection can be canceled (default: false)
     */
    constructor(scene, config) {
        super(scene);

        this.minSelectCount = config.minSelectCount || 1;
        this.maxSelectCount = config.maxSelectCount || 1;
        this.selectionTitle = config.selectionTitle || "Select Cards";
        this.selectionDescription = config.selectionDescription || `Select ${this.minSelectCount} to ${this.maxSelectCount} cards`;
        this.onSelectComplete = config.onSelectComplete || (() => {});
        this.onCancel = config.onCancel || (() => {});
        this.allowCancel = config.allowCancel !== undefined ? config.allowCancel : false;

        // Setup target filter
        this.targetFilter = config.targetFilter;
        
        // Card tracking
        this.cards = [];
        this.selectedCards = [];
        
        // Create UI elements
        this.createBackdrop();
        this.createTitle();
        this.createInfoText();
        this.createButtons();
        
        this.setVisible(false);
    }

    /**
     * Check if a card meets the selection requirements using Target.js logic
     * @param {GameCardUI} card - The card to check
     * @returns {boolean} - Whether the card is a valid selection target
     */
    cardMeetsRequirements(card) {       
        // Use the Target class isValidTarget method to determine if card meets requirements
        return this.targetFilter.isValidTarget(card);
    }

    /**
     * Create the semi-transparent backdrop
     */
    createBackdrop() {
        this.backdrop = this.scene.add.rectangle(
            this.scene.screenCenterX,
            this.scene.screenCenterY,
            this.scene.screenWidth,
            this.scene.screenHeight,
            0x000000,
            0.75
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.obj.push(this.backdrop);
    }

    /**
     * Create the title element
     */
    createTitle() {
        this.titleText = this.scene.add.text(
            this.scene.screenCenterX,
            150,
            this.selectionTitle,
            {
                fontFamily: 'OnePieceFont',
                fontSize: '50px',
                color: '#D6AA44',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 6
            }
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.obj.push(this.titleText);
    }

    /**
     * Create information text
     */
    createInfoText() {
        this.descriptionText = this.scene.add.text(
            this.scene.screenCenterX,
            210,
            this.selectionDescription,
            {
                fontFamily: 'OnePieceFont',
                fontSize: '34px',
                color: '#FFFFFF',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.selectionCountText = this.scene.add.text(
            this.scene.screenCenterX,
            this.scene.screenHeight*0.75,
            `Selected: 0/${this.maxSelectCount}`,
            {
                fontFamily: 'OnePieceFont',
                fontSize: '34px',
                color: '#FFFFFF',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        
        this.obj.push(this.descriptionText, this.selectionCountText);
    }

    /**
     * Create action buttons
     */
    createButtons() {

        this.confirmButton = new Button({
            scene: this.scene,
            x: this.scene.screenCenterX + 140, 
            y: this.scene.screenHeight*0.8,
            width: 150,
            height: 40,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Confirm",
            fontsize: 30,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
        this.confirmButton.on('pointerdown', () => {
            this.confirmSelection();
        });
                
        if (this.allowCancel) {
            this.cancelButton = new Button({
                scene: this.scene,
                x: this.scene.screenCenterX - 140, 
                y: this.scene.screenHeight*0.8,
                width: 150,
                height: 40,
                radius: 5,
                backgroundcolor: COLOR_ENUMS.OP_CREAM,
                outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
                text: "Cancel",
                fontsize: 30,
                fontfamily: "OnePieceFont",
                textColor: COLOR_ENUMS_CSS.OP_BLACK,
            }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN);
            
            this.obj.push(this.cancelButton);
        }

        // Add toggle button in bottom left corner
        this.toggleButton = new Button({
            scene: this.scene,
            x: 150, 
            y: this.scene.screenHeight - 100,
            width: 150,
            height: 40,
            radius: 5,
            backgroundcolor: COLOR_ENUMS.OP_CREAM,
            outlinecolor: COLOR_ENUMS.OP_CREAM_DARKER,
            text: "Hide",
            fontsize: 24,
            fontfamily: "OnePieceFont",
            textColor: COLOR_ENUMS_CSS.OP_BLACK,
        }).setDepth(DEPTH_VALUES.CARD_IN_MULLIGAN + 10); // Higher depth to stay on top
        
        this.toggleButton.setInteractive();
        this.toggleButton.on('pointerover', () => this.toggleButton.postFX.addGlow(COLOR_ENUMS.OP_WHITE, 2));
        this.toggleButton.on('pointerout', () => this.toggleButton.postFX.clear());
        this.toggleButton.on('pointerdown', () => this.togglePanelVisibility());
    

        this.isPanelVisible = true; // Track panel visibility state

        this.obj.push(this.confirmButton, this.toggleButton);
    }

    /**
     * Start the selection process with the given cards
     * @param {Array} cards - Array of cards to choose from
     */
    startSelection(cards) {
        this.cards = [];
        this.selectedCards = [];
        
        // Remove any existing card displays
        this.clearCardDisplays();
        
        // Check each card against requirements and adjust visual feedback
        cards.forEach((card, index) => {
            const meetsRequirements = this.cardMeetsRequirements(card);
            
            // Create a display version of the card
            const cardObj = this.createCardDisplay(card, cards.length, index, meetsRequirements);
            this.cards.push({
                card: card,
                display: cardObj,
                selected: false,
                meetsRequirements: meetsRequirements
            });
        });
        
        // Reset and show the UI
        this.updateSelectionCountText();
        this.updateConfirmButtonState();
        
        //Set Game State to passive
        this.scene.gameState.exit(GAME_STATES.NO_INTERACTION);

        this.setVisible(true);
        
        // Animate panel appearance
        this.animatePanelAppearance();
    }

    /**
     * Create a display version of a card for selection
     * @param {Object} card - The card data
     * @param {number} numberCards - The total number of cards
     * @param {number} index - Index position
     * @param {boolean} meetsRequirements - Whether the card meets selection requirements
     * @return {Phaser.GameObjects.Container} The card display object
     */
    createCardDisplay(card, numberCards, index, meetsRequirements) {
        // Calculate position based on index and total cards
        const cardWidth = (GAME_UI_CONSTANTS.CARD_ART_WIDTH * CARD_SCALE.IN_MULLIGAN);
        const cardHeight = (GAME_UI_CONSTANTS.CARD_ART_HEIGHT * CARD_SCALE.IN_MULLIGAN);
        const totalSeparatorWidth = Math.max(numberCards - 1, 0) * 20;
        const row = Math.floor(index / 5);
        const col = index % 5;
        
        const centerOffset = (Math.min(numberCards - row * 5, 5) * cardWidth) / 2 - (cardWidth/2) + totalSeparatorWidth/2;
        const x = this.scene.screenCenterX - centerOffset + col * cardWidth + col * 20;
        const y = this.scene.screenCenterY - 30 + row * cardHeight;
        
        // Create a card UI object for display
        const cardUI = new GameCardUI(this.scene, this.scene.activePlayerScene, {
            x: x,
            y: y,
            scale: CARD_SCALE.IN_MULLIGAN,
            artVisible: true,
            depth: DEPTH_VALUES.CARD_IN_MULLIGAN + 1,
            id: card.id
        });
        cardUI.setScale(0);
        
        cardUI.updateCardData(card.cardData || card);
        cardUI.setInteractive({ useHandCursor: true });
        
        // Add visual feedback if card doesn't meet requirements
        if (!meetsRequirements) {
            cardUI.setAlpha(0.8);
            
            // Add a overlay to indicate card doesn't meet requirements
            const overlay = this.scene.add.rectangle(
                0, 0, 
                cardUI.width, 
                cardUI.height,
                0x000000, 0.5
            ).setOrigin(0.5);
            
            cardUI.add(overlay);
            
            const unavailableText = this.scene.add.text(
                0, 0,
                "Unavailable",
                {
                    fontFamily: 'OnePieceFont',
                    fontSize: '75px',
                    color: '#FF0000',
                    stroke: '#000000',
                    strokeThickness: 3
                }
            ).setOrigin(0.5).setAngle(-30);
            
            cardUI.add(unavailableText);
        } else {
            // Add selection events for eligible cards
            cardUI.on('pointerdown', () => {
                this.toggleCardSelection(index);
            });
            
            // Add hover effect
            cardUI.on('pointerover', () => {
                if (!this.cards[index].selected) {
                    this.scene.tweens.add({
                        targets: cardUI,
                        y: y - 15,
                        scale: CARD_SCALE.IN_MULLIGAN * 1.1,
                        duration: 200,
                        ease: 'Sine.easeOut'
                    });
                }
            });
            
            cardUI.on('pointerout', () => {
                if (!this.cards[index].selected) {
                    this.scene.tweens.add({
                        targets: cardUI,
                        y: y,
                        scale: CARD_SCALE.IN_MULLIGAN,
                        duration: 200,
                        ease: 'Sine.easeOut'
                    });
                }
            });
        }
        
        // Add to displayable objects
        this.obj.push(cardUI);
        
        return cardUI;
    }

    /**
     * Update the selection count text
     */
    updateSelectionCountText() {
        this.selectionCountText.setText(`Selected: ${this.selectedCards.length}/${this.maxSelectCount}`);
        
        // Color based on whether we've met minimum requirements
        if (this.selectedCards.length < this.minSelectCount) {
            this.selectionCountText.setColor('#FF9999');
        } else if (this.selectedCards.length === this.maxSelectCount) {
            this.selectionCountText.setColor('#99FFAA');
        } else {
            this.selectionCountText.setColor('#FFFFFF');
        }
    }

    /**
     * Update the state of the confirm button
     */
    updateConfirmButtonState() {
        const canConfirm = this.selectedCards.length >= this.minSelectCount;
        this.confirmButton.setInteractive(canConfirm);
        
        if (canConfirm) {
            this.confirmButton.setText(`Confirm (${this.selectedCards.length})`);
        } else {
            this.confirmButton.setText(`Need ${this.minSelectCount - this.selectedCards.length} More`);
        }
    }

    /**
     * Animate the panel appearing
     */
    animatePanelAppearance() {
        // Start with elements scaled down
        this.titleText.setAlpha(0);
        this.descriptionText.setAlpha(0);
        this.selectionCountText.setAlpha(0);
        this.confirmButton.setAlpha(0);
        this.toggleButton.setAlpha(0); // Also start with toggle button hidden
        
        if (this.allowCancel) {
            this.cancelButton.setAlpha(0);
        }
        
        // Fade in backdrop
        this.scene.tweens.add({
            targets: this.backdrop,
            alpha: { from: 0, to: 0.7 },
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // Fade in text elements
                this.scene.tweens.add({
                    targets: [this.titleText, this.descriptionText, this.selectionCountText],
                    alpha: 1,
                    duration: 300,
                    ease: 'Sine.easeOut'
                });
                
                // Fade in buttons
                const buttonTargets = [this.confirmButton, this.toggleButton];
                if (this.allowCancel) buttonTargets.push(this.cancelButton);
                
                this.scene.tweens.add({
                    targets: buttonTargets,
                    alpha: 1,
                    duration: 300,
                    delay: 200,
                    ease: 'Sine.easeOut'
                });
                
                // Animate cards appearing with staggered delay
                this.cards.forEach((cardItem, index) => {
                    cardItem.display.setScale(0);
                    
                    this.scene.tweens.add({
                        targets: cardItem.display,
                        scale: CARD_SCALE.IN_MULLIGAN,
                        delay: 200 + index * 50,
                        duration: 300,
                        ease: 'Back.easeOut'
                    });
                });
            }
        });
    }

    /**
     * Clear all card display objects
     */
    clearCardDisplays() {
        this.cards.forEach(cardItem => {
            if (cardItem.display) {
                cardItem.display.destroy();
            }
            if (cardItem.checkmark) {
                cardItem.checkmark.destroy();
            }
        });
    }

    /**
     * Toggle the panel visibility between shown and hidden states
     */
    togglePanelVisibility() {
        if (this.isPanelVisible) {
            // Hide panel elements except toggle button
            this.hidePanel();
        } else {
            // Show all panel elements
            this.showPanel();
        }
        
        // Toggle state
        this.isPanelVisible = !this.isPanelVisible;
    }

    /**
     * Hide panel elements except toggle button
     */
    hidePanel() {
        // Update toggle button text
        this.toggleButton.setText("Show Panel");
        
        // Fade out all elements except toggle button
        const elementsToHide = this.obj.filter(obj => obj !== this.toggleButton);
        
        // Also hide card displays
        const cardDisplays = this.cards.map(card => card.display);
        
        // Combine all elements to hide
        const allElementsToHide = [...elementsToHide, ...cardDisplays];
        
        this.scene.tweens.add({
            targets: allElementsToHide,
            alpha: 0,
            duration: 300,
            ease: 'Sine.easeOut',
            onComplete: () => {
                // After animation, set visible false for better performance
                let numberOfElements = allElementsToHide.length;
                let currentElementIndex = 0;
                allElementsToHide.forEach(obj => {
                    if (obj) obj.setVisible(false);
                    currentElementIndex++;

                    if(currentElementIndex === numberOfElements) this.scene.gameState.exit(GAME_STATES.PASSIVE_INTERACTION);
                });
            }
        });
    }

    /**
     * Show all panel elements
     */
    showPanel() {
        this.scene.gameState.exit(GAME_STATES.NO_INTERACTION);

        // Update toggle button text
        this.toggleButton.setText("Hide Panel");
        
        // Get all elements except toggle button
        const elementsToShow = this.obj.filter(obj => obj !== this.toggleButton);
        
        // Also show card displays
        const cardDisplays = this.cards.map(card => card.display);
        
        // Combine all elements to show
        const allElementsToShow = [...elementsToShow, ...cardDisplays];
        
        // First make them visible with alpha 0
        allElementsToShow.forEach(obj => {
            if (obj) {
                obj.setVisible(true);
                obj.setAlpha(0);
            }
        });
        
        // Then fade them in
        this.scene.tweens.add({
            targets: allElementsToShow,
            alpha: 1,
            duration: 300,
            ease: 'Sine.easeIn'
        });
    }

    /**
     * Toggle selection state for a card
     * @param {number} index - The index of the card in the cards array
     */
    toggleCardSelection(index) {
        const cardItem = this.cards[index];
        
        // Skip if card doesn't meet requirements
        if (!this.cardMeetsRequirements(cardItem.display)) return;
        
        // Check if we're at max selections and trying to select another
        if (!cardItem.selected && this.selectedCards.length >= this.maxSelectCount) {
            this.shakeCard(cardItem.display);
            return;
        }
        
        // Toggle selection state
        cardItem.selected = !cardItem.selected;
        
        // Update selected cards array
        if (cardItem.selected) {
            this.selectedCards.push(cardItem.card);
            
            // Visual feedback for selection
            this.scene.tweens.add({
                targets: cardItem.display,
                y: cardItem.display.y - 30,
                scale: 0.4,
                duration: 200,
                ease: 'Back.easeOut'
            });
            
            // Add selection indicator
            /*const checkmark = this.scene.add.image(
                cardItem.display.x + cardItem.display.width * 0.4,
                cardItem.display.y - cardItem.display.height * 0.4,
                ASSET_ENUMS.CHECKMARK_ICON
            ).setScale(0).setDepth(DEPTH_VALUES.UI_FOREGROUND + 2);
            
            this.scene.tweens.add({
                targets: checkmark,
                scale: 0.8,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            this.obj.push(checkmark);
            cardItem.checkmark = checkmark;*/
            
            // Add glow effect
            cardItem.display.showGlow(COLOR_ENUMS.OP_ORANGE);
        } else {
            // Remove from selected cards
            const cardIndex = this.selectedCards.indexOf(cardItem.card);
            if (cardIndex !== -1) {
                this.selectedCards.splice(cardIndex, 1);
            }
            
            // Return to normal state
            this.scene.tweens.add({
                targets: cardItem.display,
                y: cardItem.display.y + 30,
                scale: 0.35,
                duration: 200,
                ease: 'Sine.easeOut'
            });
            
            // Remove checkmark with animation
            /*if (cardItem.checkmark) {
                this.scene.tweens.add({
                    targets: cardItem.checkmark,
                    scale: 0,
                    duration: 200,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        cardItem.checkmark.destroy();
                        cardItem.checkmark = null;
                    }
                });
            }*/
            
            // Remove glow
            cardItem.display.hideGlow();
        }
        
        // Update UI elements
        this.updateSelectionCountText();
        this.updateConfirmButtonState();
    }

    /**
     * Shake a card to indicate it can't be selected
     * @param {Phaser.GameObjects.Container} card - The card to shake
     */
    shakeCard(card) {
        const originalX = card.x;
        
        this.scene.tweens.add({
            targets: card,
            x: originalX - 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                card.x = originalX;
            }
        });
    }

    /**
     * Shake a button to indicate it can't be pressed
     * @param {Button} button - The button to shake
     */
    shakeButton(button) {
        const originalX = button.x;
        
        this.scene.tweens.add({
            targets: button,
            x: originalX - 10,
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                button.x = originalX;
            }
        });
    }

    /**
     * Confirm the current selection
     */
    confirmSelection() {
        if (this.selectedCards.length < this.minSelectCount) {
            // Can't confirm yet - not enough cards selected
            this.shakeButton(this.confirmButton);
            return;
        }
        
        // Animate panel disappearing
        this.animatePanelDisappearance(() => {
            // Call the callback with selected cards
            console.log("Coucou")
            //this.onSelectComplete(this.selectedCards);
        });
    }

    /**
     * Animate the panel disappearing
     * @param {Function} onComplete - Callback when animation completes
     */
    animatePanelDisappearance(onComplete) {
        // Fade out cards first
        const cardDisplays = this.cards.map(c => c.display);
        this.scene.tweens.add({
            targets: cardDisplays,
            alpha: 0,
            scale: 0.2,
            duration: 300,
            ease: 'Back.easeIn',
            onComplete: () => {
                // Then fade out UI elements
                const uiElements = [
                    this.titleText, this.descriptionText, 
                    this.selectionCountText, this.confirmButton
                ];
                
                if (this.allowCancel) {
                    uiElements.push(this.cancelButton);
                }
                
                this.scene.tweens.add({
                    targets: uiElements,
                    alpha: 0,
                    duration: 200,
                    ease: 'Sine.easeIn',
                    onComplete: () => {
                        this.setVisible(false);
                        this.clearCardDisplays();
                        
                        if (onComplete) {
                            onComplete();
                            this.scene.gameState.exit(GAME_STATES.ACTIVE_INTERACTION);
                        }
                    }
                });
            }
        });
    }

}
