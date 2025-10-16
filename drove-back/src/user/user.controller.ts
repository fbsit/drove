import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dtos/createUser.dto';
import { UpdateUserDto } from './dtos/updatedUser.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { JwtOrTestGuard } from '../common/guards/jwt-or-test.guard';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { IsNumber } from 'class-validator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Users')
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Crear usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: User })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  @ApiOkResponse({ type: [User] })
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtOrTestGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener el usuario autenticado' })
  @Get('me')
  async me(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @UseGuards(JwtOrTestGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  @Get('profile')
  async profile(@Request() req) {
    return this.userService.findOne(req.user.id);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Listar usuarios por rol (optimizado para asignación)' })
  @ApiParam({ name: 'role', enum: ['CLIENT', 'DROVER', 'ADMIN', 'TRAFFICBOSS'] })
  async findByRole(@Param('role') roleParam: string, @Request() req) {
    const role = roleParam.toUpperCase();
    const onlyAvailable = String(req?.query?.available || '').toLowerCase();
    const list = (onlyAvailable === 'true' || onlyAvailable === '1')
      ? await this.userService.findByRoleAndAvailability(role, true)
      : await this.userService.findByRole(role);
    // Sanitizar y enriquecer
    return this.userService.mapUsersForAssignment(list);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dashboard del drover autenticado' })
  @Get('drover/dashboard')
  findByEmail(@Request() req) {
    return this.userService.droverDashboard(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiOkResponse({ type: User })
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: User })
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  // Alias con PUT para compatibilidad de clientes que usan PUT en lugar de PATCH
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario (PUT alias)' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: User })
  @HttpCode(HttpStatus.OK)
  updatePut(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.userService.remove(id);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Enviar código de recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.userService.sendResetCode(dto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Resetear contraseña usando código' })
  @ApiBody({ type: ResetPasswordDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.userService.resetPassword(dto);
  }

  /* --- Tracking de drover: actualizar ubicación actual --- */
  @UseGuards(JwtOrTestGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar ubicación actual del usuario autenticado (solo drover)' })
  @Post('me/current-position')
  async updateCurrentPosition(
    @Request() req,
    @Body('lat') lat: number,
    @Body('lng') lng: number,
  ) {
    return this.userService.updateCurrentPosition(req.user.id, lat, lng);
  }

  /* --- Disponibilidad de drover --- */
  @UseGuards(JwtOrTestGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar disponibilidad (solo drover)' })
  @Post('me/availability')
  async setAvailability(
    @Request() req,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.userService.setAvailability(req.user.id, !!isAvailable);
  }
}
