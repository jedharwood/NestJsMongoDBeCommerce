import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bCrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findUser(username);
    const passwordIsMatch = await bCrypt.compare(password, user.password);

    if (user && passwordIsMatch) return user;
  }
}
