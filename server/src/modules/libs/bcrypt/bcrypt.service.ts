import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  public hash = async (value: string) => {
    const salt = await bcrypt.genSalt();
    const hashedValue = await bcrypt.hash(value, salt);
    return hashedValue;
  };

  public isMatch = async (value: string, hashedValue: string) => {
    const isMatch = await bcrypt.compare(value, hashedValue);
    return isMatch;
  };
}
