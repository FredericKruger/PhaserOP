class ScrollPanel{

    constructor(scene, x, y, width, height, showBackground, backgroundConfig) {
        this.obj = [];
        this.scene = scene;
        this.isVisible = false;

        this.x = x;
        this.y = y;

        this.height = height;

        // Create the background for the scroll container
        if(showBackground) {
            let background = this.scene.add.graphics();
            background.fillStyle(backgroundConfig.backgroundColor, backgroundConfig.alpha); // Set the background color to OP_CREAM_DARKER
            background.fillRoundedRect(x, y, width, height, backgroundConfig.round);
            this.obj.push(background);
        }

        this.scrollContainer = this.scene.add.container(x, y);
        this.scrollContainerPosition = {x: this.scrollContainer.x, y:this.scrollContainer.y};
        this.scrollContainerHeight = height;
        this.scrollContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.obj.push(this.scrollContainer);

        //Create the maskshape
        this.maskShape = this.scene.add.graphics();
        this.maskShape.fillRect(this.scrollContainer.x, this.scrollContainer.y, width, height);
        this.obj.push(this.maskShape);

        this.mask = new Phaser.Display.Masks.GeometryMask(this.scene, this.maskShape);
        //Set mask to the container
        this.scrollContainer.setMask(this.mask);

        this.scene.input.on('wheel', (pointer, gameObject, deltaX, deltaY) => {
            this.scrollContainer.y -= deltaY/10;
            this.updateScrollcontainer();
        });

        this.setVisible(this.isVisible);

        this.scrollContainer.setInteractive();
        /*this.scrollContainer.on('pointerover', () => {
            this.obj.forEach(o => o.setDepth(1)); // Set a higher depth value
        });*/
    }

    setVisible(visible) {
        for(let o of this.obj) {
            o.setVisible(visible);
        }
        this.isVisible = visible;
    }

    addElement(element) {
        this.scrollContainer.add(element);
        this.updateScrollcontainer();
    }

    removeElement(element) {
        this.scrollContainer.remove(element);
        this.updateScrollcontainer();  
    }

    updateScrollcontainer() {
        this.scrollContainerMaxHeight = this.calculateScrollContainerHeight();
 
        this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y, this.y - Math.max(this.scrollContainerMaxHeight-this.height, 0), this.y);

        //Update interactivity of objects in maskbound
        let maskBounds = {
            top: this.scrollContainerPosition.y,
            bottom: this.scrollContainerPosition.y + this.height*2
        }

        // Check if the card is within the mask bounds
        this.scrollContainer.each((child) => {
            let initBounds = this.convertToWorldPosition(child.y, child.y);
            let childBounds = {
                top: initBounds.y,
                bottom: initBounds.y + child.height
            };

            //Check if in bounds
            if (maskBounds.top > childBounds.top || maskBounds.bottom < childBounds.bottom) {
                child.disableInteractive();
            } else {
                child.setInteractive();
            }
        });
    }

    calculateScrollContainerHeight() {
        let maxHeight = 0;
    
        this.scrollContainer.each(function (child) {
            let childBottom = child.y + (child.displayHeight || 0);
            if (childBottom > maxHeight) {
                maxHeight = childBottom;
            }
        });
    
        return maxHeight;
    }

    convertToWorldPosition(x, y) {
        let transformMatrix = this.scrollContainer.getWorldTransformMatrix();

        // Apply the transform matrix to get the actual screen coordinates
        let newX = transformMatrix.tx + x * transformMatrix.a + y * transformMatrix.c;
        let newY = transformMatrix.ty + x * transformMatrix.b + y * transformMatrix.d;

        return {x:newX, y:newY};
    }

}