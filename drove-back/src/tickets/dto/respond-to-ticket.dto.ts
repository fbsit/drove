// src/support/dto/respond-to-ticket.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondToTicketDTO {
  @ApiProperty()
  @IsString()
  response: string;
}
