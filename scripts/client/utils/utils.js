class Utils {

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
    
    getCardSymbol = function(color, isleader) {
        if(isleader === 0) {
            return 'op_' + color[0] + '_symbol';
        } else {
            let colorString = 'op_leader_' + color[0];
            if(color.length>1) colorString = colorString + '_' + color[1];
            return colorString;
        }
    }
    
    getCardCost = function(color, cost) {
        return 'op_cost_' + color + '_' + cost;
    }
    
    getCardAttributeSymbol = function(attribute) {
        switch(attribute) {
            case "RANGED":
                return 'op_attribute_RANGED';
            case "SLASH":
                return 'op_attribute_SLASH';
            case "SPECIAL":
                return 'op_attribute_SPECIAL';
            case "STRIKE":
                return 'op_attribute_STRIKE';
            case "WISDOM":
                return 'op_attribute_WISDOM';
        }
    }
    
    getLeaderArt = function(leaderArt) {
        return 'op_leader_' + leaderArt;
    }

}