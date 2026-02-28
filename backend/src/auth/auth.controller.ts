import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto } from './Dto/loginDto';
import { Response } from 'express';
import { JwtGuard } from './jwtGuard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: loginDto, @Res({ passthrough: true }) res: Response) {
      const result = await this.authService.login(dto);
      res.cookie('token', result.token.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: 'none',
          maxAge: 24 * 60 * 60 * 1000,
      });
      
      return { 
          message: 'logged', 
          token: result.token.accessToken 
      }; 
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('user_token', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(0),
    });

    return { message: 'користувач успішно вийшов' };
  }
}
