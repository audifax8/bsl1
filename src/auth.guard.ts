import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import * as jwt from 'jwt-simple';

const SEPER_SECRE_KEY = 'clave super secreta';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (!request.headers.bearer) {
      return false;
    }

    const token = request.headers.bearer.split(' ')[1];

    try {
      const payload = jwt.decode(token, SEPER_SECRE_KEY);
      console.log(payload);
    } catch (ex) {
      Logger.error(ex.message);
      return false;
    }

    /*console.log({
      request,
      response,
    });*/
    return true;
  }
}
