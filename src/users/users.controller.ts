import {
  Controller,
  Body,
  Post,
  Get,
  Patch,
  Param,
  Query,
  Delete,
  NotFoundException,
  Session,
  UseGuards,
  //OLD UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user-dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from './../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
//OLD import { CurrentUserInterceptor } from './interceptors/current-user-interceptor';
import { User } from './user.entity';
import { AuthGuard } from './../guards/auth.guard';

//runs the interceptor
@Serialize(UserDto)
@Controller('auth')
//Whenever a request comes in, we are going to intercept it
//Pull out the user Id from the session object
//Find the user from the database and
// assign it to the request object
// The request is gonna go on inside one of the handlers inside of our controller
// and if that controller has the @CurrentUser() decorator
// That decorator should pull out that currentUser and give it to us as an argument user
//OLD @UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   return this.usersService.findOne(session.userId);
  // }

  @UseGuards(AuthGuard)
  @Get('/whoami')
  // Interceptor: Session -> Request
  //Decorator Request -> Object
  // This decorator should pull out that currentUser Entity from the request
  whoAmI(@CurrentUser() user: User) {
    return user;
  }
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  //CreateUserDto says that our body is gonna have a user and a password
  async signin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get('/color/:color')
  setColor(@Param('color') color: string, @Session() session: any) {
    session.color = color;
  }

  @Get('/colors')
  getColor(@Session() session: any) {
    return session.color;
  }

  //Example with parameter
  //GET http://localhost:3000/auth/1

  //@UseInterceptors(new SerializerInterceptor(UserDto))
  @UseGuards(AuthGuard)
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    console.log('Handler is running');
    if (id == 'all') {
      return this.usersService.findAll();
    } else {
      const user = await this.usersService.findOne(parseInt(id));
      if (!user) {
        throw new NotFoundException('user Not Found');
      }
      return user;
    }
  }

  //Example with Query string
  //GET http://localhost:3000/auth?email=periac@email.com
  @UseGuards(AuthGuard)
  @Get()
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  //Example remove user with specific Id
  //DELETE http://localhost:3000/auth/2
  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }
  // Patch a new user with new fields
  // PATCH http://localhost:3000/auth/3
  // content-type: application/json

  // {
  //     "email": "aaaaaa@email.com",
  //     "password" : "secret"
  // }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
