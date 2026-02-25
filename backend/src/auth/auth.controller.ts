import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './Dto/loginDto';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService:AuthService){}

    @Post('login')
    async login(@Body() dto:loginDto,
@Res({passthrough:true}) res){
    const {user,token}=await this.authService.login(dto)
    res.cookie('user_token',token.accessToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:'lax',
        expires:new Date(Date.now()+3600000)
    })
        return {message:'successful login',user}
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('logout')
    async logout(@Res({passthrough:true}) res:Response){
        res.cookie('user_token','',{expires:new Date(0)})
        return await this.authService.logout()
    }
}
