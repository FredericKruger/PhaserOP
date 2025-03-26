class TargetingArrow {

    /** Constructor
     * @param {GameScene} scene - The scene this arrow will be displayed in
     */
    constructor(scene, color = COLOR_ENUMS.OP_ORANGE) {
        this.scene = scene;

        this.originatorObject = null;
        this.isTargeting = false;

        this.arrowColor = color;
    }

    /** Function to create the arrow */
    /*create() {
        this.arrowStem = this.scene.add.rectangle(0, 0, 100, 20, COLOR_ENUMS.OP_ORANGE).setOrigin(0, 0.5).setVisible(false).setDepth(2);
        this.arrowHead = this.scene.add.triangle(100, 100, 0, -20, 0, 20, 40, 0, COLOR_ENUMS.OP_ORANGE).setOrigin(0.5, 0.5).setVisible(false).setDepth(2);
    }*/
    create() {
        this.arrowStem = this.scene.add.graphics().setDepth(4);
        this.arrowHead = this.scene.add.triangle(100, 100, 0, -30, 0, 30, 60, 0, this.arrowColor).setOrigin(0.5, 0.5).setVisible(false).setDepth(4);
    }

    /** Function to draw a dashed curved line
         * @param {Phaser.GameObjects.Graphics} graphics - The graphics object to draw on
         * @param {number} x1 - The starting x-coordinate
         * @param {number} y1 - The starting y-coordinate
         * @param {number} x2 - The ending x-coordinate
         * @param {number} y2 - The ending y-coordinate
         * @param {number} color - The color of the dashes
         * @param {number} thickness - The thickness of the dashes
         */
    drawDashedCurvedLine(graphics, x1, y1, x2, y2, color, thickness) {
        graphics.clear();
        graphics.lineStyle(thickness, color, 1.0);

        let controlX = (x1 + x2) / 2;
        let controlY = y1 - 50; // Adjust this value to control the curve

        let path = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(x1, y1), new Phaser.Math.Vector2(controlX, controlY), new Phaser.Math.Vector2(x2, y2));
        let length = path.getLength();

        // Calculate the number of dashes and gaps
        let adjustedLength = length - 5; // Adjust the length to stop before the arrow head
        let gapLength = 10;
        let dashCount = Math.floor(adjustedLength / (60 + gapLength)); // Example values for dashLength and gapLength
        if (dashCount < 1) dashCount = 1; // Ensure at least one dash
        let dashLength = (adjustedLength - dashCount*gapLength) / dashCount;//adjustedLength / (dashCount * 2 - 1);

        let t = 0;

        let lastStart = null;
        let lastEnd = null;

        for (let i = 0; i < dashCount; i++) {
            let start = path.getPointAt(t);
            t += dashLength / length;
            let end = path.getPointAt(t);
            if(i < dashCount-1) {
                graphics.moveTo(start.x, start.y);
                graphics.lineTo(end.x, end.y);
            }
            t += gapLength / length;

            lastStart = start;
            lastEnd = end;
        }

        graphics.strokePath();

        return { lastStart, lastEnd };
    }

    /** Set location of the arrow and rotate according to the position of the target
     * @param {number} x2 - x position of target
     * @param {number} y2 - y position of target
     */
    update(x2, y2) {
        let x1 = this.originatorObject.x;
        let y1 = this.originatorObject.y;

        let { lastStart, lastEnd } = this.drawDashedCurvedLine(this.arrowStem, x1, y1, x2, y2, this.arrowColor, 20); // Adjust the thickness here

        if (lastStart && lastEnd) {
            let angle = Math.atan2(lastEnd.y - lastStart.y, lastEnd.x - lastStart.x);
            this.arrowHead.x = lastEnd.x-30*Math.cos(angle)-30*Math.sin(angle);
            this.arrowHead.y = lastEnd.y-30*Math.sin(angle)+30*Math.cos(angle);
            this.arrowHead.rotation = angle;
        }
    }

    /** function to set the visibilty of the arrow
     * @param {boolean} visible - The visibility
     */
    setVisible(visible) {
        this.arrowStem.setVisible(visible);
        this.arrowHead.setVisible(visible); 

        if(visible) {
            //Bring the arrow to the top if its visible 
            this.scene.children.bringToTop(this.arrowStem);
            this.scene.children.bringToTop(this.arrowHead);
        }
    }

    /** function to start the targetting
     * @param {Object} originatorObject - The object that is targetting
     */
    startTargeting(originatorObject) {
        this.originatorObject = originatorObject;
        this.setVisible(true);
        this.isTargeting = true;
    }  
    
    /** Function to stop targetting */
    stopTargeting() {
        //this.originatorObject = null;
        this.setVisible(false);
        this.isTargeting = false;
    }

    /** Function to start manual targeting required in case of animations
     * @param {Object} originatorObject - The object that is targetting
     * @param {Object} targetObject - The object that is being target
     */
    startManualTargeting(originatorObject, targetObject) {
        this.originatorObject = originatorObject;
        this.update(targetObject.x, targetObject.y);

        this.setVisible(true);
    }

    /** Function to start manual targeting required in case of animations
     * @param {Object} originatorObject - The object that is targetting
     * @param {number} x - The x position of the target
     * @param {number} y - The y position of the target
     */
    startManualTargetingXY(originatorObject, x, y) {
        this.originatorObject = originatorObject;
        this.update(x, y);

        this.setVisible(true);
    }

    /**
     * Creates and returns a tween that animates the targeting arrow to a specific position
     * @param {number} targetX - The target x-coordinate position
     * @param {number} targetY - The target y-coordinate position
     * @param {number} duration - The duration of the animation in milliseconds
     * @param {string} ease - The easing function to use
     * @param {number} delay - The delay before the animation starts in milliseconds
     * @returns {Array} An array of tween configurations
     */
    animateToPosition(targetX, targetY, duration = 500, ease = 'Power2', delay = 0) {
        // Store the starting positions
        const startX = this.originatorObject.x;
        const startY = this.originatorObject.y;
        
        // Calculate distance between points to adjust timing
        const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
        const adjustedDuration = Math.min(Math.max(duration, 300), 800); // Ensure reasonable animation time
        
        // Create a temporary object to animate with dynamic speed properties
        const animationHelper = {
            progress: 0,
            currentX: startX,
            currentY: startY,
            pathType: 'linear' // Use linear path for straight arrow
        };
        
        // Create and return the tween with improved speed dynamics
        const tween = [{
            onStart: () => {
                this.setVisible(true);
                // Optional: Add a subtle "launch" effect at the start
                if (this.arrowHead) {
                    this.arrowHead.setScale(0.8);
                    this.scene.tweens.add({
                        targets: this.arrowHead,
                        scale: 1,
                        duration: 80,
                        ease: 'Back.easeOut'
                    });
                }
            },
            targets: animationHelper,
            progress: 1,
            duration: adjustedDuration,
            delay: delay,
            ease: 'Expo.easeOut', // Fast start, gradual slowdown for dynamic feel
            onUpdate: () => {
                // Calculate current position with linear interpolation
                const currentX = startX + (targetX - startX) * animationHelper.progress;
                const currentY = startY + (targetY - startY) * animationHelper.progress;
                
                // Update the targeting arrow to the current position
                this.update(currentX, currentY);
                
                // Optional: Adjust dash speed based on progress
                // This creates the illusion of movement dynamics without changing the path
                if (this.arrowStem) {
                    // Calculate current speed factor - faster at start, slower at end
                    const speedFactor = 1 - Math.pow(animationHelper.progress, 2);
                    
                    // Apply subtle scaling to suggest momentum
                    if (this.arrowHead) {
                        // Slight stretch at high speeds, normal at end
                        const stretchFactor = 1 + speedFactor * 0.1;
                        this.arrowHead.setScale(stretchFactor);
                    }
                }
            },
            onComplete: () => {
                // Ensure the arrow is exactly at the final position
                this.update(targetX, targetY);
                
                // Add an "impact" effect at the target
                if (this.arrowHead) {
                    this.scene.tweens.add({
                        targets: this.arrowHead,
                        scale: 1.3, // Larger scale for more impact
                        duration: 100,
                        yoyo: true,
                        ease: 'Back.easeOut'
                    });
                    
                    // Optional: Add a ripple or flash effect at the target
                    const impact = this.scene.add.circle(targetX, targetY, 30, this.arrowColor, 0.7);
                    impact.setDepth(1);
                    
                    this.scene.tweens.add({
                        targets: impact,
                        scale: 2,
                        alpha: 0,
                        duration: 250,
                        ease: 'Quad.easeOut',
                        onComplete: () => {
                            impact.destroy();
                        }
                    });
                }
            }
        }];
        
        return tween;
    }

}