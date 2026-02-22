/**
 * CharacterSnapshot utility
 *
 * Creates deep copies of character data for campaigns
 * This preserves character state even if the player modifies their character sheet
 */

import { CharacterType } from '../characters/model/CharacterModel';

export class CharacterSnapshot {
  /**
   * Create a snapshot of a character
   *
   * @param character - The character document to snapshot
   * @returns A snapshot object with character data and metadata
   */
  static create(character: CharacterType): any {
    // Create deep copy of character data
    const characterData = character.toObject ? character.toObject() : { ...character };

    return {
      characterId: character._id,
      playerId: character.player,
      snapshotDate: new Date(),
      name: character.name,
      // setting: character.setting,
      data: characterData, // Full character sheet data
      // TODO: Customize what gets included in snapshot once schema finalized
      // May want to strip certain fields or add campaign-specific data
    };
  }

  /**
   * Update a snapshot (for re-syncing character data mid-campaign)
   *
   * @param snapshot - The existing snapshot
   * @param character - The updated character data
   * @returns Updated snapshot
   */
  static update(snapshot: any, character: CharacterType): any {
    const characterData = character.toObject ? character.toObject() : { ...character };

    return {
      ...snapshot,
      snapshotDate: new Date(),
      name: character.name,
      data: characterData,
      previousSnapshot: snapshot.data, // Keep history if needed
    };
  }

  /**
   * Compare two snapshots to see what changed
   *
   * @param oldSnapshot - Previous snapshot
   * @param newSnapshot - New snapshot
   * @returns Object describing changes
   */
  static compareSnapshots(oldSnapshot: any, newSnapshot: any): any {
    // TODO: Implement comparison logic once character schema is finalized
    // This could highlight stat changes, inventory differences, etc.
    return {
      changed: oldSnapshot.snapshotDate !== newSnapshot.snapshotDate,
      dateDiff: newSnapshot.snapshotDate - oldSnapshot.snapshotDate,
      // Add field-by-field comparison as needed
    };
  }
}
