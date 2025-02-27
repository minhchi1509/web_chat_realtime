import { Transform } from 'class-transformer';

interface ITrimOptions {
  each?: boolean;
}

export const Trim = (options?: ITrimOptions) => {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (Array.isArray(value) && options?.each) {
      return value.map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }
        return item;
      });
    }
    return value;
  });
};
