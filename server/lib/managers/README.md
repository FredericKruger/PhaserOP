# Managers Documentation

This documentation covers the manager system in the PhaserOP server, which handles various aspects of game state, combat, targeting, selection, and other core game mechanics.

## Overview

The managers system is responsible for:
- Managing game state and match flags
- Handling combat and attack resolution
- Managing card targeting and selection
- Coordinating aura effects
- Processing card play mechanics
- Processing end-of-turn logic
- Maintaining game flow and state transitions

## Files Structure

```
managers/
├── state_manager.js        # Game state and flag management
├── attack_manager.js       # Combat and attack resolution
├── targeting_manager.js    # Card targeting system
├── selection_manager.js    # Card selection interfaces
├── aura_manager.js         # Aura effect management
├── play_card_manager.js    # Card playing mechanics
└── end_of_turn_manager.js  # End-of-turn processing
```

---

## StateManager

**File:** `state_manager.js`

Manages game state flags and match flow coordination through a comprehensive flag system.

### Classes

#### `WaitFlag`
Represents a single state flag with timing properties.

**Constructor:**
```javascript
constructor(name, isTurnBased, isActionBased)
```

**Parameters:**
- `name` (string) - Unique identifier for the flag
- `isTurnBased` (boolean) - Whether flag resets at turn end
- `isActionBased` (boolean) - Whether flag resets after actions

#### `MatchFlags`
Container for all match state flags.

**Key Flags:**
- **Setup Flags:** `READY_SETUP`, `READY_MULLIGAN`
- **Mulligan Flags:** `MULLIGAN_SWAPPED_CARDS`, `MULLIGAN_OVER`
- **Turn Flags:** `REFRESH_PHASE_COMPLETE`, `DRAW_PHASE_COMPLETE`, `DON_PHASE_COMPLETE`
- **Play Flags:** `PLAY_PHASE_READY`, `PLAY_REPLACEMENT_PHASE_READY`

**Methods:**
- `setFlag(flag, value)` - Sets a specific flag value
- `getFlag(flag)` - Retrieves a flag value
- `resetActionFlags()` - Resets all action-based flags
- `resetTurnFlags()` - Resets all turn-based flags

#### `FlagManager`
Main manager class for coordinating match flags.

**Constructor:**
```javascript
constructor(match)
```

**Parameters:**
- `match` (Match) - The match instance to manage

---

## AttackManager

**File:** `attack_manager.js`

Handles combat resolution, attack phases, and battle mechanics.

### Classes

#### `Attack`
Represents a single attack instance.

**Constructor:**
```javascript
constructor(attacker, defender, attackingPlayer, defendingPlayer)
```

**Parameters:**
- `attacker` (MatchCard) - The attacking card
- `defender` (MatchCard) - The defending card
- `attackingPlayer` (MatchPlayer) - Player making the attack
- `defendingPlayer` (MatchPlayer) - Player being attacked

**Methods:**
- `setAttacker(attacker)` - Updates the attacking card
- `setDefender(defender)` - Updates the defending card
- `switchDefender(defender)` - Changes defender during block phase

#### `AttackManager`
Manages the complete attack flow and resolution.

**Constructor:**
```javascript
constructor(matchState, attacker, defender, attackingPlayer, defendingPlayer)
```

**Phase Tracking Properties:**
- `onAttackEventPhase_Complete` - Attack event triggers complete
- `blockPhase_Complete` - Blocking phase complete
- `counterPhase_Complete` - Counter phase complete
- `resolveAttack_Complete` - Attack resolution complete
- `attackCleanup_Complete` - Cleanup phase complete

**Methods:**

#### `resolveAttack()`
Resolves the attack based on power comparison.

**Returns:** `Object` - Attack result with properties:
- `defenderDestroyed` (boolean) - Whether defender was destroyed
- `lostLeaderLife` (boolean) - Whether leader lost life

#### `verifyAttackStillValid()`
Checks if the attack can still proceed.

