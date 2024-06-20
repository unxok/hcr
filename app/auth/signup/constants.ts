export const validationMessages = [
  "Password must contain at least one number",
  "Password must contain at least one letter",
  "Password must contain at least one uppercase",
  "Password must contain at least one symbol",
] as const;

export const namedValidationMessages = {
  ONE_NUMBER: validationMessages[0],
  ONE_LETTER: validationMessages[1],
  ONE_UPPER: validationMessages[2],
  ONE_SYMBOL: validationMessages[3],
};
