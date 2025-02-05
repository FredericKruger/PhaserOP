class Utils {

    /**
     * 
     * @param {string} color 
     * @returns COLOR_ENUMS
     */
    getCardColor = function(color) {
        switch(color) {
            case "RED":
                return COLOR_ENUMS.OP_RED;
            case "GREEN":
                return COLOR_ENUMS.OP_GREEN;
            case "BLUE":
                return COLOR_ENUMS.OP_BLUE;
            case "PURPLE":
                return COLOR_ENUMS.OP_PURPLE;
            case "BLACK":
                return COLOR_ENUMS.OP_BLACK;
            case "YELLOW":
                return COLOR_ENUMS.OP_YELLOW;
        }
    }
    
    /**
     * 
     * @param {string[]} color 
     * @returns string
     */
    getCardSymbol = function(color, forDeck) {
        if(!forDeck) {
            return `ICON_SYMBOL_${color[0]}`;
        } else {
            let colorString = `ICON_SYMBOL_LEADER_${color[0]}`;
            if(color.length>1) colorString = `${colorString}_${color[1]}`;
            return colorString;
        }
    }
    
    /**
     * 
     * @param {string} color 
     * @param {number} cost 
     * @returns string
     */
    getCardCost = function(color, cost) {
        return `COST_${color}_${cost}`;
    }
    
    /**
     * 
     * @param {string} attribute 
     * @returns string
     */
    getCardAttributeSymbol = function(attribute) {
        if(attribute === '') return null;
        return `ICON_ATTRIBUTE_SYMBOL_${attribute}`;
    }
    
    /**
     * 
     * @param {string} leaderArt 
     * @returns string
     */
    getLeaderArt = function(leaderArt) {
        return `LEADER_${leaderArt}`;
    }

    /**
     * 
     * @param {string} packArt 
     * @returns string
     */
    getPackArt = function(packArt) {
        return `PACK_ART_${packArt}`;
    }
    
    // Define a function to generate points for a spiral path
    generateSpiralPath(startX, startY, endX, endY, startRadius, endRadius, turns, points) {
        let pathPoints = [];
        let angleStep = (Math.PI * 2 * turns) / points;
        let radiusStep = (endRadius - startRadius) / points;

        for (let i = 0; i <= points; i++) {
            let angle = i * angleStep;
            let radius = startRadius + i * radiusStep;
            let x = endX + Math.cos(angle) * radius;
            let y = endY + Math.sin(angle) * radius;
            pathPoints.push(new Phaser.Math.Vector2(x, y));
        }

        return pathPoints;
    }
}