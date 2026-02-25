import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request as RequestType } from "express";
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(private configService:ConfigService){

        super({
            jwtFromRequest:ExtractJwt.fromExtractors([
                JwtStrategy.extractJwt,
                ExtractJwt.fromAuthHeaderAsBearerToken()
            ]),
            ignoreExpiration:false,
            secretOrKey:configService.get<string>('JWT_SECRET') || 'secret'
        })
    }

    private static extractJwt(req:RequestType): string | null{
      if(
        req.cookies && 'user_token' in req.cookies && 
        req.cookies.user_token.length>0
      ) {
        return req.cookies.user_token
      }
      return null
    }
    async validate(payload:any){
        return {id:payload.sub,email:payload.email,role:payload.role}
    }
}