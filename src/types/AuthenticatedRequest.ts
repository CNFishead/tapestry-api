import { Request } from 'express';
import { AuthType } from '../modules/auth/model/Auth';

/**
 * @description - This interface will be used to add the user object to the request object.
 *
 * @author Austin Howard
 * @since 1.0
 * @version 1.0.4
 * @lastModified - 2023-06-11T16:21:30.000-05:00
 */
export interface AuthenticatedRequest extends Request {
  // user should be of type AuthType, with a token property
  user: AuthType & {
    token?: string;
    roles?: string[];
  };
  params: {
    [x: string]: any;
    id?: string;
    slug?: string;
  };
}
