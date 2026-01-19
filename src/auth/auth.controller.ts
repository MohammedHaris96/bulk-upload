// // import { Controller, Post, Body } from '@nestjs/common';
// // import { AuthService } from './auth.service';

// // @Controller('auth')
// // export class AuthController {
// //   constructor(private authService: AuthService) {}

// //   @Post('login')
// //   async login(@Body() body: { username: string }) {
// //     return this.authService.login(body.username);
// //   }
// // }

// import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { JwtPayload } from './interfaces/jwt-payload.interface';

// @Injectable()
// export class AuthService {
//   constructor(private readonly jwtService: JwtService) {}

//   async login(user: { id: string; username: string }) {
//     const payload: JwtPayload = {
//       sub: user.id,
//       username: user.username,
//     };

//     return {
//       accessToken: this.jwtService.sign(payload),
//     };
//   }
// }

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string }) {
    const user = {
      id: 'mock-user-id-123',
      username: body.username,
    };

    return this.authService.login(user);
  }
}
