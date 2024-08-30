import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { AuthenticateDto } from './dto/authenticate.dto';
import { AuthGuard } from './auth.guard';
import { Public } from 'src/constant';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post()
  @Public()
  async signIn(@Body() signInDto: AuthenticateDto, @Res() response: Response) {
    const { token } = await this.authService.signIn(
      signInDto.email,
      signInDto.password,
    );

    return response
      .cookie('@planner:tokenJwt', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      })
      .status(200)
      .json({ token });
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
