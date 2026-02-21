import { Model } from 'mongoose';
import AdminModel from '../modules/profiles/admin/model/AdminModel';
import User from '../modules/auth/model/Auth';
import Token from '../modules/auth/model/TokenSchema';
import BillingAccount from '../modules/auth/model/BillingAccount';
import Receipt from '../modules/payment/models/Receipt';
import PlanSchema from '../modules/auth/model/PlanSchema';

export type ModelKey = 'admin' | 'user' | 'token' | 'billing' | 'receipt' | 'plan';

export const ModelMap: Record<ModelKey, any> = {
  admin: AdminModel,
  user: User,
  token: Token,
  billing: BillingAccount,
  receipt: Receipt,
  plan: PlanSchema,
};
