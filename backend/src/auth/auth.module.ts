import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseService } from 'src/database/database.service';
import { PassportModule} from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    PassportModule.register({defaultStrategy:'jwt',session:false}),
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
