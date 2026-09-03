import type { UserProfile } from '../domain/model';

export type IdentityState =
  | { status: 'guest' }
  | { status: 'signed-in'; profile: UserProfile };

/**
 * Identidad y sincronizacion.
 *
 * En la web esto lo cumple Firebase. En el movil puede ser Firebase tambien, o
 * el inicio de sesion nativo de la plataforma. El nucleo no distingue: pide
 * saber quien es la persona y, si procede, que sus datos viajen entre
 * dispositivos.
 *
 * Que la sincronizacion sea opcional es intencionado: la app tiene que
 * funcionar entera sin cuenta, y sincronizar es un anadido, no un requisito.
 */
export interface IdentityProvider {
  current(): Promise<IdentityState>;
  signIn(): Promise<IdentityState>;
  signOut(): Promise<void>;
  syncNow?(): Promise<void>;
}
