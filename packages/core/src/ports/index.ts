// Puertos: lo que el nucleo NECESITA del mundo exterior, dicho como interfaz.
//
// Ninguno menciona localStorage, Firebase, fetch ni un proveedor concreto de
// IA. Esa es la frontera: dentro se decide que hace falta, fuera se decide con
// que se cumple. Un adaptador vive en la app que lo implementa, nunca aqui.
export * from './storage.port';
export * from './clock.port';
export * from './reflection.port';
export * from './identity.port';
