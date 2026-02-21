import mongoose, { Document } from 'mongoose';
import { ErrorUtil } from '../../../../middleware/ErrorUtil';
import { CRUDHandler, PaginationOptions } from '../../../../utils/baseCRUD';
import PlayerModel, { PlayerType } from '../model/PlayerModel';
import { RolesConfig } from '../../../../utils/RolesConfig';

export class PlayerProfileHandler extends CRUDHandler<PlayerType> {
  constructor() {
    super(PlayerModel);
  }

  protected async beforeCreate(data: any): Promise<void> {
    // Validate roles before creation
    const rolesToAssign = data.roles || ['player'];
    const validPlayerRoles = ['player', 'storyweaver'];

    const allValidRoles = rolesToAssign.every((role: string) => validPlayerRoles.includes(role));

    if (!allValidRoles) {
      throw new ErrorUtil('Invalid role provided. Must be "player" or "storyweaver"', 400);
    }

    // Ensure 'player' is always included if storyweaver is requested
    if (rolesToAssign.includes('storyweaver') && !rolesToAssign.includes('player')) {
      data.roles = ['player', 'storyweaver'];
    }
  }

  protected async afterCreate(doc: PlayerType): Promise<void> {
    try {
      // Find the user by id and update the profileRefs
      const user = await mongoose.model('User').findById(doc.user);
      if (!user) {
        // Delete the player profile since user wasn't found
        await this.Schema.findByIdAndDelete(doc._id);
        throw new ErrorUtil('User not found', 404);
      }

      // Update the profileRefs map with new player profile
      user.profileRefs.player = doc._id;

      try {
        await user.save();
      } catch (userSaveError) {
        // Delete the player profile if saving user fails
        await PlayerModel.findByIdAndDelete(doc._id);
        throw new ErrorUtil('Failed to update user profile references', 500);
      }

      // if permissions were already provided by the frontend in the create step, we don't want to override them
      if (doc.permissions && doc.permissions.length > 0) {
        return; // Skip permission assignment if already provided
      }

      // Assign granulated permissions based on roles
      try {
        const permissions = RolesConfig.getDefaultPermissionsForRoles(doc.roles);
        doc.permissions = permissions;
        await doc.save();
      } catch (permissionError) {
        // Rollback: remove player reference from user and delete player profile
        user.profileRefs.player = undefined;
        await user.save();
        await PlayerModel.findByIdAndDelete(doc._id);
        throw new ErrorUtil('Failed to assign permissions to player profile', 500);
      }
    } catch (error) {
      if (error instanceof ErrorUtil) {
        throw error;
      }
      // Cleanup: attempt to delete player profile if it exists
      try {
        await PlayerModel.findByIdAndDelete(doc._id);
      } catch (deleteError) {
        // Log the cleanup failure but don't override the original error
        console.error('Failed to cleanup player profile during error recovery:', deleteError);
      }
      throw new ErrorUtil('Failed to create player profile', 500);
    }
  }

  async fetchAll(options: PaginationOptions): Promise<{ entries: PlayerType[]; metadata: any[] }[]> {
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
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        email: 1,
                        fullName: 1,
                        profileImageUrl: 1,
                      },
                    },
                  ],
                },
              },
              {
                $unwind: {
                  path: '$user',
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                // Add additional computed fields
                $addFields: {
                  permissionsCount: { $size: '$permissions' },
                  isStoryweaver: { $in: ['storyweaver', '$roles'] },
                },
              },
              {
                $project: {
                  _id: 1,
                  user: 1,
                  roles: 1,
                  displayName: 1,
                  avatar: 1,
                  bio: 1,
                  timezone: 1,
                  permissionsCount: 1,
                  isStoryweaver: 1,
                  storyweaverStats: 1,
                  createdAt: 1,
                  updatedAt: 1,
                },
              },
            ],
          },
        },
      ]);
    } catch (error) {
      throw new ErrorUtil('Failed to fetch player profiles', 500);
    }
  }

  protected async afterDelete(doc: PlayerType | null): Promise<void> {
    // Remove the player profile reference from the user
    if (doc) {
      const user = await mongoose.model('User').findById(doc.user);
      if (user) {
        user.profileRefs.player = undefined; // Remove player profile reference
        await user.save();
      }
    }
  }
}
