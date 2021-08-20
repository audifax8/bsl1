import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jwt-simple';
import * as moment from 'moment';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const SUPER_SECRET_KEY = 'SUPER_SECRET_KEY';

    try {
      if (!request.headers.authorization) {
        //response.status(HttpStatus.FORBIDDEN).json({ error: 'please login' });
        return false;
      }

      const token = request.headers.authorization.split(' ')[1];
      const payload = jwt.decode(token, SUPER_SECRET_KEY);

      console.log({
        payload,
        token,
      });

      if (payload.exp < moment().unix()) {
        return false;
      }
    } catch (ex) {
      Logger.error(ex.message);
      return false;
    }
    return true;
  }
}
