import { Role } from 'src/auth/enums/role.enum';

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  roles: Role[];
}
