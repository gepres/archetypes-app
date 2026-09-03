// Nucleo de dominio de Arquetipos: puro, sin framework, sin navegador.
//
// La regla de dependencia se hace cumplir en tsconfig.json, no en una convencion:
// este paquete compila con lib ES2022 y sin DOM, asi que un window o un
// localStorage aqui dentro es un error de compilacion, no un descuido que
// alguien tiene que cazar en una revision.
export * from './domain';
export * from './application';
export * from './ports';
