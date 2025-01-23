const DECK_LIMIT = 50;
const CARD_LIMIT = 4;
const CARD_LEADER_LIMIT = 1;

const CARD_ART_WIDTH = 744;
const CARD_ART_HEIGHT = 1004;

const CARD_WIDTH = 704;
const CARD_HEIGHT = 984;

const OP_BLACK = 0x272424;
const OP_CREAM = 0xE9E6CE;
const OP_RED = 0xDD2129;
const OP_GREEN = 0x019E79;
const OP_BLUE = 0x0088BA;
const OP_PURPLE = 0x7A3983;
const OP_YELLOW = 0xEFE75A;
const OP_GOLD = 0xD6AA44;
const OP_ORANGE = 0xEA6929;
const OP_WHITE = 0xffffff;

const ON_ATTACK = 0x307EB2;
const DON = 0x13111E;
const TRIGGER = 0xFCED44;

const CARD_COLORS = ["RED", "GREEN", "BLUE", "PURPLE", "BLACK", "YELLOW"];

const GameClient = new Client();

window.onload = function() {
    let osize = { x:1500, y:960 };
    let oscale = { x:1500 / window.innerWidth, y:960 / window.innerHeight }

    let config = {
        type: Phaser.AUTO,
        parent: 'game',
        scene: [ LoaderBackground, Loader, Login, Title, CollectionManager/*, DeckSelection, Duel, WaitingForMatch*/ ], //Builder
        disableContextMenu: true,
        /*fps: {
            target: 60,
            forceSetTimeOut: true
        },*/
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: window.innerWidth,
            height: window.innerHeight,
        },
        dom: {
            createContainer: true
        }
    };

    let Game = new Phaser.Game(config);
    GameClient.game = Game;
}

window.onclose = function () {
    GameClient.askDisconnect();
}

getCardColor = function(color) {
    switch(color) {
        case "RED":
            return OP_RED;
        case "GREEN":
            return OP_GREEN;
        case "BLUE":
            return OP_BLUE;
        case "PURPLE":
            return OP_PURPLE;
        case "BLACK":
            return OP_BLACK;
        case "YELLOW":
            return OP_YELLOW;
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
    console.log('op_leader_' + leaderArt);
    return 'op_leader_' + leaderArt;
}