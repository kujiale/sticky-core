export const OBFUSCATED_ERROR =
  'An invariant failed, however the error is obfuscated because this is an production build.';

export function invariant(check: boolean, message?: string | boolean) {
  if (!check) throw new Error('[@tacky/store]: ' + (message || OBFUSCATED_ERROR));
}

export function fail(message: string | boolean): never {
  invariant(false, message);
  throw 'X';
}
