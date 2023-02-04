import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    //see if email is in use
    const users = await this.usersService.find(email);

    if (users.length) {
      throw new BadRequestException('Email is in Use!');
    }

    //Hash the user password
    //Generate a salt
    //We dont want to work with 1s and 0s. Every Byte turns into 2 characters in HEX
    // 16 characters
    const salt = randomBytes(8).toString('hex');

    //Hash the salt and the password together and give us back 32 bytes/or characters back
    const hash = (await scrypt(password, salt, 32)) as Buffer; //random BYTES

    //Join the hashed result and the salt together and store in database
    const result = salt + '.' + hash.toString('hex');
    //create the new user and save it
    const user = await this.usersService.create(email, result);

    //return the user
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('User not found');
    } else {
      const [salt, storedHash] = user.password.split('.');
      const hashedPassword = (await scrypt(password, salt, 32)) as Buffer;
      if (storedHash !== hashedPassword.toString('hex')) {
        throw new BadRequestException('Bad Password');
      }
      return user;
    }
  }
}
