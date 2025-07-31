# Ability Manager Documentation

This documentation covers the ability management system in the PhaserOP server, which handles all card abilities, their creation, execution, and specialized types.

## Overview

The ability manager system is responsible for:
- Creating different types of abilities based on card data
- Managing ability execution and targeting
- Handling specialized ability types (Passive, Aura, Blocker)
- Coordinating with other game systems (targeting, selection, auras)

## Files Structure

```
ability_manager/
├── server_ability_factory.js    # Factory for creating abilities
├── server_ability.js            # Base ability class and actions
├── server_passive_ability.js    # Passive ability specialization
├── server_aura_ability.js       # Aura ability specialization  
└── server_blocker_ability.js    # Blocker ability specialization
```

---

## ServerAbilityFactory

**File:** `server_ability_factory.js`

Factory class responsible for creating the appropriate ability instances based on ability type.

### Constructor
```javascript
constructor()
```
Creates a new ability factory instance.

### Methods

#### `createAbility(abilityData, cardId, matchId)`
Creates a single ability instance based on the ability type.

**Parameters:**
- `abilityData` (Object) - The ability configuration data
- `cardId` (number) - ID of the card this ability belongs to
- `matchId` (number) - ID of the match this ability is part of

**Returns:** `ServerAbility` - The appropriate ability instance

**Supported Types:**
- `'PASSIVE'` → Creates `ServerPassiveAbility`
- `'AURA'` → Creates `ServerAuraAbility`
- `'BLOCKER'` → Creates `ServerBlockerAbility` (commented out)
- Default → Creates base `ServerAbility`

#### `createAbilitiesForCard(abilitiesData, cardId, matchId)`
Creates multiple abilities for a single card.

**Parameters:**
- `abilitiesData` (Object[]) - Array of ability configurations
- `cardId` (number) - ID of the card
- `matchId` (number) - ID of the match

**Returns:** `ServerAbility[]` - Array of created abilities

#### `createAbilityForAura(abilityData, cardId, matchId)`
Creates an ability specifically for an aura effect.

**Parameters:**
- `abilityData` (Object) - The ability configuration
- `cardId` (number) - ID of the card
- `matchId` (number) - ID of the match

**Returns:** `ServerAbility` - The created ability

---

## ServerAbility

**File:** `server_ability.js`

Base class for all card abilities. Handles ability execution, targeting, and action management.

### Constructor
```javascript
constructor(config, cardId, matchId)
```

**Parameters:**
- `config` (Object) - Ability configuration
- `cardId` (number) - ID of the owning card
- `matchId` (number) - ID of the current match

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | number | Unique ability identifier |
| `cardId` | number | ID of the card that owns this ability |
| `matchId` | number | ID of the current match |
| `text` | string | Ability description text |
| `type` | string | Type of ability (PASSIVE, AURA, etc.) |
| `conditions` | Array | Conditions that must be met to activate |
| `optional` | boolean | Whether the ability is optional |
| `target` | Object | Targeting configuration |
| `actions` | Array | Array of actions to execute |
| `currentActions` | Array | Dynamic copy of actions during execution |
| `usedThisTurn` | boolean | Tracking if used this turn |
| `usedThisGame` | boolean | Tracking if used this game |
| `currentAction` | number | Index of current action being executed |
| `actionResults` | Array | Results from executed actions |
| `currentTargets` | Array | Currently selected targets |

### Methods

#### `action(player, targets)`
Executes the ability with the given player and targets.

**Parameters:**
- `player` (MatchPlayer) - The player activating the ability
- `targets` (Array) - Array of target IDs

---

## Ability Actions

The `serverAbilityActions` object contains all available actions that abilities can perform:

### Core Actions

#### `activateExertedDon(match, player, card, params)`
Activates exerted DON cards for resource generation.

**Parameters:**
- `params.player` ('owner' | 'opponent') - Which player's DON to activate
- `params.amount` (number) - Number of DON to activate

#### `createAura(match, player, card, params, targets)`
Creates a persistent aura effect.

**Parameters:**
- `params.target` ('SELF' | 'TARGET') - What the aura affects
- `params.aura` (Object) - Aura configuration data

#### `createSelectionManager(match, player, card, params)`
Creates a selection interface for choosing cards.

**Parameters:**
- `params.amount` (number) - Number of cards to select (-1 for unlimited)
- `params.cardPool` ('DECK' | 'DISCARD') - Where to select from

---

## ServerPassiveAbility

**File:** `server_passive_ability.js`

Specialized ability class for passive effects that are always active.

### Constructor
```javascript
constructor(config, cardId, matchId)
```
Inherits from `ServerAbility` with passive-specific behavior.

### Characteristics
- Always active when conditions are met
- No manual activation required
- Typically provides ongoing effects

---

## ServerAuraAbility

**File:** `server_aura_ability.js`

Specialized ability class for aura effects that affect other cards.

### Constructor
```javascript
constructor(config, cardId, matchId)
```
Inherits from `ServerAbility` with aura-specific functionality.

### Methods

#### `addPassivePower(target)`
Calculates additional power granted by this aura to a target card.

**Parameters:**
- `target` (MatchCard) - The card to calculate power for

**Returns:** `number` - Additional power granted

#### `canBlock(target)`
Determines if this aura grants blocking ability to a target.

**Parameters:**
- `target` (MatchCard) - The card to check

**Returns:** `boolean` - Whether the target can block due to this aura

---

## Integration with Other Systems

### Targeting System
Abilities work with the `TargetingManager` to:
- Validate target selection
- Handle targeting phases
- Execute targeted effects

### Selection System
Abilities integrate with `SelectionManager` for:
- Card selection from deck/discard
- Multi-card selection interfaces
- Selection validation

### Aura System
Abilities coordinate with `AuraManager` to:
- Create persistent effects
- Manage aura duration
- Apply aura effects to valid targets

### Match Integration
Abilities are integrated into the main `Match` class through:
- End of turn ability checking
- Action stack management
- Phase-based activation

## Example Usage

```javascript
// Creating abilities for a card
const factory = new ServerAbilityFactory();
const abilities = factory.createAbilitiesForCard(cardData.abilities, cardId, matchId);

// Executing an ability
const ability = card.abilities[0];
ability.action(currentPlayer, selectedTargets);

// Checking aura effects
const auraAbility = card.getAbilityByType('AURA');
const additionalPower = auraAbility.addPassivePower(targetCard);
```

## Notes

- All abilities inherit from the base `ServerAbility` class
- The factory pattern ensures proper ability type instantiation
- Abilities are designed to be modular and extensible
- Each ability type can have specialized behavior while