import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const { user } = await this.usersService.findOneByEmail(email);

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email or password is wrong.');
    }

    const payload = { id: user.id, email: user.email };

    const token = this.jwtService.sign(payload);

    return { token };
  }

  async getProfile(id: string) {
    const { user } = await this.usersService.findOne(id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image_url: user.image_url ?? null,
      },
    };
  }
}
