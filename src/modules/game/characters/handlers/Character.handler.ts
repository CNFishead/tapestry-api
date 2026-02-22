import mongoose from 'mongoose';
import { ErrorUtil } from '../../../../middleware/ErrorUtil';
import { CRUDHandler, PaginationOptions } from '../../../../utils/baseCRUD';
import CharacterModel, { CharacterType } from '../model/CharacterModel';
import { eventBus } from '../../../../lib/eventBus';

export class CharacterHandler extends CRUDHandler<CharacterType> {
  constructor() {
    super(CharacterModel);
  }

  protected async beforeCreate(data: any): Promise<void> {
    // Validate that player reference exists
    if (!data.player) {
      throw new ErrorUtil('Player reference is required', 400);
    }

    // TODO: Add validation for character data structure once schema is finalized
    // TODO: Validate setting if provided (check against SettingsRegistry)
  }

  protected async afterCreate(doc: CharacterType): Promise<void> {
    try {
      // Emit event for player stats update
      eventBus.publish('game.character.created', {
        characterId: doc._id,
        playerId: doc.player,
      });
    } catch (error) {
      console.error('Failed to publish character creation event:', error);
      // Don't throw - character was created successfully
    }
  }

  protected async beforeUpdate(id: string, data: any): Promise<void> {
    // Prevent changing the player owner
    if (data.player) {
      throw new ErrorUtil('Cannot change character owner', 400);
    }

    // TODO: Add validation for character data structure once schema is finalized
  }

  /**
   * Add a character to a campaign
   * Verifies the character's player is a member of the campaign
   */
  async joinCampaign(characterId: string, campaignId: string): Promise<CharacterType> {
    try {
      const character = await this.Schema.findById(characterId);
      if (!character) {
        throw new ErrorUtil('Character not found', 404);
      }

      // Import CampaignModel to verify membership
      const CampaignModel = (await import('../../campaigns/model/CampaignModel')).default;
      const campaign = await CampaignModel.findById(campaignId);
      if (!campaign) {
        throw new ErrorUtil('Campaign not found', 404);
      }

      // Verify character's player is a member of the campaign
      const isMember = campaign.members.some((member) => member.player.toString() === character.player.toString());
      if (!isMember) {
        throw new ErrorUtil('Character owner must be a member of the campaign', 403);
      }

      // Update character's campaign reference
      character.campaign = campaign._id as any;
      await character.save();

      // Emit event for tracking
      eventBus.publish('game.character.joined_campaign', {
        characterId: character._id,
        campaignId: campaign._id,
        playerId: character.player,
      });

      return character;
    } catch (error) {
      if (error instanceof ErrorUtil) throw error;
      throw new ErrorUtil('Failed to add character to campaign', 500);
    }
  }

  /**
   * Remove a character from a campaign
   */
  async leaveCampaign(characterId: string): Promise<CharacterType> {
    try {
      const character = await this.Schema.findById(characterId);
      if (!character) {
        throw new ErrorUtil('Character not found', 404);
      }

      const previousCampaign = character.campaign;
      character.campaign = null;
      await character.save();

      // Emit event for tracking
      if (previousCampaign) {
        eventBus.publish('game.character.left_campaign', {
          characterId: character._id,
          campaignId: previousCampaign,
          playerId: character.player,
        });
      }

      return character;
    } catch (error) {
      if (error instanceof ErrorUtil) throw error;
      throw new ErrorUtil('Failed to remove character from campaign', 500);
    }
  }

  /**
   * Fork a character (create a copy)
   * Sets forkedFrom reference to original character
   */
  async forkCharacter(characterId: string): Promise<CharacterType> {
    try {
      const originalCharacter = await this.Schema.findById(characterId);
      if (!originalCharacter) {
        throw new ErrorUtil('Character not found', 404);
      }

      // Create a plain object copy
      const characterData: any = originalCharacter.toObject();

      // Remove fields that shouldn't be copied
      const { _id, createdAt, updatedAt, __v, ...dataToKeep } = characterData;

      // Set fork reference and clear campaign (forked characters start without a campaign)
      const forkedData = {
        ...dataToKeep,
        forkedFrom: originalCharacter._id as any,
        campaign: null,
        name: `${originalCharacter.name} (Copy)`,
      };

      // Create the new character
      const forkedCharacter = await this.Schema.create(forkedData);

      // Emit event for tracking
      eventBus.publish('game.character.forked', {
        originalId: originalCharacter._id,
        forkedId: forkedCharacter._id,
        playerId: forkedCharacter.player,
      });

      return forkedCharacter;
    } catch (error) {
      if (error instanceof ErrorUtil) throw error;
      throw new ErrorUtil('Failed to fork character', 500);
    }
  }

  async fetchAll(options: PaginationOptions): Promise<{ entries: CharacterType[]; metadata: any[] }[]> {
    try {
      return await this.Schema.aggregate([
        {
          $match: {
            $and: [...options.filters],
            ...(options.query.length > 0 && { $or: options.query }),
          },
        },
        {
          $sort: options.sort,
        },
        {
          $facet: {
            metadata: [{ $count: 'totalCount' }, { $addFields: { page: options.page, limit: options.limit } }],
            entries: [
              { $skip: (options.page - 1) * options.limit },
              { $limit: options.limit },
              {
                $lookup: {
                  from: 'players',
                  localField: 'player',
                  foreignField: '_id',
                  as: 'playerProfile',
                },
              },
              {
                $unwind: {
                  path: '$playerProfile',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
          },
        },
      ]);
    } catch (error) {
      throw new ErrorUtil('Failed to fetch characters', 500);
    }
  }

  async fetchSingle(id: string): Promise<CharacterType | null> {
    try {
      const character = await this.Schema.findById(id).populate('player', 'displayName avatar');

      if (!character) {
        throw new ErrorUtil('Character not found', 404);
      }

      return character;
    } catch (error) {
      if (error instanceof ErrorUtil) throw error;
      throw new ErrorUtil('Failed to fetch character', 500);
    }
  }
}
