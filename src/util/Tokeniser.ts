import { Char } from "./Char";
import { Token, TokenType } from "../domain/Token";
import { Buffer } from './Buffer';

export class Tokeniser {

  readonly src: string;
  readonly tokens: Token[];
  i: number;
  buffer: Buffer;

  constructor(src: string) {
    this.src = src;
    this.i = 0;
    this.buffer = new Buffer();
    this.tokens = [];
  }

  getTokens() {
    return this.tokens;
  }

  reset() {
    this.buffer.clear();
    this.tokens.splice(0, this.tokens.length);
    this.i = 0;
  }

  tokenise() {
    this.reset();
    while (!this.peek().isEof()) {
      if (this.peek().isAlpha()) {
        this.buffer.push(this.consume());
        while (this.peek().isAlphaNumeric()) {
          this.buffer.push(this.consume());
        }
        if (this.buffer.equals('return')) {
          this.tokens.push({ type: TokenType.RETURN });
        } else {
          this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString() })
        }
        this.buffer.clear();
      } else if (this.peek().isSpace()) {
        this.consume();
      } else if (this.peek().isNumeric()) {
        while (this.peek().isNumeric()) {
          this.buffer.push(this.consume());
        }
        this.tokens.push({ type: TokenType.INT_LIT, value: this.buffer.toString() });
        this.buffer.clear();
      } else if (this.peek().equals(';')) {
        this.tokens.push({ type: TokenType.SEMI });
        this.consume();
      } else if (this.peek().equals('(')) {
        this.tokens.push({ type: TokenType.L_PAREN });
        this.consume();
      } else if (this.peek().equals(')')) {
        this.tokens.push({ type: TokenType.R_PAREN });
        this.consume();
      } else if (this.peek().equals('[')) {
        this.tokens.push({ type: TokenType.L_BRACKET });
        this.consume();
      } else if (this.peek().equals(']')) {
        this.tokens.push({ type: TokenType.R_BRACKET });
        this.consume();
      } else if (this.peek().equals('{')) {
        this.tokens.push({ type: TokenType.L_BRACE });
        this.consume();
      } else if (this.peek().equals('}')) {
        this.tokens.push({ type: TokenType.R_BRACE });
        this.consume();
      }
    }
  }

  peek(at: number = 0): Char {
    const c = this.src[this.i + at];
    if (c === undefined) {
      return new Char('•');
    }
    return new Char(c);
  }

  consume(): Char {
    this.i++;
    return this.peek(-1);
  }
}