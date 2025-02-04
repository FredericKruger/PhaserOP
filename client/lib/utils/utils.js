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

}