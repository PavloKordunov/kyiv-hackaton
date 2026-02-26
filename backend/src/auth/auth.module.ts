import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './jwtGuard';

@Module({
   imports:[
    JwtModule.register({
       secret:'JWT_SECRET',
       signOptions:{expiresIn:'30d'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,DatabaseService, JwtGuard],
  exports:[AuthService]
})
export class AuthModule {}
