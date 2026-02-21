import { Request } from 'express';
import { AuthenticatedRequest } from '../../../types/AuthenticatedRequest';
import User from '../../auth/model/Auth';
import { Model, ObjectId } from 'mongoose';
import Support from '../models/Support';
import SupportGroup from '../models/SupportGroups';
import { ModelMap } from '../../../utils/ModelMap';

export class AgentHandler {
  // instantiate the model map
  private modelMap: Record<string, Model<any>>;
  constructor() {
    this.modelMap = ModelMap;
  }
  async fetchAgents(ticketId: string) {
    // Find the ticket by ID
    const ticket = await Support.findById(ticketId);
    if (!ticket) {
      const error: any = new Error('Ticket not found');
      error.status = 404;
      throw error;
    }
    // Find the support groups the ticket belongs to
    const groupIds = ticket.groups.map((group: any) => group._id || group); // builds an array of group id's from the ticket.groups array, handling both populated and unpopulated cases
    const groups = await SupportGroup.find({ _id: { $in: groupIds } }); // finds all support groups that match the groupIds array
    if (groups.length === 0) {
      const error: any = new Error('No associated support groups found');
      error.status = 404;
      throw error;
    }

    // Inflate all agents from the support groups
    const agentIds = groups.reduce<ObjectId[]>((acc, group) => {
      if (group.agents && Array.isArray(group.agents)) {
        acc.push(...(group.agents as unknown as ObjectId[]));
      }
      return acc;
    }, []);

    // Remove duplicate agent IDs
    const uniqueAgentIds = [...new Set(agentIds)];

    // Fetch detailed agent information, populate user, and only select necessary fields
    const uniqueAgents = await this.modelMap['admin']
      .find({ _id: { $in: uniqueAgentIds } })
      .populate('user', 'fullName email profileImageUrl')
      .select('user _id');

    return { agents: uniqueAgents };
  }
}
