export class Char {
  readonly char: string;
  constructor(char: string) {
    if (char.length !== 1) {
      throw new Error(`${char} is not a single letter`);
    }
    this.char = char;
  }

  toString(): string {
    return this.char;
  }

  toUpperCase(): string {
    return this.char?.toUpperCase();
  }

  toLowerCase(): string {
    return this.char?.toLowerCase();
  }

  isEoF(): boolean {
    return this.equals('•');
  }

  isAlpha(): boolean {
    return alphabet.includes(this.char);
  }

  isNumeric(): boolean {
    return numbers.includes(this.char);
  }

  isAlphaNumeric(): boolean {
    return this.isAlpha() || this.isNumeric();
  }

  isQuote(): boolean {
    return this.equals('"') || this.equals("'");
  }

  isSpace(): boolean {
    return this.equals(' ');
  }

  isNewLine(): boolean {
    return this.equals('\n');
  }

  isWhiteSpace(): boolean {
    return this.isSpace() || this.equals('\t');
  }

  equals(value: string): boolean {
    return this.char === value;
  }
}


let alpha = 'abcdefghijklmnopqrstuvwxyz';
alpha += alpha.toUpperCase();
const alphabet = alpha.split('');
const numbers = '0123456789'.split('');