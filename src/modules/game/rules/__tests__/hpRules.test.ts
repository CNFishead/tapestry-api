/**
 * Tests for HP calculation and adjustment rules
 */

import { calculateMaxHP, adjustCurrentHP, applyHPRules } from '../resources/hpRules';
import { CharacterRuleData, BASE_HP } from '../types/RuleTypes';

describe('HP Rules', () => {
  describe('calculateMaxHP', () => {
    it('should calculate maxHP as 12 + strength', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 5, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 10, max: 10 },
        threads: { current: 5, max: 5 },
      };

      expect(calculateMaxHP(character)).toBe(17); // 12 + 5
    });

    it('should handle negative strength values', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: -2, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 10, max: 10 },
        threads: { current: 5, max: 5 },
      };

      expect(calculateMaxHP(character)).toBe(10); // 12 + (-2)
    });

    it('should handle zero strength', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 0, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 12, max: 12 },
        threads: { current: 5, max: 5 },
      };

      expect(calculateMaxHP(character)).toBe(BASE_HP); // 12 + 0
    });

    it('should handle missing strength (default to 0)', () => {
      const character: any = {
        aspects: {
          might: { presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 12, max: 12 },
        threads: { current: 5, max: 5 },
      };

      expect(calculateMaxHP(character)).toBe(BASE_HP);
    });
  });

  describe('adjustCurrentHP', () => {
    it('should clamp current HP when it exceeds max', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 0, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 16, max: 14 },
        threads: { current: 5, max: 5 },
      };

      adjustCurrentHP(character);
      expect(character.hp.current).toBe(14);
    });

    it('should not change current HP when below max', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 0, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 8, max: 10 },
        threads: { current: 5, max: 5 },
      };

      adjustCurrentHP(character);
      expect(character.hp.current).toBe(8);
    });

    it('should handle negative current HP (set to 0)', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 0, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: -5, max: 10 },
        threads: { current: 5, max: 5 },
      };

      adjustCurrentHP(character);
      expect(character.hp.current).toBe(0);
    });

    it('should initialize missing hp object', () => {
      const character: any = {
        aspects: {
          might: { strength: 0, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        threads: { current: 5, max: 5 },
      };

      adjustCurrentHP(character);
      expect(character.hp).toBeDefined();
      expect(character.hp.max).toBe(BASE_HP);
    });
  });

  describe('applyHPRules', () => {
    it('should recalculate maxHP and adjust current when strength changes', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 2, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 16, max: 17 },
        threads: { current: 5, max: 5 },
      };

      applyHPRules(character);

      expect(character.hp.max).toBe(14); // 12 + 2
      expect(character.hp.current).toBe(14); // Clamped from 16
    });

    it('should preserve current HP when max increases', () => {
      const character: CharacterRuleData = {
        aspects: {
          might: { strength: 8, presence: 0 },
          finesse: { agility: 0, charm: 0 },
          wit: { instinct: 0, knowledge: 0 },
          resolve: { willpower: 0, empathy: 0 },
        },
        hp: { current: 8, max: 12 },
        threads: { current: 5, max: 5 },
      };

      applyHPRules(character);

      expect(character.hp.max).toBe(20); // 12 + 8
      expect(character.hp.current).toBe(8); // Unchanged
    });
  });
});
