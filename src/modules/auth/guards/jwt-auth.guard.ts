import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log('=== DEBUG: JwtAuthGuard.canActivate() called ===');
    // console.log('debug: context type:', context.getType());
    // console.log(context);
    return super.canActivate(context);
  }
}
