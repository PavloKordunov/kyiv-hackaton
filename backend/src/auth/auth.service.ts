import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { loginDto } from './Dto/loginDto';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
    constructor(private readonly jwtService:JwtService,
        private readonly databaseService:DatabaseService,
    ){}

    async login(dto:loginDto){

        const user:any =await this.databaseService.user.findUnique({
            where:{email:dto.email}
        })

        const isCorrectPass = await bcrypt.compare(dto.password, user?.password)

        if(!user ||!isCorrectPass){
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

        const accessToken=await this.jwtService.signAsync(payload)
        return {accessToken}
    }

}
