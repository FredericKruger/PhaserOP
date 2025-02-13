const GAME_UI_CONSTANTS = Object.freeze({
    COMPONENT_SEPARATOR_WIDTH: 20,
    COMPONENT_SEPARATOR_HEIGHT: 20,

    CARD_ART_WIDTH: 600,
    CARD_ART_HEIGHT: 838,
});

const PLAYER_POSITIONS = Object.freeze({
    TOP: 'TOP',
    BOTTOM: 'BOTTOM',
});

const CARD_STATES = Object.freeze({
    IN_DECK: 'IN_DECK',
    IN_HAND: 'IN_HAND',
    IN_HAND_HOVERED: 'IN_HAND_HOVERED',
    IN_DISCARD: 'IN_DISCARD',
    IN_LOCATION: 'IN_LOCATION',

    TRAVELLING_DECK_HAND: 'TRAVELLING_DECK_HAND',
});

const CARD_SCALE = Object.freeze({
    IN_DON_DECK: 0.11,
    IN_DECK: 0.13,
    IN_HAND: 0.3,
    IN_HAND_HOVERED: 0.4,
    IN_DISCARD: 0.11,
    IN_LOCATION: 0.17,
    IN_LOCATION_LEADER: 0.2 
});

const GAME_PHASES = Object.freeze({
    SETUP: 'Setup',
    DON_PHASE: 'Don Phase',
});