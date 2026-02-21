// services/PlayerService.ts
import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../types/AuthenticatedRequest';
import { CRUDService } from '../../../../utils/baseCRUD';
import { PlayerProfileHandler } from '../handlers/PlayerProfile.handler';
import PlayerModel from '../model/PlayerModel';
import { RolesConfig } from '../../../../utils/RolesConfig';
import User from '../../../auth/model/Auth';

type PlayerProfileInput = {
  user: string;
  roles?: ('player' | 'storyweaver')[];
  permissions?: string[];
  displayName?: string;
  avatar?: string;
  bio?: string;
  timezone?: string;
};

export default class PlayerService extends CRUDService {
  constructor() {
    super(PlayerProfileHandler);
    this.queryKeys = ['roles', 'displayName'];
    this.requiresAuth = {
      create: true,
      getResources: true,
      getResource: true,
      updateResource: true,
      removeResource: true,
    };
  }

  /**
   * Static method to create a player profile
   * Used by the ProfileCreationFactory during registration
   */
  static async createProfile({ user, roles = ['player'], permissions = [], displayName, avatar, bio, timezone }: PlayerProfileInput) {
    const profile = new PlayerModel({
      user,
      roles,
      permissions,
      displayName,
      avatar,
      bio,
      timezone,
    });

    return await profile.save();
  }

  /**
   * Promote a player to include storyweaver role
   * Adds storyweaver role and appropriate permissions
   */
  static async addStoryweaverRole(profileId: string) {
    const profile = await PlayerModel.findById(profileId);

    if (!profile) {
      throw new Error('Player profile not found');
    }

    // Check if already has storyweaver role
    if (profile.roles.includes('storyweaver')) {
      return profile;
    }

    // Add storyweaver role
    profile.roles.push('storyweaver');

    // Add storyweaver permissions
    const storyweaverPermissions = RolesConfig.getDefaultPermissionsForRole('storyweaver');
    const newPermissions = storyweaverPermissions.filter((perm) => !profile.permissions.includes(perm));
    profile.permissions.push(...newPermissions);

    // Initialize storyweaver stats if not present
    if (!profile.storyweaverStats) {
      profile.storyweaverStats = {
        gamesRun: 0,
        activeCampaigns: 0,
        totalPlayers: 0,
      };
    }

    await profile.save();
    return profile;
  }

  /**
   * Get all storyweavers (for LFG, matchmaking, etc.)
   */
  static async getStoryweavers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [profiles, totalCount] = await Promise.all([
      PlayerModel.find({ roles: 'storyweaver' }).populate('user', 'email fullName profileImageUrl').skip(skip).limit(limit).sort({ 'storyweaverStats.gamesRun': -1 }),
      PlayerModel.countDocuments({ roles: 'storyweaver' }),
    ]);

    return {
      profiles,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
