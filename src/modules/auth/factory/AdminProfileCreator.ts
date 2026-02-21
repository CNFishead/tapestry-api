// services/profiles/AdminProfileCreator.ts 
import AdminService from "../../profiles/admin/service/AdminService";
import { ProfileCreator } from "../interface/ProfileCreator";

export class AdminProfileCreator implements ProfileCreator {
  async createProfile(userId: string, profileData: any): Promise<{ profileId: string }>  {
    const adminProfile = await AdminService.createProfile({
      user: userId,
      role: 'developer',
      permissions: ['*'],
    });
    return { profileId: adminProfile._id.toString() };
  }
}