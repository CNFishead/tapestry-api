/**
 * HP (Health Points) calculation and adjustment rules
 *
 * Max HP Formula: 12 + Might [Strength]
 * - Base HP is 12
 * - Modified by the character's strength sub-aspect
 */

import { CharacterRuleData, BASE_HP } from '../types/RuleTypes';

/**
 * Calculate maximum HP based on character's strength
 *
 * @param character - Character data containing aspects
 * @returns Calculated max HP value
 */
export function calculateMaxHP(character: CharacterRuleData): number {
  const strength = character.aspects?.might?.strength ?? 0;
  return BASE_HP + strength;
}

/**
 * Adjust current HP if it exceeds the new maximum
 *
 * This ensures that when maxHP decreases (e.g., strength loss, level down),
 * the current HP is clamped to the new maximum, but only if it was higher.
 *
 * Examples:
 * - maxHP 12→8, currentHP 9 → currentHP becomes 8
 * - maxHP 12→10, currentHP 8 → currentHP stays 8
 *
 * @param character - Character data with hp resource track
 * @modifies character.hp.current if it exceeds character.hp.max
 */
export function adjustCurrentHP(character: CharacterRuleData): void {
  if (!character.hp) {
    // Initialize hp if missing
    character.hp = {
      current: BASE_HP,
      max: BASE_HP,
      temp: 0,
    };
    return;
  }

  // Clamp current to max if it exceeds
  if (character.hp.current > character.hp.max) {
    character.hp.current = character.hp.max;
  }

  // Ensure non-negative
  if (character.hp.current < 0) {
    character.hp.current = 0;
  }
}

/**
 * Apply all HP rules to a character
 *
 * @param character - Character data to apply rules to
 * @modifies character.hp.max and character.hp.current
 */
export function applyHPRules(character: CharacterRuleData): void {
  // Calculate and set max HP
  character.hp.max = calculateMaxHP(character);

  // Adjust current HP if needed
  adjustCurrentHP(character);
}
