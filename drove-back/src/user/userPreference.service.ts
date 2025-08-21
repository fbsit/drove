// src/user/preferences/preferences.service.ts
// -------------------------------------------------
// Servicio para leer/guardar las preferencias del usuario
// y devolverlas siempre “completas” con valores por defecto.
// -------------------------------------------------

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserPreferences } from './entities/preferenceUser.entity';
import { UpdatePreferencesDto } from './dtos/update-preferences.dto';

/**
 * Pequeño helper de fusión profunda sin dependencias externas.
 *  - Si la clave existe en ambos objetos y ambos valores son objetos,
 *    los fusiona recursivamente.
 *  - En cualquier otro caso sobrescribe el valor de destino.
 */
function deepMerge<T>(target: any, source: any): T {
  for (const key of Object.keys(source ?? {})) {
    const srcVal = source[key];
    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal)
    ) {
      target[key] = deepMerge(target[key] ?? {}, srcVal);
    } else {
      target[key] = srcVal;
    }
  }
  return target;
}

@Injectable()
export class PreferenceService {
  constructor(
    @InjectRepository(UserPreferences)
    private readonly repo: Repository<UserPreferences>,
  ) {}

  /** Valores por defecto para todas las categorías de ajustes */
  private readonly DEFAULT_SETTINGS = {
    email: {
      newTransfers: false,
      droverUpdates: false,
      paymentAlerts: false,
      systemUpdates: false,
      weeklyReports: false,
    },
    push: {
      urgentAlerts: false,
      newSignups: false,
      transfersCompleted: false,
      lowBalance: false,
    },
    dashboard: {
      realtimeUpdates: false,
      soundFx: false,
      popupNotifications: false,
    },
    profile: {
      showOnline: false,
      searchable: false,
      showRecentActivity: false,
    },
    dataUsage: {
      shareAnalytics: false,
      allowNonEssentialCookies: false,
      extendedRetention: false,
    },
    security: {
      twoFactorAuth: false,
      loginAlerts: false,
      autoLogout: false,
    },
  };

  /* ---------------------------------------------------------- */
  /* GET  /preferences                                          */
  /* ---------------------------------------------------------- */
  async get(userId: string) {
    const pref =
      (await this.repo.findOne({ where: { userId } })) ??
      this.repo.create({ userId, settings: {} });

    // Devuelve objeto completo ⇒ defaults + lo almacenado en BD
    return deepMerge(structuredClone(this.DEFAULT_SETTINGS), pref.settings);
  }

  /* ---------------------------------------------------------- */
  /* PATCH  /preferences                                        */
  /* ---------------------------------------------------------- */
  async update(userId: string, dto: UpdatePreferencesDto) {
    // Carga (o crea en memoria) el documento
    const current =
      (await this.repo.findOne({ where: { userId } })) ??
      this.repo.create({ userId, settings: {} });

    // Fusiona el payload con lo existente
    current.settings = deepMerge(current.settings, dto);

    // Persiste y devuelve la versión completa (con defaults)
    await this.repo.save(current);
    return this.get(userId);
  }
}
