// factories/ProfileCreationFactory.ts
 
import { ProfileCreator } from '../interface/ProfileCreator';
import { AdminProfileCreator } from './AdminProfileCreator';

export class ProfileCreationFactory {
  static getProfileCreator(role: string): ProfileCreator | null {
    switch (role) {
      case 'admin':
        return new AdminProfileCreator();
      default:
        return null;
    }
  }
}