**Returns:** `boolean` - Whether attack is still valid

---

## TargetingManager

**File:** `targeting_manager.js`

Manages card targeting validation and target selection logic.

### Classes

#### `Target`
Represents targeting criteria and validation rules.

**Constructor:**
```javascript
constructor(serverTarget)
```

**Properties:**
- `player` (Array) - Valid player targets
- `cardTypes` (Array) - Valid card types
- `cost` (Object) - Cost restrictions
- `states` (Array) - Valid card states
- `types` (Array) - Valid creature types
- `attributes` (Array) - Valid attributes
- `power` (Object) - Power restrictions
- `exclude` (Array) - Cards to exclude
- `hasAbility` (Array) - Required abilities
- `names` (Array) - Specific card names
- `not_Names` (Array) - Excluded card names
- `ignoreTesting` (boolean) - Whether to skip validation

**Special State Groups:**
- `"ALL_IN_PLAY_STATES"` expands to all in-play card states

#### `TargetingManager`
Main targeting coordination class.

**Constructor:**
```javascript
constructor(match)
```

**Parameters:**
- `match` (Match) - The match instance

**Properties:**
- `match` (Match) - Reference to the match
- `target` (Target) - Current target criteria

---

## SelectionManager

**File:** `selection_manager.js`

Handles card selection interfaces and multi-card selection logic.

### Classes

#### `SelectionManager`
Manages card selection from various game zones.

**Dependencies:**
- `Match` - Main match object
- `MatchCard` - Card objects
- `TargetingManager` - For target validation

**Key Features:**
- Deck selection interfaces
- Hand selection interfaces
- Discard pile selection
- Multi-card selection validation
- Selection criteria filtering

---

## AuraManager

**File:** `aura_manager.js`

Manages persistent aura effects and their application to game objects.

### Classes

#### `AuraManager`
Coordinates all active aura effects in a match.

**Constructor:**
```javascript
constructor(matchId)
```

**Parameters:**
- `matchId` (number) - ID of the match

**Properties:**
- `matchId` (number) - Match identifier
- `activeAuras` (Array<MatchAura>) - Currently active auras

**Methods:**

#### `addAura(aura)`
Adds a new aura to the active list.

**Parameters:**
- `aura` (MatchAura) - The aura to add

#### `removeTurnAuras()`
Removes all turn-based auras at turn end.

**Returns:** `Array<string>` - IDs of removed auras

**Aura Duration Types:**
- `"TURN"` - Expires at end of turn
- `"PERMANENT"` - Lasts until removed
- `"GAME"` - Lasts entire game

---

## PlayCardManager

**File:** `play_card_manager.js`

Handles the mechanics of playing cards from hand to the battlefield, including cost validation, state transitions, and play restrictions.

### Classes

#### `PlayCardManager`
Manages all aspects of card playing mechanics.

**Constructor:**
```javascript
constructor(match)
```

**Parameters:**
- `match` (Match) - The match instance

**Properties:**
- `match` (Match) - Reference to the match
- `currentlyPlayingCard` (MatchCard) - Card currently being played
- `playRestrictions` (Object) - Current play restrictions

**Methods:**

#### `canPlayCard(card, player)`
Validates whether a card can be played.

**Parameters:**
- `card` (MatchCard) - The card to validate
- `player` (MatchPlayer) - The player attempting to play

**Returns:** `Object` - Validation result with properties:
- `canPlay` (boolean) - Whether the card can be played
- `reason` (string) - Reason if cannot play
- `requirements` (Array) - Unmet requirements

#### `payCardCost(card, player)`
Processes payment for a card's cost.

**Parameters:**
- `card` (MatchCard) - The card being played
- `player` (MatchPlayer) - The player paying the cost

**Returns:** `boolean` - Whether cost was successfully paid

#### `playCard(card, player, targets)`
Executes the complete card playing process.

