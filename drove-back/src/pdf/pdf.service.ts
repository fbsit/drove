// src/pdf/pdf.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as QrImage from 'qr-image';
import fetch from 'node-fetch';
import { PricingService } from './../rates/prices.service';
import { CompensationService, parseKmFromDistance } from './../rates/compensation.service';
import { User } from './../user/entities/user.entity';
import { Travels } from './../travels/entities/travel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';
import { RoutesService } from './../routes/routes.service';
import { S3 } from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { Repository, FindOptionsWhere } from 'typeorm';

@Injectable()
export class PdfService {
  private s3client: S3;
  private readonly defaultRelations = ['payments', 'client', 'drover'];
  constructor(
    private readonly configService: ConfigService,
    private readonly priceService: PricingService,
    private readonly compensationService: CompensationService,
    private readonly routesService: RoutesService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Travels)
    private readonly travelsRepository: Repository<Travels>,
  ) {
    const minioEndpoint =
      this.configService.get<string>('MINIO_ENDPOINT') ||
      this.configService.get<string>('S3_ENDPOINT');
    const minioRegion =
      this.configService.get<string>('MINIO_REGION') || 'us-east-1';
    const accessKeyId =
      this.configService.get<string>('MINIO_ACCESS_KEY') ||
      this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey =
      this.configService.get<string>('MINIO_SECRET_KEY') ||
      this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    this.s3client = new S3({
      region: minioRegion,
      ...(minioEndpoint
        ? { endpoint: minioEndpoint, forcePathStyle: true }
        : {}),
      credentials:
        accessKeyId && secretAccessKey
          ? { accessKeyId, secretAccessKey }
          : undefined,
    });
  }

  async generatePDF(
    travelId: any,
    usePage: string,
    addQr: boolean,
    addStartImagesVehicule: boolean,
    addBothSignature: boolean,
    addEndImagesVehicule: boolean,
    addDniClient: boolean,
    detailInfo: string,
    step: number,
    hideTotals: boolean = false,
  ): Promise<any> {
    try {
      let url_pdf;
      console.log('travelId', travelId);
      const travel: Travels = await this.getTravel(travelId);
      if (!travel) {
        throw new InternalServerErrorException('No se encontró el viaje');
      }
      switch (usePage) {
        case 'withdrawals':
        case 'delivery':
          url_pdf = await this.makePDF(
            travel,
            usePage,
            addQr,
            addStartImagesVehicule,
            addBothSignature,
            addEndImagesVehicule,
            addDniClient,
            detailInfo,
            step,
            hideTotals,
          );
          break;
        case 'invoice':
          url_pdf = await this.generatePDFInvoice();
          break;
        default:
          break;
      }
      return typeof url_pdf === 'string' ? url_pdf : null;
    } catch (e) {
      console.log(e);
      // No interrumpir el proceso: si falla la generación, devolvemos null
      return null;
    }
  }

  /**
   * Genera un código QR en formato PNG usando la librería qr‑image.
   */
  generateQR(idTravel: string, page: string): Buffer<ArrayBufferLike> {
    try {
      console.log('generando qr', page);
      const rawBaseUrl =
        this.configService.get<string>('FRONTEND_BASE_URL') ||
        'https://drove.es';
      const baseUrl = rawBaseUrl.replace(/\/+$/, '');
      // withdrawals => flujo de recogida, delivery => flujo de entrega
      const url =
        page === 'withdrawals'
          ? `${baseUrl}/verificacion/recogida/${idTravel}`
          : `${baseUrl}/verificacion/entrega/${idTravel}`;
      const qrPng: Buffer = QrImage.imageSync(url, { type: 'png' });
      return qrPng;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Error generando QR');
    }
  }

  /**
   * Embeds an image into the PDF from multiple possible sources:
   * - data URLs (base64)
   * - Wix media URLs (wix:image://v1/...)
   * - Generic HTTP(S) URLs (Railway bucket, etc.)
   */
  private async embedImageFromSource(pdfDoc: PDFDocument, src: string) {
    try {
      if (!src || typeof src !== 'string') return null;

      // data URI
      if (src.startsWith('data:image/')) {
        const [, b64] = src.split(',');
        const buf = Buffer.from(b64, 'base64');
        if (src.includes('png')) return await pdfDoc.embedPng(buf);
        return await pdfDoc.embedJpg(buf);
      }

      // wix -> directo
      const wixMatch = src.match(/^wix:image:\/\/v1\/(.+?)\//);
      const directUrl =
        wixMatch && wixMatch[1]
          ? `https://static.wixstatic.com/media/${wixMatch[1]}`
          : src;

      const res = await fetch(directUrl);
      if (!res.ok) return null;
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      const arr = await res.arrayBuffer();
      const buf = Buffer.from(arr);

      // Prefer content-type, fallback to extension, fallback to magic bytes
      const isPng =
        contentType.includes('png') ||
        directUrl.toLowerCase().endsWith('.png') ||
        (buf.length > 4 &&
          buf[0] === 0x89 &&
          buf[1] === 0x50 &&
          buf[2] === 0x4e &&
          buf[3] === 0x47);
      if (isPng) return await pdfDoc.embedPng(buf);
      return await pdfDoc.embedJpg(buf);
    } catch {
      return null;
    }
  }

  /**
   * Función que genera el PDF dinámico cumpliendo todas las condiciones del código original.
   */
  async makePDF(
    travel: any,
    usePage: string,
    addQr: boolean,
    addStartImagesVehicule: boolean,
    addBothSignature: boolean,
    addEndImagesVehicule: boolean,
    addDniClient: boolean,
    detailInfo: string,
    step: number,
    hideTotals: boolean = false,
  ): Promise<any> {
    try {
      // Normalizar estructuras opcionales para evitar errores por null/undefined
      const pickupVerification = travel?.pickupVerification || {};
      const deliveryVerification = travel?.deliveryVerification || {};
      // Elegir fuente de fotos según sea inicio (recogida) o final (entrega)
      const usePickupPhotos = !!addStartImagesVehicule && !addEndImagesVehicule;
      const photosSource: any = usePickupPhotos
        ? pickupVerification
        : deliveryVerification;
      const exteriorPhotos = photosSource?.exteriorPhotos || {};
      const interiorPhotos = photosSource?.interiorPhotos || {};
      const handoverDocuments = deliveryVerification?.handoverDocuments || {};
      const recipientIdentity = deliveryVerification?.recipientIdentity || {};
      // Cálculos iniciales para la altura de la página
      const qrSectionHeight = 140;
      const baseWithImage =
        addStartImagesVehicule || addEndImagesVehicule
          ? addDniClient
            ? 3400
            : 3200
          : 2000;
      let extraHeight = 0;
      const mustAddCertificate =
        step === 4 &&
        addDniClient &&
        typeof handoverDocuments.delivery_document === 'string' &&
        handoverDocuments.delivery_document.trim() !== '';
      const mustAddFuelReceipt =
        step === 4 &&
        addDniClient &&
        typeof handoverDocuments.fuel_receipt === 'string' &&
        handoverDocuments.fuel_receipt.trim() !== '';
      const mustAddSelfie =
        step === 4 &&
        addDniClient &&
        typeof recipientIdentity.selfieWithId === 'string' &&
        recipientIdentity.selfieWithId.trim() !== '';

      // Reservar espacio suficiente para certificado y justificante para evitar solapamientos
      if (mustAddCertificate) extraHeight += 720; // ~680px imagen + márgenes
      if (mustAddFuelReceipt) extraHeight += 700; // ~560px imagen + márgenes
      if (mustAddSelfie) extraHeight += 260;

      let pageHeight = addQr ? baseWithImage : baseWithImage - qrSectionHeight;
      pageHeight += extraHeight;
      // Crear el documento PDF y agregar la página
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, pageHeight]);
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBoldFont = await pdfDoc.embedFont(
        StandardFonts.HelveticaBold,
      );
      const fontTitle = 24;
      const fontSize = 12;

      // Obtener información del cliente y del chofer
      const client = await this.getUser(travel.idClient);
      // Algunos modelos usan droverId/drover en lugar de idChofer
      const chofer = (travel as any).drover
        ? (travel as any).drover
        : (travel as any).droverId
          ? await this.getUser((travel as any).droverId)
          : (travel as any).idChofer
            ? await this.getUser((travel as any).idChofer)
            : null;

      // Calcular el tiempo de uso y normalizarlo
      const timeUse =
        step === 3
          ? travel.updatedAt
          : step === 4
            ? travel.updatedAt
            : travel.travelTime;
      console.log('timeUse', timeUse);
      const normalizedTravelTime = this.normalizeTime(timeUse);

      // Obtener datos de la ruta y detalles adicionales
      const detailRoute = await this.getRouteMap(
        {
          lat: travel.startAddress.lat,
          lng: travel.startAddress.lng,
        },
        {
          lat: travel.endAddress.lat,
          lng: travel.endAddress.lng,
        },
      );
      const detailText = this.getDetailText(
        detailInfo,
        chofer,
        travel.personDelivery,
        travel.personReceive,
      );
      console.log('datos del chofer', chofer);
      // Si se trata de la sección chofer y no es step 4, incluir la selfie
      if (
        (step !== 4 && detailInfo === 'chofer') ||
        (step !== 4 && detailInfo === 'selfChofer')
      ) {
        const wixImageUrlSelfie = chofer?.contactInfo?.selfie || chofer?.selfie;
        if (wixImageUrlSelfie && typeof wixImageUrlSelfie === 'string') {
          const imageId = wixImageUrlSelfie;
          let directImageUrl = imageId;
          // Si es dataURL (base64), incrustar directamente
          const isDataUrl =
            typeof directImageUrl === 'string' &&
            directImageUrl.startsWith('data:image/');
          const imageFormat: any =
            (isDataUrl && directImageUrl.includes('image/png')) ||
            (!isDataUrl && directImageUrl.includes('.png'))
              ? 'png'
              : 'jpg';
          const imageBuffer = isDataUrl
            ? Buffer.from(directImageUrl.split(',')[1], 'base64')
            : Buffer.from(await (await fetch(directImageUrl)).arrayBuffer());
          let emblemSelfieImage;
          if (imageFormat === 'jpg' || imageFormat === 'jpeg') {
            emblemSelfieImage = await pdfDoc.embedJpg(imageBuffer);
          } else if (imageFormat === 'png') {
            emblemSelfieImage = await pdfDoc.embedPng(imageBuffer);
          } else {
            console.warn(`Formato de imagen no soportado para la selfie`);
          }
          if (emblemSelfieImage) {
            const pngDims = emblemSelfieImage.scale(0.5);
            page.drawImage(emblemSelfieImage, {
              x: 50,
              y: pageHeight - 90,
              width: 70,
              height: 70,
            });
          }
        } else {
          console.warn(
            'No se encontró una URL de imagen válida para la selfie del chofer.',
          );
        }
      }
      if (step !== 4) {
        page.drawText(detailText.title, {
          x: detailInfo === 'chofer' || detailInfo === 'selfChofer' ? 125 : 50,
          y: pageHeight - 70,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(detailText.nameKey, {
          x:
            detailInfo === 'delivery'
              ? 270
              : detailInfo === 'reception'
                ? 180
                : 242,
          y: pageHeight - 70,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      if (
        (step !== 4 && detailInfo === 'chofer') ||
        (step !== 4 && detailInfo === 'selfChofer')
      ) {
        page.drawText('Teléfono:', {
          x: 125,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(detailText.phoneKey, {
          x: 180,
          y: pageHeight - 90,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
      }
      if (
        step !== 4 &&
        (detailInfo === 'delivery' || detailInfo === 'reception')
      ) {
        const titleDNI =
          detailInfo === 'delivery'
            ? 'NIF o CIF de quien entrega el vehiculo:'
            : 'NIF o CIF receptor:';
        page.drawText(titleDNI, {
          x: 50,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const dniValue = String(
          detailInfo === 'delivery'
            ? (travel?.personDelivery?.dni ?? '')
            : (travel?.personReceive?.dni ?? ''),
        );
        const positionXDni = detailInfo === 'delivery' ? 273 : 160;
        page.drawText(dniValue, {
          x: positionXDni,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText('Télefono:', {
          x: 49,
          y: pageHeight - 107,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(detailText.phoneKey, {
          x: 110,
          y: pageHeight - 107,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
      }
      if (step === 4 && detailInfo === 'chofer') {
        page.drawText('Nombre del chofer:', {
          x: 50,
          y: pageHeight - 73, // 20 pixeles por encima
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(detailText.nameKey, {
          x: 160,
          y: pageHeight - 73,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText('Nombre del receptor:', {
          x: 50,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(travel.personReceive.fullName, {
          x: 175,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const titleDNI = 'NIF o CIF receptor:';
        page.drawText(titleDNI, {
          x: 50,
          y: pageHeight - 107,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const dniValue = String(travel?.personReceive?.dni ?? '');
        page.drawText(dniValue, {
          x: 160,
          y: pageHeight - 107,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
      }
      if (step === 4 && detailInfo === 'reception') {
        page.drawText('Nombre del receptor:', {
          x: 50,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText(travel.personReceive.fullName, {
          x: 175,
          y: pageHeight - 90,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const titleDNI = 'NIF o CIF receptor:';
        page.drawText(titleDNI, {
          x: 50,
          y: pageHeight - 107,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const dniValue = String(travel?.personReceive?.dni ?? '');
        page.drawText(dniValue, {
          x: 160,
          y: pageHeight - 107,
          size: fontSize,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
      }
      const fixVertical = step === 4 && detailInfo !== 'chofer' ? -10 : -10;
      let dateUse =
        step === 3
          ? travel.updatedAt
          : step === 4
            ? travel.updatedAt
            : travel.travelDate;
      dateUse =
        typeof dateUse === 'object' && (dateUse as any).$date
          ? (dateUse as any).$date
          : dateUse;
      // Fallback si la fecha es inválida o no viene informada
      let dateObj = new Date(dateUse || Date.now());
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date();
      }
      const travelDate = dateObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeToDraw =
        normalizedTravelTime ||
        dateObj.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
      const textLabel =
        step === 3 || step === 4 ? 'Fecha de entrega:' : 'Fecha de recogida:';
      page.drawText(textLabel, {
        x: 50,
        y: pageHeight - 123,
        size: fontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(travelDate, {
        x: step === 4 || step === 3 ? 155 : step === 1 ? 162 : 160,
        y: pageHeight - 123,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      const textTime =
        step === 3
          ? 'Hora llegada:'
          : step === 4
            ? 'Hora de recepción:'
            : 'Hora de recogida:';
      page.drawText(textTime, {
        x: 50,
        y: pageHeight - 127 + fixVertical,
        size: fontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      const timeReceptionX =
        step === 4 ? 161 : step === 3 ? 128 : step === 1 ? 155 : 160;
      console.log('timeReceptionX', timeReceptionX);
      page.drawText(timeToDraw, {
        x: timeReceptionX,
        y: pageHeight - 127 + fixVertical,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      // ID del transporte
      page.drawText('ID transporte:', {
        x: 50,
        y: pageHeight - 180 + fixVertical,
        size: fontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(String(travel?.id ?? ''), {
        x: 150,
        y: pageHeight - 180 + fixVertical,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText('Cliente:', {
        x: 50,
        y: pageHeight - 144 + fixVertical,
        size: fontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      const nombreCliente = client?.contactInfo?.fullName;
      page.drawText(nombreCliente, {
        x: 97,
        y: pageHeight - 144 + fixVertical,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText('ID Cliente:', {
        x: 50,
        y: pageHeight - 162 + fixVertical,
        size: fontSize,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      page.drawText(String(travel?.idClient || ''), {
        x: 120,
        y: pageHeight - 162 + fixVertical,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      page.drawText('DROVE', {
        x: 464,
        y: pageHeight - 65,
        size: 24,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });

      // Switch según el step (se han incluido todos los casos)
      switch (step) {
        case 1:
          {
            const X = detailInfo === 'delivery' ? 424 : 404;
            pageHeight =
              detailInfo === 'delivery' ? pageHeight - 10 : pageHeight;
            page.drawText('Comprobante de', {
              x: X,
              y: pageHeight - 85,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            const firstText =
              detailInfo === 'delivery' ? 'asignación' : 'solicitud de';
            const firstX = detailInfo === 'delivery' ? 502 : 480;
            page.drawText(firstText, {
              x: firstX,
              y: pageHeight - 85,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            const secondText =
              detailInfo === 'delivery'
                ? 'de traslado de vehículo'
                : 'traslado de vehículo';
            const secondX = detailInfo === 'delivery' ? 444 : 439;
            page.drawText(secondText, {
              x: secondX,
              y: pageHeight - 97,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            if (detailInfo === 'chofer') {
              page.drawText('completado por el cliente.', {
                x: 424,
                y: pageHeight - 108,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('Por su seguridad,', {
                x: 399,
                y: pageHeight - 120,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('no comparta', {
                x: 477,
                y: pageHeight - 120,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('este documento y solo', {
                x: 429,
                y: pageHeight - 133,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('muestre en persona el código', {
                x: 396,
                y: pageHeight - 144,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('QR al chofer asignado', {
                x: 431,
                y: pageHeight - 155,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
            } else {
              page.drawText('No comparta este documento.', {
                x: 424,
                y: pageHeight - 108,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('Para recoger el vehículo debe,', {
                x: 413,
                y: pageHeight - 120,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('escanear el código QR de', {
                x: 433,
                y: pageHeight - 133,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawText('seguridad que tiene el cliente.', {
                x: 416,
                y: pageHeight - 145,
                size: 10,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
            }
          }
          break;
        case 2:
          {
            const X = detailInfo === 'delivery' ? 424 : 430;
            pageHeight =
              detailInfo === 'delivery' ? pageHeight - 10 : pageHeight;
            page.drawText('Comprobante de inicio de', {
              x: X,
              y: pageHeight - 85,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            const secondText =
              detailInfo === 'delivery'
                ? 'de traslado de vehículo'
                : 'traslado del vehículo';
            const secondX = detailInfo === 'delivery' ? 444 : 445;
            page.drawText(secondText, {
              x: secondX,
              y: pageHeight - 97,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            if (detailInfo === 'chofer') {
              page.drawText('completado por el chofer al', {
                x: 423,
                y: pageHeight - 108,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('escanear el código QR del cliente,', {
                x: 394,
                y: pageHeight - 120,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('para llenar el formulario y', {
                x: 432,
                y: pageHeight - 133,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('proceder con la recogida del', {
                x: 418,
                y: pageHeight - 145,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('vehículo.', {
                x: 507,
                y: pageHeight - 156,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            } else {
              page.drawText('completado por ti al escanear el', {
                x: 402,
                y: pageHeight - 108,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('código QR del cliente para llenar', {
                x: 399,
                y: pageHeight - 120,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('el formulario y proceder con el', {
                x: 409,
                y: pageHeight - 133,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('traslado del vehículo.', {
                x: 453,
                y: pageHeight - 145,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
          }
          break;
        case 3:
          {
            const X = detailInfo === 'delivery' ? 424 : 430;
            pageHeight =
              detailInfo === 'delivery' ? pageHeight - 10 : pageHeight;
            page.drawText('Comprobante de inicio de', {
              x: X,
              y: pageHeight - 85,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            const secondText =
              detailInfo === 'delivery'
                ? 'de traslado de vehículo'
                : 'entrega del vehículo.';
            const secondX = detailInfo === 'delivery' ? 444 : 455;
            page.drawText(secondText, {
              x: secondX,
              y: pageHeight - 97,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            if (detailInfo === 'chofer' || detailInfo === 'selfChofer') {
              page.drawText('El vehículo a llegado a destino. El', {
                x: 401,
                y: pageHeight - 108,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('chofer debe escanear el QR,', {
                x: 426,
                y: pageHeight - 121,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('adjunto a este documento, para', {
                x: 412,
                y: pageHeight - 133,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('completar el formulario de', {
                x: 437,
                y: pageHeight - 145,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('entrega final.', {
                x: 497,
                y: pageHeight - 156,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
          }
          break;
        case 4:
          {
            const X = 430;
            pageHeight =
              detailInfo === 'delivery' ? pageHeight - 10 : pageHeight;
            page.drawText('Comprobante de recepción', {
              x: X,
              y: pageHeight - 85,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            const secondText =
              detailInfo === 'delivery'
                ? 'segura del vehículo'
                : 'segura del vehículo.';
            const secondX = 464;
            page.drawText(secondText, {
              x: secondX,
              y: pageHeight - 97,
              size: 10,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            if (detailInfo === 'chofer') {
              page.drawText('Completada por el chofer al', {
                x: 436,
                y: pageHeight - 110,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('escanear el código QR del cliente', {
                x: 410,
                y: pageHeight - 121,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('para llenar el formulario y', {
                x: 445,
                y: pageHeight - 133,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('proceder con la entrega del', {
                x: 436,
                y: pageHeight - 145,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('vehículo al cliente.', {
                x: 478,
                y: pageHeight - 156,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            } else {
              page.drawText('Haz completado la entrega del', {
                x: 423,
                y: pageHeight - 110,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('vehículo al escanear el código QR', {
                x: 407,
                y: pageHeight - 122,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('para llenar el formulario y', {
                x: 445,
                y: pageHeight - 133,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('proceder con la entrega del', {
                x: 436,
                y: pageHeight - 145,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
              page.drawText('vehículo al cliente.', {
                x: 478,
                y: pageHeight - 156,
                size: 10,
                font: font,
                color: rgb(0, 0, 0),
              });
            }
          }
          break;
      }
      console.log('Agregar codigo QR ?', addQr);
      if (addQr) {
        const imgQrWithdrawals = await this.generateQR(travel.id, usePage);
        const emblemImage = await pdfDoc.embedPng(imgQrWithdrawals);
        const pngDims = emblemImage.scale(0.5);
        page.drawImage(emblemImage, {
          x: 50,
          y: pageHeight - 320,
          width: pngDims.width,
          height: pngDims.height,
        });
        page.drawText('Muestre este código QR', {
          x: 308,
          y: pageHeight - 220,
          size: 20,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText('al Chofer para que pueda', {
          x: 298,
          y: pageHeight - 245,
          size: 20,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const qrText =
          usePage === 'withdrawals'
            ? 'escanearlo e iniciar el'
            : 'escanearlo e iniciar la';
        page.drawText(qrText, {
          x: 329,
          y: pageHeight - 268,
          size: 20,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        const qrText2 =
          usePage === 'withdrawals'
            ? 'traslado del vehículo.'
            : 'entrega del vehículo.';
        page.drawText(qrText2, {
          x: 334,
          y: pageHeight - 290,
          size: 20,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
        page.drawText('DROVE', {
          x: 503,
          y: pageHeight - 310,
          size: 9,
          font: helveticaBoldFont,
          color: rgb(0, 0, 0),
        });
      }

      const contentStartY = addQr ? pageHeight - 350 : pageHeight - 210;
      page.drawText('INFORMACIÓN DEL VEHÍCULO', {
        x: 56,
        y: contentStartY,
        size: 20,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      const tableTop = contentStartY - 17;
      const tableLeft = 50;
      const rowHeight = 30;
      const colWidth = 250;
      const tableWidth = colWidth * 2;
      const tableHeight = rowHeight * 6;
      console.log('marca', travel?.brandVehicle);
      const datosTabla = [
        ['Tipo', travel?.typeVehicle ?? 'Sin tipo'],
        ['Marca', travel?.brandVehicle ?? 'Sin marca'],
        ['Año', travel?.yearVehicle ?? 'Sin año'],
        ['Matrícula', travel?.patentVehicle ?? 'Sin matrícula'],
        ['Modelo', travel?.modelVehicle ?? 'Sin modelo'],
        ['Bastidor', travel?.bastidor ?? 'Sin bastidor'],
      ];
      datosTabla.forEach((fila, filaIndex) => {
        const x = tableLeft;
        const y = tableTop - filaIndex * rowHeight;
        page.drawRectangle({
          x,
          y: y - rowHeight,
          width: 150,
          height: rowHeight,
          color: rgb(0.9, 0.9, 0.9),
        });
      });
      for (let i = 0; i <= datosTabla.length; i++) {
        const y = tableTop - i * rowHeight;
        page.drawLine({
          start: { x: tableLeft, y },
          end: { x: tableLeft + tableWidth, y },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      }
      page.drawLine({
        start: { x: 200, y: tableTop },
        end: { x: 200, y: tableTop - tableHeight },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      datosTabla.forEach((fila, filaIndex) => {
        fila.forEach((celda, colIndex) => {
          const x = tableLeft + colIndex * colWidth + 10;
          const y = tableTop - (filaIndex + 0.5) * rowHeight - fontSize / 2;
          const selectedFont = colIndex === 0 ? helveticaBoldFont : font;
          const xUse = colIndex === 0 ? x : x - 100;
          console.log('celda', celda);
          page.drawText(celda, {
            x: xUse,
            y,
            size: fontSize,
            font: selectedFont,
            color: rgb(0, 0, 0),
          });
        });
      });
      page.drawLine({
        start: { x: 50, y: tableTop - tableHeight },
        end: { x: 550, y: tableTop - tableHeight },
        thickness: 3,
        color: rgb(0, 0, 0),
      });
      const datosImagenesWithdrawalsVehiculo = [
        // Vistas exteriores (ExteriorPhotosDto)
        ['Parte frontal', exteriorPhotos.frontView || ''],
        ['Parte trasera', exteriorPhotos.rearView || ''],
        ['Lado izquierdo delantero', exteriorPhotos.leftFront || ''],
        ['Lado izquierdo trasero', exteriorPhotos.leftRear || ''],
        ['Lado derecho delantero', exteriorPhotos.rightFront || ''],
        ['Lado derecho trasero', exteriorPhotos.rightRear || ''],

        // Vistas interiores (InteriorPhotosDto)
        ['Cuadro de mando', interiorPhotos.dashboard || ''],
        ['Asiento conductor', interiorPhotos.driverSeat || ''],
        ['Asiento acompañante', interiorPhotos.passengerSeat || ''],
        ['Asientos traseros lado izquierdo', interiorPhotos.rearLeftSeat || ''],
        ['Asientos traseros lado derecho', interiorPhotos.rearRightSeat || ''],
        ['Interior maletero', interiorPhotos.trunk || ''],
      ];
      const datosImagenesDeliveryVehiculo: [string, string][] = [
        // Vistas exteriores (ExteriorPhotosDto)
        ['Parte frontal', exteriorPhotos.frontView || ''],
        ['Parte trasera', exteriorPhotos.rearView || ''],
        ['Lado izquierdo delantero', exteriorPhotos.leftFront || ''],
        ['Lado izquierdo trasero', exteriorPhotos.leftRear || ''],
        ['Lado derecho delantero', exteriorPhotos.rightFront || ''],
        ['Lado derecho trasero', exteriorPhotos.rightRear || ''],

        // Vistas interiores (InteriorPhotosDto)
        ['Cuadro de mando', interiorPhotos.dashboard || ''],
        ['Interior maletero', interiorPhotos.trunk || ''],
        ['Asiento conductor', interiorPhotos.driverSeat || ''],
        ['Asiento acompañante', interiorPhotos.passengerSeat || ''],
        ['Asientos traseros lado derecho', interiorPhotos.rearRightSeat || ''],
        ['Asientos traseros lado izquierdo', interiorPhotos.rearLeftSeat || ''],
      ];
      let currentY = tableTop - tableHeight - 50;
      const datosImagenesVehiculo = addStartImagesVehicule
        ? datosImagenesWithdrawalsVehiculo
        : datosImagenesDeliveryVehiculo;
      try {
        if (addStartImagesVehicule || addEndImagesVehicule) {
          currentY -= -30;
          const imagesPerRow = 2;
          const cellWidth = 250;
          const cellHeight = 200;
          const imageWidth = cellWidth - 20;
          const imageHeight = 150;
          const paddingX = 50;
          const titleHeight = 20;
          const titlePadding = 5;
          const indexCuadroDeMando = datosImagenesVehiculo.findIndex(
            ([description]) => description === 'Cuadro de mando',
          );
          const indexInterior = datosImagenesVehiculo.findIndex(
            ([description]) => description === 'Interior asiento conductor',
          );
          const indexInteriorBack = datosImagenesVehiculo.findIndex(
            ([description]) => description === 'Asientos traseros lado derecho',
          );
          for (let i = 0; i < datosImagenesVehiculo.length; i += imagesPerRow) {
            const rowItems = datosImagenesVehiculo.slice(i, i + imagesPerRow);
            let xPosition = paddingX;
            let paddingY = 0;
            if (i >= indexCuadroDeMando) paddingY = 10;
            if (i >= indexInterior) paddingY = 0;
            if (i >= indexInteriorBack) paddingY = 10;
            currentY -= cellHeight + paddingY;
            for (let j = 0; j < rowItems.length; j++) {
              const [description, wixImageUrl] = rowItems[j];
              page.drawRectangle({
                x: xPosition,
                y: currentY,
                width: cellWidth,
                height: cellHeight,
                borderWidth: 1,
                borderColor: rgb(0, 0, 0),
                color: rgb(1, 1, 1),
              });
              const titleBoxHeight = titleHeight + titlePadding * 2;
              const titleYPosition = currentY + cellHeight - titleBoxHeight;
              page.drawLine({
                start: { x: xPosition, y: titleYPosition + titleBoxHeight },
                end: {
                  x: xPosition + cellWidth,
                  y: titleYPosition + titleBoxHeight,
                },
                thickness: 1,
                color: rgb(0, 0, 0),
              });
              const textWidth = helveticaBoldFont.widthOfTextAtSize(
                description,
                fontSize,
              );
              page.drawText(description, {
                x: xPosition + cellWidth / 2 - textWidth / 2,
                y: titleYPosition + titlePadding + 5,
                size: fontSize,
                font: helveticaBoldFont,
                color: rgb(0, 0, 0),
              });
              page.drawLine({
                start: { x: xPosition, y: titleYPosition },
                end: { x: xPosition + cellWidth, y: titleYPosition },
                thickness: 1,
                color: rgb(0, 0, 0),
              });
              if (wixImageUrl && typeof wixImageUrl === 'string') {
                const img = await this.embedImageFromSource(
                  pdfDoc,
                  wixImageUrl,
                );
                if (img) {
                  // Mantener proporción de la imagen dentro del área disponible
                  const naturalW = (img as any).width || imageWidth;
                  const naturalH = (img as any).height || imageHeight;
                  const scale = Math.min(imageWidth / naturalW, imageHeight / naturalH);
                  const drawW = Math.max(1, Math.floor(naturalW * scale));
                  const drawH = Math.max(1, Math.floor(naturalH * scale));
                  const offsetX = xPosition + 10 + Math.max(0, (imageWidth - drawW) / 2);
                  const offsetY = currentY + 10 + Math.max(0, (imageHeight - drawH) / 2);
                  page.drawImage(img, {
                    x: offsetX,
                    y: offsetY,
                    width: drawW,
                    height: drawH,
                  });
                } else {
                  console.warn(
                    `No fue posible incrustar imagen para ${description}`,
                  );
                }
              } else {
                console.warn(`No hay imagen disponible para ${description}`);
              }
              xPosition += cellWidth;
            }
          }
        }
      } catch (e) {
        console.log('error', e);
      }
      currentY -= 40;
      page.drawText('DIRECCIÓN DE RECOGIDA', {
        x: 56,
        y: currentY,
        size: 20,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;
      const tableAddressTop = currentY;
      const tableAddressLeft = 50;
      const rowAddressHeight = 30;
      const colAddressWidth = 250;
      const tableAddressWidth = colAddressWidth * 2;
      const tableAddressHeight = rowAddressHeight * 6;
      const AddressTabla: [string, string][] = [
        [
          'Dirección',
          (travel.startAddress as any)?.address || travel.startAddress.city,
        ],
        ['Ciudad', travel.startAddress.city],
      ];
      AddressTabla.forEach((fila, filaIndex) => {
        const x = tableAddressLeft;
        const y = tableAddressTop - filaIndex * rowAddressHeight;
        page.drawRectangle({
          x,
          y: y - rowAddressHeight,
          width: 150,
          height: rowAddressHeight,
          color: rgb(0.9, 0.9, 0.9),
        });
      });
      for (let i = 0; i <= AddressTabla.length; i++) {
        const y = tableAddressTop - i * rowAddressHeight;
        page.drawLine({
          start: { x: tableAddressLeft, y },
          end: { x: tableAddressLeft + tableAddressWidth, y },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      }
      page.drawLine({
        start: { x: 200, y: tableAddressTop },
        end: { x: 200, y: tableAddressTop - tableAddressHeight },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      AddressTabla.forEach((fila, filaIndex) => {
        fila.forEach((celda, colIndex) => {
          if (typeof celda !== 'string') {
            console.error(
              `Invalid value at filaIndex ${filaIndex}, colIndex ${colIndex}:`,
              celda,
            );
            return;
          }
          const x = tableAddressLeft + colIndex * colAddressWidth + 10;
          const y =
            tableAddressTop -
            (filaIndex + 0.5) * rowAddressHeight -
            fontSize / 2;
          const selectedFont = colIndex === 0 ? helveticaBoldFont : font;
          const xUse = colIndex === 0 ? x : x - 100;
          page.drawText(celda, {
            x: xUse,
            y,
            size: fontSize,
            font: selectedFont,
            color: rgb(0, 0, 0),
          });
        });
      });
      page.drawLine({
        start: { x: 50, y: tableAddressTop - tableAddressHeight },
        end: { x: 550, y: tableAddressTop - tableAddressHeight },
        thickness: 3,
        color: rgb(0, 0, 0),
      });
      currentY = tableAddressTop - tableAddressHeight - 50;
      page.drawText('DIRECCIÓN DE ENTREGA', {
        x: 56,
        y: currentY,
        size: 20,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 15;
      const tableAddressDeliveryTop = currentY;
      const tableAddressDeliveryLeft = 50;
      const rowAddressDeliveryHeight = 30;
      const colAddressDeliveryWidth = 250;
      const tableAddressDeliveryWidth = colAddressDeliveryWidth * 2;
      const tableAddressDeliveryHeight = rowAddressDeliveryHeight * 6;
      const AddressDeliveryTabla: [string, string][] = [
        [
          'Dirección',
          (travel.endAddress as any)?.address || travel.endAddress.city,
        ],
        ['Ciudad', travel.endAddress.city],
      ];
      AddressDeliveryTabla.forEach((fila, filaIndex) => {
        const x = tableAddressDeliveryLeft;
        const y =
          tableAddressDeliveryTop - filaIndex * rowAddressDeliveryHeight;
        page.drawRectangle({
          x,
          y: y - rowAddressDeliveryHeight,
          width: 150,
          height: rowAddressDeliveryHeight,
          color: rgb(0.9, 0.9, 0.9),
        });
      });
      for (let i = 0; i <= AddressDeliveryTabla.length; i++) {
        const y = tableAddressDeliveryTop - i * rowAddressDeliveryHeight;
        page.drawLine({
          start: { x: tableAddressDeliveryLeft, y },
          end: { x: tableAddressDeliveryLeft + tableAddressDeliveryWidth, y },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      }
      page.drawLine({
        start: { x: 200, y: tableAddressDeliveryTop },
        end: {
          x: 200,
          y: tableAddressDeliveryTop - tableAddressDeliveryHeight,
        },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      AddressDeliveryTabla.forEach((fila, filaIndex) => {
        fila.forEach((celda, colIndex) => {
          const x =
            tableAddressDeliveryLeft + colIndex * colAddressDeliveryWidth + 10;
          const y =
            tableAddressDeliveryTop -
            (filaIndex + 0.5) * rowAddressDeliveryHeight -
            fontSize / 2;
          const selectedFont = colIndex === 0 ? helveticaBoldFont : font;
          const xUse = colIndex === 0 ? x : x - 100;
          page.drawText(celda, {
            x: xUse,
            y,
            size: fontSize,
            font: selectedFont,
            color: rgb(0, 0, 0),
          });
        });
      });
      page.drawLine({
        start: {
          x: 50,
          y: tableAddressDeliveryTop - tableAddressDeliveryHeight,
        },
        end: {
          x: 550,
          y: tableAddressDeliveryTop - tableAddressDeliveryHeight,
        },
        thickness: 3,
        color: rgb(0, 0, 0),
      });
      currentY = tableAddressDeliveryTop - tableAddressDeliveryHeight - 50;
      page.drawText('DETALLES DEL TRASLADO', {
        x: 56,
        y: currentY,
        size: 20,
        font: helveticaBoldFont,
        color: rgb(0, 0, 0),
      });
      currentY -= 17;
      const tableDetailTop = currentY;
      const tableDetailLeft = 50;
      const rowDetailHeight = 30;
      const colDetailWidth = 250;
      const tableDetailWidth = colDetailWidth * 2;
      const tableDetailHeight = rowDetailHeight * 2;
      const distanceKmRaw =
        (detailRoute && (detailRoute as any).DistanceInKM) ||
        travel?.distanceTravel ||
        '';
      const distanceKmNum = typeof distanceKmRaw === 'number'
        ? distanceKmRaw
        : parseKmFromDistance(String(distanceKmRaw || ''));
      const distanceFormatted = distanceKmNum > 0
        ? `${Number(distanceKmNum).toFixed(2)} Kilómetros`
        : '—';
      const rawTotalCliente = (detailRoute as any)?.priceResult?.Total_Cliente;
      let totalWithVat = '—';
      if (rawTotalCliente != null && rawTotalCliente !== '') {
        if (typeof rawTotalCliente === 'number') {
          totalWithVat = `${rawTotalCliente.toFixed(2)} €`;
        } else {
          const s = String(rawTotalCliente);
          totalWithVat = s.includes('€') ? s : `${s} €`;
        }
      } else if (typeof travel?.totalPrice === 'number' && !isNaN(travel.totalPrice)) {
        totalWithVat = `${(travel.totalPrice as number).toFixed(2)} €`;
      } else {
        // Fallback: calcular total con IVA a partir de la distancia
        try {
          const kmForPrice = Number(distanceKmNum || 0);
          const preview = this.priceService.getPrice(kmForPrice);
          totalWithVat = `${Number(preview.total).toFixed(2)} €`;
        } catch {}
      }

      // Regla de visualización: cliente ve Total; drover siempre ve Beneficio (sin IVA)
      try {
        // Paso específico: en 'recogida' (step === 2) históricamente se pasa
        // detailInfo='chofer' al cliente y 'reception' al drover.
        // Ajustamos la determinación del rol a esa convención.
        const isAssignmentStep = step === 1;
        const isPickupStep = step === 2;
        const isArrivalStep = step === 3;
        const isDeliveryStep = step === 4;
        // Mapeo por paso (quién ve Beneficio):
        //  - step 1 (asignación): cliente → Total (nunca drover)
        //  - step 2 (recogida): drover si detailInfo === 'reception'
        //  - step 3 (llegada): cliente → Total
        //  - step 4 (entrega): drover si detailInfo === 'chofer'
        const isDroverPdf = isAssignmentStep
          ? false
          : isArrivalStep
            ? false
            : isPickupStep
              ? (detailInfo === 'reception')
              : isDeliveryStep
                ? (detailInfo === 'chofer')
                : false;
        let amountLabel = 'Total';
        const droverEmpType =
          (chofer as any)?.employmentType ||
          (travel?.drover as any)?.employmentType;
        // Determinar KM parseado de forma robusta
        const kmNumber = Number(distanceKmNum || 0);
        if (isDroverPdf) {
          amountLabel = 'Beneficio';
          const role = String(droverEmpType || '').toUpperCase();
          const storedFee = (travel as any)?.driverFee;
          if (typeof storedFee === 'number' && !isNaN(storedFee)) {
            totalWithVat = `${Number(storedFee).toFixed(2)} €`;
          } else if (role === 'FREELANCE') {
            const preview = this.compensationService.calcFreelancePerTrip(kmNumber);
            totalWithVat = `${Number(preview.driverFee).toFixed(2)} €`;
          } else if (role === 'CONTRACTED') {
            const preview = this.compensationService.calcContractedPerTrip(kmNumber);
            totalWithVat = `${Number(preview.driverFee).toFixed(2)} €`;
          } else {
            totalWithVat = '—';
          }
        }
        // Sobrescribir etiqueta en la tabla si es drover
        if (isDroverPdf) {
          // Reasignamos más abajo usando amountLabel
        }
      } catch {}
      const isAssignmentStep2 = step === 1;
      const isPickupStep2 = step === 2;
      const isArrivalStep2 = step === 3;
      const isDeliveryStep2 = step === 4;
      const isDrover = isAssignmentStep2
        ? false
        : isArrivalStep2
          ? false
          : isPickupStep2
            ? (detailInfo === 'reception')
            : isDeliveryStep2
              ? (detailInfo === 'chofer')
              : false;
      const amountLabelFinal = isDrover ? 'Beneficio' : 'Total';
      const detailTravelTabla = [
        ['Distancia', distanceFormatted],
        [amountLabelFinal, hideTotals ? '' : totalWithVat],
      ];
      detailTravelTabla.forEach((fila, filaIndex) => {
        const x = tableDetailLeft;
        const y = tableDetailTop - filaIndex * rowDetailHeight;
        page.drawRectangle({
          x,
          y: y - rowDetailHeight,
          width: 150,
          height: rowDetailHeight,
          color: rgb(0.9, 0.9, 0.9),
        });
      });
      for (let i = 0; i <= detailTravelTabla.length; i++) {
        const y = tableDetailTop - i * rowDetailHeight;
        page.drawLine({
          start: { x: tableDetailLeft, y },
          end: { x: tableDetailLeft + tableDetailWidth, y },
          thickness: 1,
          color: rgb(0, 0, 0),
        });
      }
      page.drawLine({
        start: { x: 200, y: tableDetailTop },
        end: { x: 200, y: tableDetailTop - tableDetailHeight },
        thickness: 1,
        color: rgb(0, 0, 0),
      });
      detailTravelTabla.forEach((fila, filaIndex) => {
        fila.forEach((celda, colIndex) => {
          const x = tableDetailLeft + colIndex * colDetailWidth + 10;
          const y =
            tableDetailTop - (filaIndex + 0.5) * rowDetailHeight - fontSize / 2;
          const selectedFont = colIndex === 0 ? helveticaBoldFont : font;
          const xUse = colIndex === 0 ? x : x - 100;
          // Si es la celda del importe (fila 2, columna 2) y hideTotals=true, no dibujar valor
          const isAmountCell = filaIndex === 1 && colIndex === 1;
          const textToDraw = (isAmountCell && hideTotals) ? '' : String(celda);
          page.drawText(textToDraw, {
            x: xUse,
            y,
            size: fontSize,
            font: selectedFont,
            color: rgb(0, 0, 0),
          });
        });
      });
      currentY = tableDetailTop - tableDetailHeight - 50;
      // Mostrar el mapa con la ruta capturada (polyline) cuando exista: aplica tanto para REQUEST_FINISH como para DELIVERED
      const capturedPolyline =
        (travel as any)?.routePolyline &&
        String((travel as any).routePolyline).trim() !== ''
          ? String((travel as any).routePolyline)
          : '';
      if (capturedPolyline) {
        const mapWithRoute = await this.getMapImageWithRoute(
          { lat: travel.startAddress.lat, lng: travel.startAddress.lng },
          { lat: travel.endAddress.lat, lng: travel.endAddress.lng },
          capturedPolyline,
        );
        const imgMapRoute = mapWithRoute.split(',')[1];
        const imgRouteMapReady = await pdfDoc.embedPng(
          Buffer.from(imgMapRoute, 'base64'),
        );
        const mapY = currentY - 280;
        page.drawImage(imgRouteMapReady, {
          x: 50,
          y: mapY,
          width: 500,
          height: 300,
        });
        currentY = mapY - 40;
      } else {
        // Fallbacks anteriores si aún no hay polyline capturado
        if (
          travel.status === 'REQUEST_FINISH' ||
          travel.status === 'DELIVERED'
        ) {
          const mapToEnd = await this.getMapImage(
            travel.endAddress.lat,
            travel.endAddress.lng,
          );
          const imgMapEnd = mapToEnd.split(',')[1];
          const imgEndMapReady = await pdfDoc.embedPng(
            Buffer.from(imgMapEnd, 'base64'),
          );
          const mapY = currentY - 280;
          page.drawImage(imgEndMapReady, {
            x: 50,
            y: mapY,
            width: 500,
            height: 300,
          });
          currentY = mapY - 40;
        } else {
          const mapToStart = await this.getMapImage(
            travel.startAddress.lat,
            travel.startAddress.lng,
          );
          const imgMap = mapToStart.split(',')[1];
          const imgMapReady = await pdfDoc.embedPng(
            Buffer.from(imgMap, 'base64'),
          );
          const mapY = currentY - 280;
          page.drawImage(imgMapReady, {
            x: 50,
            y: mapY,
            width: 500,
            height: 300,
          });
          currentY = mapY - 40;
        }
      }

      if (step === 4) {
        // ─────────────────────────────────────────────────────────────────────────────
        // SECCIÓN (STEP 4): Armado de documento de entrega
        // - Mapa(s) de ruta
        // - Documentos del usuario (DNI Anverso/Reverso)
        // - Selfie del receptor con documento
        // - Bloque de firmas (cliente/chofer)
        // - Texto legal y fecha de emisión
        // - Certificado anexo (opcional)
        // ─────────────────────────────────────────────────────────────────────────────

        // 1) DOCUMENTOS (DNI) – dos celdas: Anverso / Reverso
        if (addDniClient) {
          // Render directo sin bucles para evitar problemas de buffers
          const cellWidthDNI = 250;
          const cellHeightDNI = 200;
          const paddingXDNI = 50;
          const titleHeightDNI = 20;
          const titlePaddingDNI = 5;
          const titleBoxHeightDNI = titleHeightDNI + titlePaddingDNI * 2;

          // Posicionar inmediatamente después del mapa (separación segura para no pisar el mapa)
          currentY -= 180;

          // Helper: pinta marco + título + imagen escalada dentro de la celda
          const drawDniCell = async (
            x: number,
            y: number,
            title: string,
            url: string,
          ) => {
            // Marco de la celda
            page.drawRectangle({
              x,
              y,
              width: cellWidthDNI,
              height: cellHeightDNI,
              borderWidth: 1,
              borderColor: rgb(0, 0, 0),
              color: rgb(1, 1, 1),
            });
            // Título
            const titleY = y + cellHeightDNI - titleBoxHeightDNI;
            page.drawLine({
              start: { x, y: titleY + titleBoxHeightDNI },
              end: { x: x + cellWidthDNI, y: titleY + titleBoxHeightDNI },
              thickness: 1,
              color: rgb(0, 0, 0),
            });
            const textW = helveticaBoldFont.widthOfTextAtSize(title, fontSize);
            page.drawText(title, {
              x: x + cellWidthDNI / 2 - textW / 2,
              y: titleY + titlePaddingDNI + 5,
              size: fontSize,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            page.drawLine({
              start: { x, y: titleY },
              end: { x: x + cellWidthDNI, y: titleY },
              thickness: 1,
              color: rgb(0, 0, 0),
            });

            if (!url) return;
            const embeddedImage: any = await this.embedImageFromSource(
              pdfDoc,
              url,
            );
            if (!embeddedImage) return;

            // Área disponible para imagen (debajo del título)
            const maxW = cellWidthDNI - 20;
            const maxH = cellHeightDNI - titleBoxHeightDNI - 20;
            const naturalW = embeddedImage.width || maxW;
            const naturalH = embeddedImage.height || maxH;
            const scale = Math.min(maxW / naturalW, maxH / naturalH);
            const targetW = Math.max(1, Math.floor(naturalW * scale));
            const targetH = Math.max(1, Math.floor(naturalH * scale));
            const imgX = x + (cellWidthDNI - targetW) / 2;
            const imgY = y + 10 + (maxH - targetH) / 2;
            page.drawImage(embeddedImage, {
              x: imgX,
              y: imgY,
              width: targetW,
              height: targetH,
            });
          };

          await drawDniCell(
            paddingXDNI,
            currentY,
            'Anverso DNI cliente',
            recipientIdentity.idFrontPhoto || '',
          );
          await drawDniCell(
            paddingXDNI + cellWidthDNI,
            currentY,
            'Reverso DNI cliente',
            recipientIdentity.idBackPhoto || '',
          );

          // Reducir espacio tras los DNI para acercar la selfie, sin solapar
          currentY -= cellHeightDNI + 10;
          const selfieData = [
            'Foto receptor del vehiculo',
            recipientIdentity.selfieWithId || '',
          ];
          // 2) SELFIE DEL RECEPTOR – celda a lo ancho con imagen centrada/escalada
          const titleHeight = 20;
          const titlePadding = 5;
          const cellWidthSelfie = 500;
          const cellHeightSelfie = 420;
          const xPosSelfie = 50; // Centrado si la página es de 600px con márgenes de 50 a cada lado

          const ySelfie = currentY - cellHeightSelfie + 170; // subir 150px para evitar espacio en blanco
          console.log('ySelfie', ySelfie);
          page.drawRectangle({
            x: xPosSelfie,
            y: ySelfie,
            width: cellWidthSelfie,
            height: cellHeightSelfie,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
            color: rgb(1, 1, 1),
          });
          const titleBoxHeightSelfie = titleHeight + titlePadding * 2;
          const titleYPosSelfie =
            ySelfie + cellHeightSelfie - titleBoxHeightSelfie;
          page.drawLine({
            start: { x: xPosSelfie, y: titleYPosSelfie + titleBoxHeightSelfie },
            end: {
              x: xPosSelfie + cellWidthSelfie,
              y: titleYPosSelfie + titleBoxHeightSelfie,
            },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
          const textWidthSelfie = helveticaBoldFont.widthOfTextAtSize(
            selfieData[0],
            fontSize,
          );
          page.drawText(selfieData[0], {
            x: xPosSelfie + cellWidthSelfie / 2 - textWidthSelfie / 2,
            y: titleYPosSelfie + titlePadding + 5,
            size: fontSize,
            font: helveticaBoldFont,
            color: rgb(0, 0, 0),
          });
          page.drawLine({
            start: { x: xPosSelfie, y: titleYPosSelfie },
            end: { x: xPosSelfie + cellWidthSelfie, y: titleYPosSelfie },
            thickness: 1,
            color: rgb(0, 0, 0),
          });
          // Cargar y dibujar la imagen de la selfie
          const wixImageUrlSelfie = selfieData[1];
          if (wixImageUrlSelfie) {
            const embeddedImage = await this.embedImageFromSource(
              pdfDoc,
              wixImageUrlSelfie,
            );
            if (embeddedImage) {
              // Calcular área disponible bajo el título para evitar solapamiento
              const maxW = cellWidthSelfie - 20;
              const maxH = cellHeightSelfie - titleBoxHeightSelfie - 20;
              const naturalW = (embeddedImage as any).width || maxW;
              const naturalH = (embeddedImage as any).height || maxH;
              const scale = Math.min(maxW / naturalW, maxH / naturalH);
              const targetW = Math.max(1, Math.floor(naturalW * scale));
              const targetH = Math.max(1, Math.floor(naturalH * scale));
              const imgX = xPosSelfie + (cellWidthSelfie - targetW) / 2;
              const imgY = ySelfie + 10 + (maxH - targetH) / 2;

              page.drawImage(embeddedImage, {
                x: imgX,
                y: imgY,
                width: targetW,
                height: targetH,
              });
            } else {
              console.warn(`No se pudo incrustar imagen para ${selfieData[0]}`);
            }
          } else {
            console.warn(`No hay imagen disponible para ${selfieData[0]}`);
          }
          currentY = ySelfie - 50; // actualizar base para firmas manteniendo el nuevo offset
        } // Fin de bloque DNI
        // 3) BLOQUE DE FIRMAS – marcos superior/inferior y divisor central (si aplica)
        const signBlockHeight = 140;
        const signImageWidth = 240;
        const signImageHeight = 100;
        const ySign = currentY - signImageHeight - 20; // base para imágenes
        const topLineY = ySign + signImageHeight + 25; // compacto, sin tocar imágenes

        // Firma cliente
        const clientSignatureSource = addDniClient
          ? handoverDocuments?.client_signature
          : travel?.signatureStartClient;
        const clientPng =
          typeof clientSignatureSource === 'string' &&
          clientSignatureSource.includes(',')
            ? clientSignatureSource.split(',')[1]
            : null;
        if (clientPng) {
          const img = await pdfDoc.embedPng(Buffer.from(clientPng, 'base64'));
          page.drawImage(img, {
            x: 60,
            y: ySign,
            width: signImageWidth,
            height: signImageHeight,
          });
        }

        // Firma chofer
        if (addBothSignature) {
          const droverSignatureSource = handoverDocuments?.drover_signature;
          const droverPng =
            typeof droverSignatureSource === 'string' &&
            droverSignatureSource.includes(',')
              ? droverSignatureSource.split(',')[1]
              : null;
          if (droverPng) {
            const img = await pdfDoc.embedPng(Buffer.from(droverPng, 'base64'));
            page.drawImage(img, {
              x: 350,
              y: ySign,
              width: signImageWidth,
              height: signImageHeight,
            });
          }
        }

        // Marco del bloque de firmas (top/bottom + divisor central)
        page.drawLine({
          start: { x: 50, y: topLineY },
          end: { x: 550, y: topLineY },
          thickness: 2,
          color: rgb(0, 0, 0),
        });

        const labelY = ySign - 18; // posición del texto de etiqueta
        const bottomLineY = labelY - 16; // reducir gap inferior

        // Etiquetas
        page.drawText('Firma del cliente', {
          x: 100,
          y: labelY,
          size: 13,
          font: font,
          color: rgb(0, 0, 0),
        });
        if (addBothSignature) {
          page.drawText('Firma del chofer', {
            x: 390,
            y: labelY,
            size: 13,
            font: font,
            color: rgb(0, 0, 0),
          });
        }

        // Línea superior inmediatamente sobre el texto de las firmas
        const captionTopLineY = labelY + 14;
        page.drawLine({
          start: { x: 50, y: captionTopLineY },
          end: { x: 550, y: captionTopLineY },
          thickness: 2,
          color: rgb(0, 0, 0),
        });

        // Línea inferior
        page.drawLine({
          start: { x: 50, y: bottomLineY },
          end: { x: 550, y: bottomLineY },
          thickness: 2,
          color: rgb(0, 0, 0),
        });

        // Divisor central
        if (addBothSignature) {
          page.drawLine({
            start: { x: 300, y: topLineY },
            end: { x: 300, y: bottomLineY },
            thickness: 3,
            color: rgb(0, 0, 0),
          });
        }

        currentY = bottomLineY - 21; // bajar 15px extra para separar más el texto de la línea

        // 4) TEXTO LEGAL FINAL
        page.drawText(
          'Ambas partes confirman la recepción segura del vehículo en destino, según lo indicado en este',
          { x: 60, y: currentY, size: 12, font: font, color: rgb(0, 0, 0) },
        );
        currentY -= 15;
        page.drawText('documento de confirmación emitido a través de DROVE®', {
          x: 60,
          y: currentY,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
        currentY -= 20;

        // 5) FECHA DE EMISIÓN DEL DOCUMENTO
        currentY -= 10;
        const formattedDate = new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        page.drawText(`Fecha de emisión del documento: ${formattedDate}`, {
          x: 60,
          y: currentY,
          size: 9,
          font: font,
          color: rgb(0, 0, 0),
        });

        // 6) CERTIFICADO/ANEXO (opcional)
        if (addDniClient && handoverDocuments?.delivery_document) {
          const embeddedImage = await this.embedImageFromSource(
            pdfDoc,
            handoverDocuments.delivery_document,
          );
          if (embeddedImage) {
            const certHeight = 680;
            // Posicionar inmediatamente bajo el flujo, sin solapar, dejando margen 10px
            const yCert = Math.max(50, currentY - certHeight - 10);
            page.drawImage(embeddedImage, {
              x: 50,
              y: yCert,
              width: 500,
              height: certHeight,
            });
            currentY = yCert - 10;
            // 6.1) Justificante de combustible (si existe) inmediatamente debajo del certificado
            if (mustAddFuelReceipt && handoverDocuments?.fuel_receipt) {
              const fuelImg = await this.embedImageFromSource(
                pdfDoc,
                handoverDocuments.fuel_receipt,
              );
              if (fuelImg) {
                // Mantener diseño: misma anchura, altura fija y separación de 10px
                const fuelHeight = 560; // altura objetivo
                const yFuel = Math.max(50, currentY - fuelHeight - 10);
                page.drawImage(fuelImg, {
                  x: 50,
                  y: yFuel,
                  width: 500,
                  height: fuelHeight,
                });
                currentY = yFuel - 10;
              }
            }
          } else {
            console.error(
              'Error incrustando delivery_document: formato/URL no soportado',
            );
          }
        }
      } else {
        if (addDniClient) {
          const datosImagenesDNICliente: [string, string][] = [
            ['Anverso DNI cliente', recipientIdentity.idFrontPhoto || ''],
            ['Reverso DNI cliente', recipientIdentity.idBackPhoto || ''],
          ];
          console.log('datosImagenesDNICliente', datosImagenesDNICliente);
          const imagesPerRowDNI = 2;
          const cellWidthDNI = 250;
          const cellHeightDNI = 200;
          const imageWidthDNI = cellWidthDNI - 20;
          const imageHeightDNI = 150;
          const paddingXDNI = 50;
          const titleHeightDNI = 20;
          const titlePaddingDNI = 5;
          let xPositionDNI = paddingXDNI;
          currentY -= 500;
          for (let i = 0; i < datosImagenesDNICliente.length; i++) {
            const [description, wixImageUrl] = datosImagenesDNICliente[i];
            console.log('agregando wixImageUrl', wixImageUrl);
            page.drawRectangle({
              x: xPositionDNI,
              y: currentY,
              width: cellWidthDNI,
              height: cellHeightDNI,
              borderWidth: 1,
              borderColor: rgb(0, 0, 0),
              color: rgb(1, 1, 1),
            });
            const titleBoxHeightDNI = titleHeightDNI + titlePaddingDNI * 2;
            const titleYPositionDNI =
              currentY + cellHeightDNI - titleBoxHeightDNI;
            page.drawLine({
              start: {
                x: xPositionDNI,
                y: titleYPositionDNI + titleBoxHeightDNI,
              },
              end: {
                x: xPositionDNI + cellWidthDNI,
                y: titleYPositionDNI + titleBoxHeightDNI,
              },
              thickness: 1,
              color: rgb(0, 0, 0),
            });
            const textWidthDNI = helveticaBoldFont.widthOfTextAtSize(
              description,
              fontSize,
            );
            page.drawText(description, {
              x: xPositionDNI + cellWidthDNI / 2 - textWidthDNI / 2,
              y: titleYPositionDNI + titlePaddingDNI + 5,
              size: fontSize,
              font: helveticaBoldFont,
              color: rgb(0, 0, 0),
            });
            page.drawLine({
              start: { x: xPositionDNI, y: titleYPositionDNI },
              end: { x: xPositionDNI + cellWidthDNI, y: titleYPositionDNI },
              thickness: 1,
              color: rgb(0, 0, 0),
            });
            if (wixImageUrl) {
              const embeddedImage = await this.embedImageFromSource(
                pdfDoc,
                wixImageUrl,
              );
              if (embeddedImage) {
                page.drawImage(embeddedImage, {
                  x: xPositionDNI + 10,
                  y: currentY + 10,
                  width: imageWidthDNI,
                  height: imageHeightDNI,
                });
              } else {
                console.warn(`No se pudo incrustar imagen para ${description}`);
              }
            } else {
              console.warn(`No hay imagen disponible para ${description}`);
            }
            xPositionDNI += cellWidthDNI;
            if (
              (i + 1) % imagesPerRowDNI === 0 &&
              i !== datosImagenesDNICliente.length - 1
            ) {
              xPositionDNI = paddingXDNI;
              currentY -= cellHeightDNI;
            }
          }
          currentY -= 20;
        }
        currentY = currentY - (step === 4 ? 0 : 300);
        page.drawLine({
          start: { x: 50, y: 437 },
          end: { x: 550, y: 437 },
          thickness: 2,
          color: rgb(0, 0, 0),
        });
        currentY -= 20;
        const clientSignatureSource2 = addDniClient
          ? handoverDocuments?.client_signature
          : travel?.signatureStartClient;
        const pngImageBytes =
          typeof clientSignatureSource2 === 'string' &&
          clientSignatureSource2.includes(',')
            ? clientSignatureSource2.split(',')[1]
            : null;
        if (pngImageBytes) {
          const signatureClientImage = await pdfDoc.embedPng(
            Buffer.from(pngImageBytes, 'base64'),
          );
          const xSignature = addBothSignature ? 0 : 140;
          page.drawImage(signatureClientImage, {
            x: xSignature,
            y: 280,
            width: 300,
            height: 100,
          });
        }
        currentY = 265;
        page.drawLine({
          start: { x: 50, y: currentY },
          end: { x: 550, y: currentY },
          thickness: 2,
          color: rgb(0, 0, 0),
        });
        currentY -= 32;
        page.drawText('Firma del cliente', {
          x: addBothSignature ? 130 : 240,
          y: currentY,
          size: 13,
          font: font,
          color: rgb(0, 0, 0),
        });
        page.drawLine({
          start: { x: 50, y: currentY - 30 },
          end: { x: 550, y: currentY - 30 },
          thickness: 2,
          color: rgb(0, 0, 0),
        });
        if (addBothSignature) {
          page.drawLine({
            start: { x: 300, y: 437 },
            end: { x: 300, y: 203 },
            thickness: 3,
            color: rgb(0, 0, 0),
          });
          const droverSignatureSource2 = handoverDocuments?.drover_signature;
          const pngImageBytesChofer =
            typeof droverSignatureSource2 === 'string' &&
            droverSignatureSource2.includes(',')
              ? droverSignatureSource2.split(',')[1]
              : null;
          if (pngImageBytesChofer) {
            const signatureClientImageChofer = await pdfDoc.embedPng(
              Buffer.from(pngImageBytesChofer, 'base64'),
            );
            page.drawImage(signatureClientImageChofer, {
              x: 290,
              y: 280,
              width: 280,
              height: 100,
            });
          }
          page.drawText('Firma del chofer', {
            x: 375,
            y: 230,
            size: 13,
            font: font,
            color: rgb(0, 0, 0),
          });
          currentY -= 50;
          page.drawText(
            'Ambas partes confirman el inicio del traslado del vehículo desde el punto de recogida hasta el ',
            { x: 60, y: currentY, size: 12, font: font, color: rgb(0, 0, 0) },
          );
          currentY -= 15;
          page.drawText(
            'punto de entrega, solicitado por el cliente y aceptado por el chofer, según lo indicado en este ',
            { x: 60, y: currentY, size: 12, font: font, color: rgb(0, 0, 0) },
          );
          currentY -= 15;
          page.drawText(
            'documento de confirmación emitido a través de DROVE®',
            {
              x: 60,
              y: currentY,
              size: 12,
              font: font,
              color: rgb(0, 0, 0),
            },
          );
        } else {
          currentY -= 60;
          page.drawText(
            'Confirmo que el dia de hoy solicité un traslado del vehículo nombrado en este documento,',
            { x: 60, y: currentY, size: 12, font: font, color: rgb(0, 0, 0) },
          );
          currentY -= 15;
          page.drawText('por medio de DROVE®', {
            x: 60,
            y: currentY,
            size: 12,
            font: font,
            color: rgb(0, 0, 0),
          });
          currentY -= 55;
          page.drawLine({
            start: { x: 50, y: currentY },
            end: { x: 550, y: currentY },
            thickness: 8,
            color: rgb(0, 0, 0),
          });
        }
        currentY -= 30;
        const formattedDate = new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        page.drawText(`Fecha de emisión del documento: ${formattedDate}`, {
          x: 60,
          y: currentY,
          size: 9,
          font: font,
          color: rgb(0, 0, 0),
        });
      }

      const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
      const dataUriPrefix = 'data:application/pdf;base64,';
      const base64 = pdfDataUri.slice(dataUriPrefix.length);
      const fileName = `${travel._id}_${detailInfo === 'chofer' ? 'viewClient' : 'viewDrover'}_${step}`;
      const UrlPdf = await this.savePDF(base64, fileName, travel._id);
      return UrlPdf;
    } catch (e) {
      console.log(e);
      return { message: `error ${e}` };
    }
  }

  /**
   * Función para devolver el detalle según el tipo de documento.
   */
  getDetailText(
    detailInfo: string,
    droverDetail: any,
    personDelivery: any,
    personReceive: any,
  ): any {
    switch (detailInfo) {
      case 'delivery':
        return {
          title: 'Nombre de quien entrega el vehículo:',
          nameKey: personDelivery.fullName,
          phoneKey: personDelivery.phone,
        };
      case 'reception':
        return {
          title: 'Nombre del receptor:',
          nameKey: personReceive.fullName,
          phoneKey: personReceive.phone,
        };
      case 'chofer':
      default: {
        const computedName =
          droverDetail?.contactInfo?.fullName ||
          droverDetail?.full_name ||
          droverDetail?.name ||
          droverDetail?.contactInfo?.info?.extendedFields?.items?.[
            'custom.fullname'
          ] ||
          droverDetail?.contactInfo?.info?.extendedFields?.items?.[
            'contacts.displayByFirstName'
          ] ||
          droverDetail?.detailRegister?.name ||
          'Nombre Chofer';
        const phonesArray = droverDetail?.contactInfo?.phones;
        const computedPhone =
          droverDetail?.contactInfo?.phone ||
          (Array.isArray(phonesArray) ? phonesArray[0] : undefined) ||
          droverDetail?.phone ||
          (Array.isArray(droverDetail?.detailRegister?.phones)
            ? droverDetail?.detailRegister?.phones?.[0]
            : droverDetail?.detailRegister?.phones) ||
          'Sin teléfono';
        return {
          title: 'Nombre del chofer:',
          nameKey: String(computedName),
          phoneKey: String(computedPhone),
        };
      }
    }
  }

  /**
   * Genera el PDF de factura (simplificado).
   */
  async generatePDFInvoice(): Promise<any> {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      const fontSize = 30;
      page.drawText('Informe entrega', {
        x: 50,
        y: height - 4 * fontSize,
        size: fontSize,
        font: font,
        color: rgb(0, 0, 0),
      });
      const pdfDataUri = await pdfDoc.saveAsBase64({ dataUri: true });
      const dataUriPrefix = 'data:application/pdf;base64,';
      const base64 = pdfDataUri.slice(dataUriPrefix.length);
      const UrlPdf = await this.savePDF(base64, 'factura');
      return UrlPdf;
    } catch (error) {
      console.log(error);
      return { message: `error ${error}` };
    }
  }

  /**
   * Simula la subida del PDF a un servicio de almacenamiento y retorna una URL de descarga.
   */
  async savePDF(
    base64: string,
    fileName: string,
    travelId?: string,
  ): Promise<string> {
    const file = await this.uploadPDF(base64, fileName, travelId);
    // Retornamos la URL de S3 directamente
    return file.filePath;
  }

  /**
   * Función simulada para subir el PDF (aquí deberás integrar tu solución real, por ejemplo, AWS S3).
   */
  async uploadPDF(
    base64: string,
    fileName: string,
    travelId?: string,
  ): Promise<{ filePath: string }> {
    try {
      const bucketName =
        this.configService.get<string>('MINIO_BUCKET') ||
        this.configService.get<string>('AWS_S3_BUCKET') ||
        'drove-pdf';
      const timestamp = this.formatDateForFilename(new Date());
      // Si se proporciona travelId, se usará como carpeta (prefijo)
      const key = travelId
        ? `${travelId}/${fileName}/${timestamp}.pdf`
        : `${fileName}.pdf`;

      // Convertimos la cadena base64 a un Buffer
      const buffer = Buffer.from(base64, 'base64');

      // Subimos el objeto a S3
      await this.s3client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'application/pdf',
        }),
      );

      // Construimos la URL pública del objeto (asegúrate de que tu bucket u objetos sean de lectura pública)
      const configuredEndpoint =
        this.configService.get<string>('MINIO_ENDPOINT') ||
        this.configService.get<string>('S3_ENDPOINT');
      const endpoint = configuredEndpoint
        ? configuredEndpoint.replace(/\/$/, '')
        : `https://${bucketName}.s3.${process.env.AWS_REGION || this.configService.get<string>('AWS_REGION') || 'eu-west-2'}.amazonaws.com`;
      const fileUrl = `${endpoint}/${bucketName}/${key}`;
      return { filePath: fileUrl };
    } catch (error) {
      console.error('Error al guardar el PDF en S3:', error);
      throw new InternalServerErrorException('Error al guardar el PDF');
    }
  }

  formatDateForFilename(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}/${month}/${year}_${hours}:${minutes}:${seconds}`;
  }

  /**
   * Función simulada para obtener la URL de descarga.
   */
  getDownloadUrl(filePath: string): string {
    const fileName = path.basename(filePath);
    const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
    return `${baseUrl}/pdf/${fileName}`;
  }

  /**
   * Obtiene los datos de un usuario a partir de su ID.
   */
  async getUser(idUser: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { id: idUser } });
      return user;
    } catch (e) {
      return null;
    }
  }

  async getTravel(travelId: string): Promise<any> {
    try {
      const travel = await this.travelsRepository.findOne({
        where: { id: travelId } as FindOptionsWhere<Travels>,
        relations: this.defaultRelations,
      });
      return travel;
    } catch (error) {
      return null;
    }
  }

  async getMemberById(id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve({
          id: id,
          name: 'John Doe',
          email: '',
        });
      }, 1000); // Se espera 1 segundo antes de resolver la promesa
    });
  }

  /**
   * Normaliza un string de tiempo a formato 12 horas.
   */
  normalizeTime(time: any): string {
    // 1. Manejo de nulos/undefined de forma rápida (puedes retornar '' o lanzar un error)
    if (time == null) {
      // return ''; // O si prefieres lanzar un error:
      throw new Error('El valor de "time" es nulo o indefinido.');
    }

    // 2. Manejo de objetos con $date
    if (typeof time === 'object') {
      if ('$date' in time) {
        time = time.$date;
      } else if (time instanceof Date) {
        // ya es instancia de Date, la convertimos a cadena ISO
        time = time.toISOString();
      } else {
        // Si es un objeto sin $date y no es una instancia de Date
        // decidimos si lanzamos error o simplemente lo ignoramos
        throw new Error('No se reconoce la estructura del objeto para "time".');
      }
    }

    // 3. Manejo de timestamps numéricos (en milisegundos o segundos)
    if (typeof time === 'number') {
      // Un timestamp pequeño es probablemente segundos => convertir a ms
      if (time < 1e12) {
        time *= 1000;
      }
      time = new Date(time).toISOString();
    }

    // 4. Asegurarnos de que a estas alturas sea un string
    if (typeof time !== 'string') {
      throw new Error(
        'El formato de "time" no es válido. Se esperaba un string, un número o un objeto con "$date".',
      );
    }

    // 5. Eliminar espacios en blanco alrededor (por si llega " 14:30:00.000 ")
    time = time.trim();

    // 6. Regex para formatos de hora simples: "HH:MM", "HH:MM:SS", "HH:MM:SS.sss"
    const timeOnlyRegex = /^\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?$/;
    let hours: number;
    let minutes: number;

    if (timeOnlyRegex.test(time)) {
      // Manejo directo de "HH:MM" o "HH:MM:SS(.sss)"
      const [hh, mm] = time.split(':');
      hours = parseInt(hh, 10);
      minutes = parseInt(mm, 10);
    } else {
      // 7. Regex para formato ISO 8601 completo
      const isoRegex =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|(\+\d{2}:\d{2}))?$/;

      if (isoRegex.test(time)) {
        // Parseo directo con new Date()
        const date = new Date(time);
        if (isNaN(date.getTime())) {
          throw new Error('El formato de tiempo con ISO no pudo ser parseado.');
        }
        hours = date.getHours();
        minutes = date.getMinutes();
      } else {
        // 8. Fallback: Intentar parsear con new Date() (por si es algo como "Mar 07 2025 14:30:00", etc.)
        const parsedDate = new Date(time);
        if (!isNaN(parsedDate.getTime())) {
          hours = parsedDate.getHours();
          minutes = parsedDate.getMinutes();
        } else {
          // 9. Si llegamos aquí, ya no se pudo interpretar
          throw new Error(
            'El formato de tiempo no es válido. Se esperaba "HH:MM:SS.sss", "HH:MM", ISO 8601 o algo parseable por Date().',
          );
        }
      }
    }

    // 10. Convertir a formato 12 horas
    const period = hours >= 12 ? 'PM' : 'AM';
    const normalizedHours = hours % 12 || 12;
    const normalizedMinutes = String(minutes).padStart(2, '0');

    return `${normalizedHours}:${normalizedMinutes} ${period}`;
  }

  metersToKilometers(meters: number): string {
    return `${(meters / 1000).toString()}`;
  }

  /**
   * Obtiene el mapa y los datos de la ruta usando el servicio de rutas.
   */
  async getRouteMap(origin: any, destination: any): Promise<any> {
    const obj = {
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      },
      destination: {
        location: {
          latLng: { latitude: destination.lat, longitude: destination.lng },
        },
      },
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE_OPTIMAL',
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false,
      },
      languageCode: 'en-US',
      units: 'IMPERIAL',
    };
    try {
      const res = await this.routesService.getRoutes(obj);
      if (res?.error?.code === 400) {
        return { error: 'Error de solicitud: Código 400' };
      }
      if (!res.routes || res.routes.length === 0) {
        return {
          error: 'No se encontraron rutas para los parámetros proporcionados.',
        };
      }
      const distanceInSeg = res.routes[0].distanceMeters;
      const time = res.routes[0].duration;
      const DistanceInKM = this.metersToKilometers(distanceInSeg);
      const priceResult = await this.priceService.getPrice(DistanceInKM);
      return { priceResult, polyline: res.routes[0].polyline, DistanceInKM };
    } catch (error) {
      console.error('Error al obtener la ruta:', error);
      return { error: 'Ocurrió un error al obtener la ruta.' };
    }
  }

  /**
   * Obtiene una imagen de mapa con la ruta trazada usando la API estática de Google Maps.
   */
  async getMapImageWithRoute(
    origin: any,
    destination: any,
    polyline: string,
    zoom = 10,
    width = 600,
    height = 400,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    const safePolyline = encodeURIComponent(polyline);
    const url = `https://maps.googleapis.com/maps/api/staticmap?size=${width}x${height}&zoom=${zoom}&markers=color:red%7C${origin.lat},${origin.lng}&markers=color:green%7C${destination.lat},${destination.lng}&path=enc:${safePolyline}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const base64Image = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64Image}`;
    } catch (error) {
      console.error('Error al obtener la imagen del mapa:', error);
      throw error;
    }
  }

  /**
   * Obtiene una imagen de mapa centrada en una latitud y longitud.
   */
  async getMapImage(
    lat: number,
    lng: number,
    zoom = 15,
    width = 600,
    height = 400,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Google Maps API error: ${response.status} ${response.statusText}`,
        );
      }
      const arrayBuffer = await response.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      const base64Image = imageBuffer.toString('base64');
      return `data:image/png;base64,${base64Image}`;
    } catch (error) {
      console.error('Error al obtener la imagen del mapa:', error);
      throw error;
    }
  }
}
