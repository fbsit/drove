import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import type { Express } from 'express'; // 👈 tipo desde express
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo genérico' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderPath: { type: 'string' },
      },
      required: ['file'],
    },
  })
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderPath') folderPath: string,
  ) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');

    const url = await this.storage.upload(file, folderPath);
    return { url };
  }

  @Post('upload/drover')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo de documentación de drover' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folderPath: { type: 'string' },
      },
      required: ['file'],
    },
  })
  async uploadDrover(
    @UploadedFile() file: Express.Multer.File,
    @Body('folderPath') folderPath: string,
  ) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');

    const url = await this.storage.upload(file, folderPath);
    return { url };
  }

  @Post('upload/invoice')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir documento de factura' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        invoiceId: { type: 'number' },
      },
      required: ['file', 'invoiceId'],
    },
  })
  async uploadInvoice(
    @UploadedFile() file: Express.Multer.File,
    @Body('invoiceId') invoiceId: number,
  ) {
    if (!file) throw new BadRequestException('Archivo no proporcionado');

    const url = await this.storage.uploadInvoice(file, invoiceId);
    return { url };
  }
}
