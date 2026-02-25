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

    async login(dto:loginDto){
        const user=await this.databaseService.user.findUnique({
            where:{email:dto.email}
        })
        if(!user || !(await bcrypt.compare(dto.email,user.password))){
            throw new NotFoundException('неправильний email або пароль')
        }
       
        const {password,...userWithoutPassword}=user
        const token=await this.generateToken(user)

        return {
            user:userWithoutPassword,
            token:token
        }
    }

    async generateToken(user:any){
        const payload={sub:user.id,email:user.email,role:user.role}

        const secret=this.configService.get<string>("JWT_SECRET")

        const accessToken=await this.jwtService.signAsync(payload,{
            expiresIn:'7d',
            secret:secret
        })
        return {accessToken}
    }

}