**Parameters:**
- `card` (MatchCard) - The card to play
- `player` (MatchPlayer) - The player playing the card
- `targets` (Array) - Selected targets for the card

**Returns:** `Object` - Play result with success status and effects

#### `moveCardToPlay(card)`
Transitions a card from hand to the appropriate play zone.

**Parameters:**
- `card` (MatchCard) - The card to move

**Card Type Handling:**
- **Character Cards** → Move to character area
- **Event Cards** → Execute effect then move to discard
- **Stage Cards** → Move to stage area
- **DON Cards** → Move to DON area

#### `validatePlayTiming(card, player)`
Checks if the current game phase allows playing the card.

**Parameters:**
- `card` (MatchCard) - The card to validate
- `player` (MatchPlayer) - The player attempting to play

**Valid Play Phases:**
- Main Phase (most cards)
- Counter Phase (counter cards only)
- Response windows (instant speed effects)

#### `applyPlayRestrictions(restrictions)`
Sets temporary play restrictions.

**Parameters:**
- `restrictions` (Object) - Restriction rules to apply

**Common Restrictions:**
- Maximum cards per turn
- Specific card type limitations
- Cost-based restrictions
- Timing restrictions

---

## EndOfTurnManager

**File:** `end_of_turn_manager.js`

Processes end-of-turn effects, cleanup, and state transitions.

### Classes

#### `EndOfTurnManager`
Handles all end-of-turn processing.

**Dependencies:**
- `MatchCard` - For card state management

**Key Responsibilities:**
- Processing end-of-turn triggered abilities
- Cleaning up temporary effects
- Resetting card states
- Managing turn-based counters
- Coordinating with other managers for cleanup

---

## Integration Between Managers

### State Flow
1. **StateManager** coordinates overall game flow
2. **PlayCardManager** handles card playing during main phase
3. **AttackManager** handles combat phases
4. **TargetingManager** validates targets for both play and combat
5. **AuraManager** applies ongoing effects throughout all phases
6. **EndOfTurnManager** processes cleanup

### Manager Dependencies
```
Match
├── StateManager (flags and flow)
├── PlayCardManager (card playing)
│   └── TargetingManager (play targets)
├── AttackManager (combat)
│   └── TargetingManager (attack targets)
├── SelectionManager (card selection)
│   └── TargetingManager (selection criteria)
├── AuraManager (persistent effects)
└── EndOfTurnManager (cleanup)
```

### Event Coordination
- **Flags** coordinate timing between managers
- **Play events** trigger state changes and ability responses
- **Attack phases** trigger aura applications
- **Selection events** use targeting validation
- **Turn end** triggers cleanup across all managers

## Example Usage

```javascript
// Creating managers for a match
const stateManager = new FlagManager(match);
const playCardManager = new PlayCardManager(match);
const attackManager = new AttackManager(matchState, attacker, defender, attackingPlayer, defendingPlayer);
const targetingManager = new TargetingManager(match);
const selectionManager = new SelectionManager(match);
const auraManager = new AuraManager(matchId);
const endOfTurnManager = new EndOfTurnManager(match);

// Using state flags
stateManager.matchFlags.setFlag('PLAY_PHASE_READY', true);
const isReady = stateManager.matchFlags.getFlag('PLAY_PHASE_READY');

// Playing a card
const canPlay = playCardManager.canPlayCard(card, player);
if (canPlay.canPlay) {
    const playResult = playCardManager.playCard(card, player, targets);
}

// Resolving combat
const attackResult = attackManager.resolveAttack();
if (attackResult.defenderDestroyed) {
    // Handle destruction
}

// Managing auras
auraManager.addAura(newAura);
const expiredAuras = auraManager.removeTurnAuras();
```

## Notes

- All managers work together to maintain game state consistency
- Flags provide synchronization between different game phases
- Managers are designed to be modular and loosely coupled
- Each manager handles a specific aspect of game logic
- The system supports both synchronous and asynchronous operations
- PlayCardManager coordinates with other managers for complete card