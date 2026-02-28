import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./role.decorator";


@Injectable()
export class RoleGuard implements CanActivate{
    constructor(private reflector:Reflector){}
     
    canActivate(context: ExecutionContext): boolean {
        try {
            const requiredRoles=this.reflector.getAllAndOverride<string[]>(ROLES_KEY,[
                context.getHandler(),
                context.getClass(),
            ])
            if(!requiredRoles){
                return true
            }
            const request=context.switchToHttp().getRequest()
            const user=request.user
            if(!user){
                return false;
            }
            return requiredRoles.includes(user.role)

        } catch (error) {
            throw new UnauthorizedException({message:'not access'})
        }
    }
    
}