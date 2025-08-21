import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from './../invoices/entities/invoice.entity';
import { ResendService } from '../resend/resend.service';
import { Travels } from '../travels/entities/travel.entity';
import { User } from '../user/entities/user.entity';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = 'drover';
  private readonly endpoint = 'https://bucket-production-6593.up.railway.app';
  private readonly s3: S3Client;

  /* credenciales fijas (Railway-MinIO) */
  private readonly accessKey = '3SjMnUt1QtFnDwvqZU6H';
  private readonly secretKey = 'g64VdVUobDP1MxVxdYreMXrsav7kIFwFa9F4rI9I';

  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepo: Repository<Invoice>,
    @InjectRepository(Travels)
    private readonly travelsRepo: Repository<Travels>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly resend: ResendService,
  ) {
    /* Instancia del cliente S3 apuntando a MinIO */
    this.s3 = new S3Client({
      region: 'us-east-1', //minio lo ignora
      endpoint: this.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
    });

    this.ensureBucketExists().catch((e) =>
      this.logger.error('No se pudo verificar/crear bucket', e),
    );
  }

  /* Verifica que el bucket exista (lo crea si falta) */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.debug(`Bucket ${this.bucket} OK`);
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`Bucket ${this.bucket} creado`);
    }
  }

  /* Sube un archivo y devuelve la URL pública */
  async upload(
    file: Express.Multer.File, // Multer.File
    folderPath = '',
  ): Promise<string> {
    const keyName = `${folderPath.replace(/^\//, '')}/${randomUUID()}${extname(file.originalname)}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: keyName,
        Body: file.buffer, // requiere memoryStorage en Multer
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    const url = `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${keyName}`;
    this.logger.log(`Archivo subido: ${url}`);
    return url;
  }

  async uploadInvoice(
    file: Express.Multer.File,
    invoiceId: number,
  ): Promise<string> {
    // 1. Busca la factura
    const invoice = await this.invoicesRepo.findOne({
      where: { id: invoiceId },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceId} not found`);
    }

    // 2. Asegúrate de que tenga travelId
    if (!invoice.travelId) {
      throw new NotFoundException(`Invoice ${invoiceId} sin viaje asociado`);
    }

    // 3. Carpeta basada en travelId
    const folder = `travel/${invoice.travelId}/delivery/documents`;

    // 4. Nombre de archivo único con extensión correcta
    const fileExt = extname(file.originalname);
    const keyName = `${folder}/${randomUUID()}${fileExt}`;

    // 5. Sube a S3
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: keyName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      }),
    );

    // 6. URL pública
    const url = `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${keyName}`;

    // 7. Guarda URL en la factura
    invoice.urlPDF = url;
    invoice.status = InvoiceStatus.PAID;
    await this.invoicesRepo.save(invoice);

    // 8. Buscar el viaje
    const travel = await this.travelsRepo.findOne({
      where: { id: invoice.travelId },
      relations: ['client'], // Incluir la relación con el cliente
    });

    if (!travel) {
      throw new NotFoundException(`Travel ${invoice.travelId} not found`);
    }

    // 9. Buscar el cliente con el idClient del viaje
    const client =
      travel.client ||
      (await this.userRepo.findOne({
        where: { id: travel.idClient },
      }));

    if (!client) {
      throw new NotFoundException(
        `Client for travel ${invoice.travelId} not found`,
      );
    }

    // 10. Enviar email de factura disponible
    try {
      await this.resend.sendInvoiceAvailableEmail(
        client.email,
        travel.id.toString(),
        new Date().toLocaleDateString('es-ES'),
        invoice.totalAmount?.toString() || '0.00',
        invoice.id.toString(),
        url,
      );
      this.logger.log(`Email de factura enviado a ${client.email}`);
    } catch (error) {
      this.logger.error('Error al enviar email de factura:', error);
      // No lanzamos excepción para no afectar el proceso principal
    }

    return url;
  }
}
