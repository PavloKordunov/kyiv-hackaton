import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
   imports:[
    JwtModule.register({
       secret:'JWT_SECRET',
       signOptions:{expiresIn:'30d'}
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,DatabaseService],
  exports:[AuthService]
})
export class AuthModule {}
