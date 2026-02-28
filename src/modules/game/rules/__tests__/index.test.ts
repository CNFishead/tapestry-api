/**
 * Integration tests for the complete rule system
 */

import { applyCharacterRules } from '../index';
import { CharacterRuleData } from '../types/RuleTypes';

describe('Game Rules Integration', () => {
  const createTestCharacter = (): CharacterRuleData => ({
    aspects: {
      might: { strength: 3, presence: 1 },
      finesse: { agility: 2, charm: 0 },
      wit: { instinct: -1, knowledge: 2 },
      resolve: { willpower: 1, empathy: 3 },
    },
    hp: { current: 15, max: 15 },
    threads: { current: 4, max: 5 },
  });

  describe('applyCharacterRules', () => {
    it('should apply all rules successfully to a valid character', () => {
      const character = createTestCharacter();

      const result = applyCharacterRules(character);

      // HP should be recalculated (12 + 3 = 15)
      expect(result.hp.max).toBe(15);
      expect(result.hp.current).toBe(15);

      // Threads should remain valid
      expect(result.threads.max).toBe(5);
      expect(result.threads.current).toBe(4);

      // Aspects should pass validation
      expect(result.aspects.might.strength).toBe(3);
    });

    it('should reject character with out-of-range aspect', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = 10; // Too high

      expect(() => applyCharacterRules(character)).toThrow(/Aspect validation failed/);
    });

    it('should recalculate HP when strength changes', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = -1;

      const result = applyCharacterRules(character);

      expect(result.hp.max).toBe(11); // 12 + (-1)
    });

    it('should clamp current HP when max decreases', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = 0; // Strength drops
      character.hp.current = 15; // Current is higher than new max will be

      const result = applyCharacterRules(character);

      expect(result.hp.max).toBe(12); // 12 + 0
      expect(result.hp.current).toBe(12); // Clamped down
    });

    it('should preserve current HP when max increases', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = 4;
      character.hp.current = 8; // Well below new max

      const result = applyCharacterRules(character);

      expect(result.hp.max).toBe(16); // 12 + 4
      expect(result.hp.current).toBe(8); // Unchanged
    });

    it('should enforce threads maximum of 5', () => {
      const character = createTestCharacter();
      character.threads.max = 10;
      character.threads.current = 8;

      const result = applyCharacterRules(character);

      expect(result.threads.max).toBe(5);
      expect(result.threads.current).toBe(5);
    });

    it('should handle character at minimum aspect values', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = -2;
      character.aspects.might.presence = -2;
      character.aspects.finesse.agility = -2;
      character.aspects.finesse.charm = -2;
      character.aspects.wit.instinct = -2;
      character.aspects.wit.knowledge = -2;
      character.aspects.resolve.willpower = -2;
      character.aspects.resolve.empathy = -2;

      const result = applyCharacterRules(character);

      expect(result.hp.max).toBe(10); // 12 + (-2)
      expect(() => applyCharacterRules(character)).not.toThrow();
    });

    it('should handle character at maximum aspect values', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = 4;
      character.aspects.might.presence = 4;
      character.aspects.finesse.agility = 4;
      character.aspects.finesse.charm = 4;
      character.aspects.wit.instinct = 4;
      character.aspects.wit.knowledge = 4;
      character.aspects.resolve.willpower = 4;
      character.aspects.resolve.empathy = 4;

      const result = applyCharacterRules(character);

      expect(result.hp.max).toBe(16); // 12 + 4
      expect(() => applyCharacterRules(character)).not.toThrow();
    });

    it('should apply multiple rules in correct order', () => {
      const character = createTestCharacter();
      character.aspects.wit.knowledge = 5; // Invalid - should fail validation first
      character.threads.max = 20; // Would be clamped if validation passed

      // Should fail on aspect validation before applying other rules
      expect(() => applyCharacterRules(character)).toThrow(/Aspect validation failed/);
    });

    it('should handle edge case: strength change with exact current HP match', () => {
      const character = createTestCharacter();
      character.aspects.might.strength = 3;
      character.hp.current = 15;
      character.hp.max = 15;

      // Strength stays the same
      const result = applyCharacterRules(character);

      expect(result.hp.max).toBe(15);
      expect(result.hp.current).toBe(15);
    });

    it('should return the modified character object', () => {
      const character = createTestCharacter();

      const result = applyCharacterRules(character);

      expect(result).toBe(character); // Should be same object, modified in place
      expect(typeof result).toBe('object');
      expect(result.aspects).toBeDefined();
    });
  });
});
