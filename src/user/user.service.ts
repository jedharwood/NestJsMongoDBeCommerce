import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dtos/create-user.dto';
import * as bCrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async addUser(createUserDto: CreateUserDto): Promise<User> {
    const newUser = await this.userModel.create(createUserDto);
    newUser.password = await bCrypt.hash(newUser.password, 10);

    return newUser.save();
  }

  async findUser(username: string): Promise<User | undefined> {
    return await this.userModel.findOne({ username: username });
  }
}
