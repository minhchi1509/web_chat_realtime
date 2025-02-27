import { Transform } from 'class-transformer';

interface IToBooleanOptions {
  each?: boolean;
}

const acceptedParseToBoolean = [true, false, 'true', 'false', 0, 1];

export const ToBoolean = (options?: IToBooleanOptions) => {
  return Transform(({ value }) => {
    if (Array.isArray(value) && options?.each) {
      return value.map((item) => {
        if (acceptedParseToBoolean.includes(item)) {
          return item === 'false' ? false : Boolean(item);
        }
        return item;
      });
    }
    if (acceptedParseToBoolean.includes(value)) {
      return value === 'false' ? false : Boolean(value);
    }
    return value;
  });
};
