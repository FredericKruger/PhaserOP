class CardOpeningPanelAnimations {
    constructor(scene) {
        this.scene = scene;
    }

    movePackToPlaceHolderAnimation(completeFunction, targetObject, placeholderObject) {
        let targetX = placeholderObject.x;
        let targetY = placeholderObject.y;
        let startX = targetObject.x;
        let startY = targetObject.y;
        // Calculate the target scale to fit packVisual within placeholderImage
        let scaleX = placeholderObject.displayWidth/targetObject.width;
        let scaleY = placeholderObject.displayHeight/targetObject.height;
        let targetScale = Math.min(scaleX, scaleY) * 0.95; // Slightly smaller to almost fit

        // Generate points for the spiral path
        let spiralPoints = this.scene.game.utilFunctions.generateSpiralPath(startX, startY, targetX, targetY, 200, 0, 1, 100);

        // Define a control point for the Bezier curve
        let controlX = (startX + spiralPoints[0].x) / 2;
        let controlY = startY - 100; // Adjust this value to control the curvature

        // Create a custom path using the Bezier curve and the generated spiral points
        let path = new Phaser.Curves.Path(startX, startY);
        path.splineTo([new Phaser.Math.Vector2(startX, startY), spiralPoints[0]]);
        for (let i = 1; i < spiralPoints.length; i++) {
            path.lineTo(spiralPoints[i].x, spiralPoints[i].y);
        }

        // Create a PathFollower to follow the path
        let follower = this.scene.add.follower(path, startX, startY, targetObject.art.texture.key);
        follower.setScale(targetObject.scaleX, targetObject.scaleY);
        targetObject.setVisible(false);

        follower.startFollow({
            duration: 500,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: follower,
                    x: targetX,
                    y: targetY,
                    scaleX: targetScale,
                    scaleY: targetScale,
                    ease: 'Sine.easeInOut',
                    duration: 50,
                    onComplete: () => {
                        // Optional: Add any additional logic to execute after the animation completes
                        follower.destroy();

                        targetObject.setPosition(targetX, targetY);
                        targetObject.setScale(targetScale);
                        targetObject.setVisible(true);
    
                        completeFunction();
                    }
                });
            }
        });
    }

    openPackAnimation(targetObject, completeFunction, cardList) {
        //Preparing animation Panel
        // Lift and tilt animation
        this.scene.tweens.add({
            targets: targetObject,
            y: targetObject.y - 50, // Lift up
            angle: -15, // Tilt
            scaleX: targetObject.scaleX * 1.4, // Zoom in
            scaleY: targetObject.scaleY * 1.4, // Zoom in
            ease: 'Sine.easeInOut',
            duration: 1000,
            onComplete: () => {
                // Create the left and right halves of the pack
                let leftHalf = this.scene.add.image(targetObject.x, targetObject.y, targetObject.art.texture.key).setOrigin(0.5);
                let rightHalf = this.scene.add.image(targetObject.x, targetObject.y, targetObject.art.texture.key).setOrigin(0.5);

                // Set the origin and crop the images to create the left and right halves
                leftHalf.setOrigin(1, 0.5);
                leftHalf.setScale(targetObject.scaleX, targetObject.scaleY);
                //leftHalf.setCrop(0, 0, this.selectedPack.width / 2, this.selectedPack.height);
                leftHalf.angle = -15; // Tilt the left half
                leftHalf.setPipeline(PIPELINE_ENUMS.RIGHT_BORDER_RIPPED_PIPELINE);

                rightHalf.setOrigin(0, 0.5);
                rightHalf.setScale(targetObject.scaleX, targetObject.scaleY);
                //rightHalf.setCrop(this.selectedPack.width / 2, 0, this.selectedPack.width / 2, this.selectedPack.height);
                rightHalf.angle = -15; // Apply the tilt
                rightHalf.setPipeline(PIPELINE_ENUMS.LEFT_BORDER_RIPPED_PIPELINE);

                // Hide the original packVisual
                targetObject.setVisible(false);

                // Counter to track the completion of both tweens
                let tweensCompleted = 0;

                // Function to call showPack once both tweens have completed
                const checkTweensCompletion = () => {
                    tweensCompleted++;
                    if (tweensCompleted === 2) {
                        completeFunction(cardList);
                    }
                };

                // Animate the separation of the left and right halves with some randomness
                this.scene.tweens.add({
                    targets: leftHalf,
                    x: leftHalf.x - 120 + Phaser.Math.Between(-20, 20), // Move left half to the left with some randomness
                    y: leftHalf.y + Phaser.Math.Between(-10, 10), // Add some vertical randomness
                    angle: -30 + Phaser.Math.Between(-5, 5), // Add some randomness to the tilt
                    scaleX: leftHalf.scaleX * (1.1 + Phaser.Math.FloatBetween(0, 0.2)), // Increase scale with some randomness
                    scaleY: leftHalf.scaleY * (1.1 + Phaser.Math.FloatBetween(0, 0.2)), // Increase scale with some randomness
                    ease: 'Power2',
                    duration: 500,
                    onComplete: () => {
                        leftHalf.destroy(); // Destroy the left half after animation
                        checkTweensCompletion(); // Check if both tweens have completed
                    }
                });

                this.scene.tweens.add({
                    targets: rightHalf,
                    x: rightHalf.x + 120 + Phaser.Math.Between(-20, 20), // Move right half to the right with some randomness
                    y: rightHalf.y + Phaser.Math.Between(-10, 10), // Add some vertical randomness
                    angle: 0 + Phaser.Math.Between(-5, 5), // Add some randomness to the tilt
                    scaleX: rightHalf.scaleX * (1.1 + Phaser.Math.FloatBetween(0, 0.2)), // Increase scale with some randomness
                    scaleY: rightHalf.scaleY * (1.1 + Phaser.Math.FloatBetween(0, 0.2)), // Increase scale with some randomness
                    ease: 'Power2',
                    duration: 500,
                    onComplete: () => {
                        rightHalf.destroy(); // Destroy the right half after animation
                        checkTweensCompletion(); // Check if both tweens have completed
                    }
                });
            }
        });

        // Shake animation
        this.scene.tweens.add({
            targets: targetObject,
            x: {
                value: '+=10', // Shake by 10 pixels
                duration: 60,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 10 // Repeat the shake effect
            },
            y: {
                value: '+=5', // Shake by 5 pixels
                duration: 60,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 10 // Repeat the shake effect
            },
            delay: 0 // Start immediately
        });
    }
}