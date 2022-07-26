const prefix = 'Invariant failed';
export const invariant = (condition: any, message?: string | (() => string), expendMessage?: any) => {
  if (condition) {
    return;
}
  var provided = typeof message === 'function' ? message() : message;
  var value = provided ? prefix + ": " + provided : prefix;
  if (expendMessage !== undefined) {
    console.log(value, expendMessage);
  }
  throw new Error(value);
}