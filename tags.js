import { plainToClass } from 'class-transformer';

export default class Tag {
  constructor(text) {
    this.text = text;
    this.color = "#46525D";
    this.icon = undefined;
    this.global = true;
    this.version = 1;
    this.data = undefined;
  }

  static fromPlain(plain) {
    if (typeof plain === 'string' || plain instanceof String) {
      try {
        plain = JSON.parse(plain);
      } catch (error) {
        return undefined;
      }
    }
    const t = plainToClass(Tag, plain);
    return t;
  }
}
