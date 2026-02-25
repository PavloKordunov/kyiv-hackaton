import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import {JwtService} from '@nestjs/jwt';
import { Request } from "express";

@Injectable()
export class JwtGuard implements CanActivate{
    constructor(private jwtService:JwtService){}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request=context.switchToHttp().getRequest<Request>()

        const token=request.cookies['user_token'];

        if(!token){
            throw new UnauthorizedException({ message: 'Користувач не авторизований (відсутній токен)' })
        }

        try {
            const payload=await this.jwtService.verifyAsync(token)
            request.user=payload

            return true
        } catch (error) {
            throw new UnauthorizedException({message:'Токен недійсний або прострочений'})
        }
    }
}