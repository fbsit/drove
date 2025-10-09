import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MyMessageDTO {
  @ApiProperty({ example: 'Hola, tengo un problema con mi pedido.' })
  @IsString()
  content: string;
}


