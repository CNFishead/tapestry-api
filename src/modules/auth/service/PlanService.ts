import { PlanHandler } from '../handlers/PlanHandler';
import { CRUDService } from '../../../utils/baseCRUD';

export default class PlanService extends CRUDService {
  constructor() {
    super(PlanHandler);
    this.requiresAuth = {
      create: true,
      getResource: true, 
      removeResource: true,
      updateResource: true,
    };
    this.queryKeys = ['name', 'description', 'price'];
  }
}
