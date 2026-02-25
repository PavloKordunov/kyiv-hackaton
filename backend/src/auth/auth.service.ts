import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './Dto/loginDto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService:JwtService,
        private readonly databaseService:DatabaseService,
        private readonly configService:ConfigService
    ){}

    async validate(dto:loginDto){
        const user=await this.databaseService.user.findUnique({
            where:{email:dto.email
            }
        })
        if(!user){
            throw new NotFoundException('user not found')
        }
        const isPasswordCompare=await bcrypt.compare(dto.password,user.password)

        if(user && isPasswordCompare){
            const {password,...result}=user
            return result
        }
        return null;
    }

    async login(dto:loginDto){
        const user=await this.validate(dto)
        if(!user){
            throw  new UnauthorizedException()
        }
        const token=await this.generateToken(user.id,user.email)

        return {
            user,
            token:token
        }
    }

    async generateToken(id:string,email:string){
        const payload={sub:id,email}

        const secret=this.configService.get<string>("JWT_SECRET")

        const accessToken=await this.jwtService.signAsync(payload,{
            expiresIn:'7d',
            secret:secret
        })
        return {accessToken}
    }

    async logout(){
         return {message:'successful loguot'}
    }
}
