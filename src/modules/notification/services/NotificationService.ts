// modules/notification/NotificationService.ts
import { EmailService } from '../email/EmailService';
import NAuthService from './NAuthService';
import NBillingEventsService from './NBillingEvents.service';
 
import NSupportService from './NSupportService'; 
import NUserService from './NUserService';
 
export default class NotificationService {
  constructor(
    private readonly nauthService: NAuthService = new NAuthService(),
    private readonly nticketService: NSupportService = new NSupportService(),
    private readonly nuserService: NUserService = new NUserService(),
    private readonly nbillingEventService: NBillingEventsService = new NBillingEventsService()
  ) {}
  public init() {
    EmailService.init('ethereal');
    this.nauthService.init();
    this.nticketService.init();
    this.nuserService.init();
    this.nbillingEventService.init();
  }
}
