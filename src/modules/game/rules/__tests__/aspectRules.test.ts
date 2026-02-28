/**
 * Tests for aspect range validation
 */

import { validateAspectRanges, getAspectRangeDescription } from '../attributes/aspectRules';
import { CharacterRuleData, ASPECT_MIN, ASPECT_MAX } from '../types/RuleTypes';

describe('Aspect Rules', () => {
  describe('validateAspectRanges', () => {
    const createValidCharacter = (): CharacterRuleData => ({
      aspects: {
        might: { strength: 2, presence: 0 },
        finesse: { agility: 1, charm: -1 },
        wit: { instinct: 3, knowledge: 4 },
        resolve: { willpower: -2, empathy: 0 },
      },
      hp: { current: 12, max: 12 },
      threads: { current: 5, max: 5 },
    });

    it('should pass validation for aspects within -2 to +4 range', () => {
      const character = createValidCharacter();

      expect(() => validateAspectRanges(character)).not.toThrow();
    });

    it('should throw error when aspect exceeds maximum (4)', () => {
      const character = createValidCharacter();
      character.aspects.might.strength = 5;

      expect(() => validateAspectRanges(character)).toThrow(/Aspect validation failed.*might\.strength value 5 is outside the legal range/);
    });

    it('should throw error when aspect is below minimum (-2)', () => {
      const character = createValidCharacter();
      character.aspects.finesse.agility = -3;

      expect(() => validateAspectRanges(character)).toThrow(/Aspect validation failed.*finesse\.agility value -3 is outside the legal range/);
    });

    it('should accept boundary values (-2 and +4)', () => {
      const character = createValidCharacter();
      character.aspects.might.strength = ASPECT_MAX;
      character.aspects.might.presence = ASPECT_MIN;

      expect(() => validateAspectRanges(character)).not.toThrow();
    });

    it('should report multiple validation errors', () => {
      const character = createValidCharacter();
      character.aspects.might.strength = 6;
      character.aspects.finesse.agility = -5;
      character.aspects.wit.knowledge = 10;

      expect(() => validateAspectRanges(character)).toThrow(/Aspect validation failed/);

      try {
        validateAspectRanges(character);
      } catch (error) {
        const message = (error as Error).message;
        expect(message).toContain('might.strength value 6');
        expect(message).toContain('finesse.agility value -5');
        expect(message).toContain('wit.knowledge value 10');
      }
    });

    it('should throw error when aspect family is missing', () => {
      const character: any = {
        aspects: {
          might: { strength: 2, presence: 0 },
          finesse: { agility: 1, charm: -1 },
          wit: { instinct: 3, knowledge: 4 },
          // resolve missing
        },
        hp: { current: 12, max: 12 },
        threads: { current: 5, max: 5 },
      };

      expect(() => validateAspectRanges(character)).toThrow(/Aspect family 'resolve' is missing/);
    });

    it('should throw error when sub-aspect is missing', () => {
      const character: any = {
        aspects: {
          might: { strength: 2 }, // presence missing
          finesse: { agility: 1, charm: -1 },
          wit: { instinct: 3, knowledge: 4 },
          resolve: { willpower: -2, empathy: 0 },
        },
        hp: { current: 12, max: 12 },
        threads: { current: 5, max: 5 },
      };

      expect(() => validateAspectRanges(character)).toThrow(/Sub-aspect 'might\.presence' is missing or undefined/);
    });

    it('should throw error when aspects object is missing', () => {
      const character: any = {
        hp: { current: 12, max: 12 },
        threads: { current: 5, max: 5 },
      };

      expect(() => validateAspectRanges(character)).toThrow(/Character aspects are missing or undefined/);
    });

    it('should validate all eight sub-aspects', () => {
      const character = createValidCharacter();

      // Set each sub-aspect to an invalid value and verify it's checked
      const subAspects = [
        { family: 'might', name: 'strength' },
        { family: 'might', name: 'presence' },
        { family: 'finesse', name: 'agility' },
        { family: 'finesse', name: 'charm' },
        { family: 'wit', name: 'instinct' },
        { family: 'wit', name: 'knowledge' },
        { family: 'resolve', name: 'willpower' },
        { family: 'resolve', name: 'empathy' },
      ];

      subAspects.forEach(({ family, name }) => {
        const testCharacter = createValidCharacter();
        (testCharacter.aspects as any)[family][name] = 10; // Invalid value

        expect(() => validateAspectRanges(testCharacter)).toThrow(new RegExp(`${family}\\.${name} value 10 is outside the legal range`));
      });
    });
  });

  describe('getAspectRangeDescription', () => {
    it('should return correct range description', () => {
      const description = getAspectRangeDescription();
      expect(description).toContain('-2');
      expect(description).toContain('4');
    });
  });
});
