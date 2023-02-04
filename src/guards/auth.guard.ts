import { CanActivate, ExecutionContext } from '@nestjs/common';

//we use implements so have TypeScript help us guide us through the methods we need to implment
export class AuthGuard implements CanActivate {
  //ExecutionContext is very similar to a request coming up to an HTTP based application
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    //will return truthy value if user exists
    if (request.session.userId) console.log('AuthGuard: session.userId = true');
    else {
      console.log('AuthGuard: session.userId = false');
    }
    return request.session.userId;
  }
}
