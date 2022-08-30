import { z } from 'zod';

export const zConst = z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/);
export const zDexNumber = z.number().nonnegative().lte(9999);
export const zAddress = z.number().gte(0x8000000);
export const zUByte = z.number().nonnegative().lte(255);
export const zLevel = z.number().nonnegative().lte(100);
