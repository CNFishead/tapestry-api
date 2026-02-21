// factories/ProfileCreationFactory.ts

import { ProfileCreator } from '../interface/ProfileCreator';
import { AdminProfileCreator } from './AdminProfileCreator';
import { PlayerProfileCreator } from './PlayerProfileCreator';

export class ProfileCreationFactory {
  static getProfileCreator(role: string): ProfileCreator | null {
    switch (role) {
      case 'admin':
        return new AdminProfileCreator();
      case 'player':
      case 'storyweaver':
        // Both player and storyweaver use the same profile creator
        // The creator handles role differentiation internally
        return new PlayerProfileCreator();
      default:
        return null;
    }
  }
}
