import { Model } from 'mongoose';
import AdminModel from '../modules/profiles/admin/model/AdminModel';
import PlayerModel from '../modules/profiles/player/model/PlayerModel';
import User from '../modules/auth/model/Auth';
import Token from '../modules/auth/model/TokenSchema';
import BillingAccount from '../modules/auth/model/BillingAccount';
import Receipt from '../modules/payment/models/Receipt';
import PlanSchema from '../modules/auth/model/PlanSchema';
import CharacterModel from '../modules/game/characters/model/CharacterModel';
import CampaignModel from '../modules/game/campaigns/model/CampaignModel';

export type ModelKey = 'admin' | 'player' | 'user' | 'token' | 'billing' | 'receipt' | 'plan' | 'character' | 'campaign';

export const ModelMap: Record<ModelKey, any> = {
  admin: AdminModel,
  player: PlayerModel,
  user: User,
  token: Token,
  billing: BillingAccount,
  receipt: Receipt,
  plan: PlanSchema,
  character: CharacterModel,
  campaign: CampaignModel,
};
