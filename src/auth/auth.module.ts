import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET', { infer: true });
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }

        const expiresInRaw = configService.get<string>('JWT_EXPIRATION', {
          infer: true,
        });

        const expiresIn = expiresInRaw ? Number(expiresInRaw) : 86400;

        if (Number.isNaN(expiresIn)) {
          throw new Error('JWT_EXPIRATION must be a number');
        }

        return {
          secret,
          signOptions: {
            expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
