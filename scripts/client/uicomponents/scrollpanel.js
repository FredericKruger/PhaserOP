class ScrollPanel{

    constructor(scene, x, y, width, height) {
        this.obj = [];
        this.scene = scene;
        this.isVisible = false;

        this.height = height;

        // Create the background for the scroll container
        let background = this.scene.add.graphics();
        background.fillStyle(OP_CREAM_DARKER, 0.8); // Set the background color to OP_CREAM_DARKER
        background.fillRect(x, y, width, height);
        this.obj.push(background);

        this.scrollContainer = this.scene.add.container(x, y);
        this.scrollContainerPosition = {x: this.scrollContainer.x, y:this.scrollContainer.y};
        this.scrollContainerHeight = height;
        this.scrollContainer.setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
        this.obj.push(this.scrollContainer);

        //Create the maskshape
        this.maskShape = this.scene.add.graphics();
        this.maskShape.fillRect(this.scrollContainer.x, this.scrollContainer.y, width, height);
        this.obj.push(this.maskShape);

        this.mask = new Phaser.Display.Masks.GeometryMask(this, this.maskShape);
        //Set mask to the container
        this.scrollContainer.setMask(this.mask);

        this.scene.input.on('wheel', (pointer, gameObject, deltaX, deltaY) => {
            this.scrollContainer.y -= deltaY/10;
            this.updateScrollcontainer();
        });

        this.setVisible(this.isVisible);

        this.scrollContainer.setInteractive();
        this.scrollContainer.on('pointerover', () => {
            this.obj.forEach(o => o.setDepth(1)); // Set a higher depth value
        });
    }

    setVisible(visible) {
        for(let o of this.obj) {
            o.setVisible(visible);
        }
        this.isVisible = visible;
    }

    addElement(element) {
        this.scrollContainer.add(element);
    }

    updateScrollcontainer() {
        this.scrollContainerMaxHeight = this.calculateScrollContainerHeight();
        this.scrollContainer.y = Phaser.Math.Clamp(this.scrollContainer.y, this.scrollContainerPosition.y-Math.max((this.scrollContainerMaxHeight - this.scrollContainerHeight), 0), this.scrollContainerPosition.y);

        //Update interactivity of objects in maskbound
        let maskBounds = {
            top: this.scrollContainerPosition.y,
            bottom: this.scrollContainerPosition.y + this.height*2
        }

        // Check if the card is within the mask bounds
        this.scrollContainer.each((child) => {
            let childBounds = this.convertToWorldPosition(child.y, child.y);
            childBounds = {
                top: childBounds.y,
                bottom: childBounds.y + child.height
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
            let childBottom = child.y + (child.height || 0) * child.scaleY;
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