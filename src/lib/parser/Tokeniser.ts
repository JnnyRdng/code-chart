import { Char } from "./Char";
import { Token, TokenType } from "../domain/Token";
import { Buffer } from './Buffer';

export class Tokeniser {

  readonly src: string;
  readonly tokens: Token[];
  i: number;
  buffer: Buffer;

  ln: number;
  col: number;

  constructor(src: string) {
    this.src = src;
    this.i = 0;
    this.buffer = new Buffer();
    this.tokens = [];

    this.ln = 1;
    this.col = 1;
  }

  getTokens() {
    return this.tokens;
  }

  reset() {
    this.buffer.clear();
    this.tokens.splice(0, this.tokens.length);
    this.i = 0;
    this.ln = 1;
    this.col = 1;
  }

  tokenise() {
    this.reset();
    while (!this.peek().isEoF()) {
      const nextChar = this.peek();
      if (nextChar.isQuote()) {
        this.#handleQuote();
      } else if (nextChar.isBacktick()) {
        this.#handleBacktick();
      } else if (nextChar.isAlphaNumeric()) {
        this.#handleAlphaNumeric();
      } else if (nextChar.equals('=')) {
        this.#handleEquals();
      } else if (nextChar.equals(';')) {
        this.#handleSemi();
      } else if (nextChar.equals('/')) {
        this.#handleForwardSlash();
      } else if (nextChar.equals('\\')) {
        this.#handleBackSlash();
      } else if (nextChar.isOneOf(['(', ')', '{', '}', '[', ']'])) {
        this.#handleBracket();
      } else {
        // Next Char is whitespace, newline, or unrecognised.
        this.consume();
      }
      this.buffer.clear();
    }
  }

  #handleQuote() {
    const pos = this.i;
    const opener = this.consume();
    while (!this.peek().equals(opener.toString()) || this.peek(-1).equals('\\')) {
      if (this.peek().isEoF()) {
        this.throwError(`Unterminated string! Expected \`${opener}\`, got EoF`);
      }
      const c = this.consume();
      if (c.equals('\\')) {
        continue;
      }
      this.buffer.push(c);
    }
    this.consume();
    this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString(), pos, len: this.i - pos });
  }

  #handleBacktick() {
    const pos = this.i;
    this.buffer.push(this.consume());
    while (!this.peek().isBacktick() || this.peek(-1).equals('\\')) {
      if (this.peek().isEoF()) {
        this.throwError(`Unterminated string! Expected '\`', got EoF`);
      }
      this.buffer.push(this.consume());
    }
    this.buffer.push(this.consume());
    this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString(), pos, len: this.i - pos });
  }

  #handleAlphaNumeric() {
    const pos = this.i;
    this.buffer.push(this.consume());
    // if the previously parsed token is an opening bracket of some sort,
    // stop the string parsing on the matched closing bracket.
    // there's more to do here for escaped brackets, but that's a tomorrow problem

    //essentially - what can end an unquoted string?
    // either it's an identifier (if, return, while, etc.) or we treat anything in it as text.
    // a semicolon will end it, the end of the file will end it, and if it started with an opening bracket, the matched closing bracket will end it
    const previousType = this.tokens[this.tokens.length - 1]?.type;
    const latestTokenIsOpeningBracket = openingBrackets.includes(previousType);
    const matched = !latestTokenIsOpeningBracket ? '' : getMatchedBracketFromTokenType(previousType);
    while (!this.peek().isEoF() &&
      !this.peek().equals(';') &&
      !(latestTokenIsOpeningBracket && this.peek().equals(matched))
    ) {
      this.buffer.push(this.consume());
      if (this.buffer.equals('return')) {
        this.tokens.push({ type: TokenType.RETURN, pos, len: 6 });
        return;
      }
      if (this.buffer.equals('if')) {
        this.tokens.push({ type: TokenType.IF, pos, len: 2 });
        return;
      }
      if (this.buffer.equals('while')) {
        this.tokens.push({ type: TokenType.WHILE, pos, len: 5 });
        return;
      }
      if (this.buffer.equals('else')) {
        this.tokens.push({ type: TokenType.ELSE, pos, len: 4 });
        return;
      }
      if (this.buffer.equals('switch')) {
        this.tokens.push({ type: TokenType.SWITCH, pos, len: 6 });
        return;
      }
    }
    this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString(), pos, len: this.buffer.length() });
  }

  #handleEquals() {
    const pos = this.i;
    this.consume();
    if (!this.peek().equals('>')) {
      this.throwError("Unexpected assignment! Expected '>'");
    }
    this.consume();
    this.tokens.push({ type: TokenType.ARROW, pos, len: 2 });
  }

  #handleSemi() {
    this.tokens.push({ type: TokenType.SEMI, pos: this.i, len: 1 });
    this.consume();
  }

  #handleForwardSlash() {
    if (this.peek(1).equals('/')) {
      this.consume();
      this.consume();
      this.#handleComment();
    } else {
      this.tokens.push({ type: TokenType.FORWARD_SLASH, pos: this.i, len: 1 });
      this.consume();
    }
  }

  #handleBackSlash() {
    this.tokens.push({ type: TokenType.BACKWARD_SLASH, pos: this.i, len: 1 });
    this.consume();
  }

  #handleBracket() {
    const char = this.consume();
    const type = getTokenTypeFromBracket(char.toString());
    this.tokens.push({ type, pos: this.i - 1, len: 1 });
  }

  #handleComment() {
    while (this.peek().isWhiteSpace()) {
      this.consume();
    }
    const pos = this.i;
    while (!this.peek().isNewLine() && !this.peek().isEoF()) {
      this.buffer.push(this.consume());
    }
    this.tokens.push({ type: TokenType.COMMENT, value: this.buffer.toString(), pos, len: this.i - pos });
  }


  peek(at: number = 0): Char {
    const c = this.src[this.i + at];
    if (c === undefined) {
      return new Char('•');
    }
    return new Char(c);
  }

  consume(): Char {
    const next = this.peek();
    this.i++;
    this.col++;
    if (next.isEoF()) {
      this.throwError('Cannot consume, end of file.');
    }
    if (next.isNewLine()) {
      this.ln++;
      this.col = 1;
    }
    return next;
  }

  throwError(errorMessage: string): void {
    const v = 50;
    const u = 5;
    const srcSub = this.src.substring(0, this.i + u);
    const pointer = '^'.padStart(this.col, ' ').padEnd(u, ' ');
    throw new Error(`${errorMessage}\nLn: ${this.ln.toLocaleString()}, Col: ${this.col.toLocaleString()}\n\n${srcSub.substring(this.i - Math.max(this.col, v))}\n${pointer}`);
  }
}


const openingBrackets: TokenType[] = [
  TokenType.L_BRACE, TokenType.L_BRACKET, TokenType.L_PAREN, TokenType.FORWARD_SLASH, TokenType.BACKWARD_SLASH,
]

export const getMatchedBracketFromTokenType = (type: TokenType) => {
  switch (type) {
    case TokenType.L_BRACE:
      return '}';
    case TokenType.R_BRACE:
      return '{';
    case TokenType.L_PAREN:
      return ')';
    case TokenType.R_PAREN:
      return '(';
    case TokenType.L_BRACKET:
      return ']';
    case TokenType.R_BRACKET:
      return '[';
    case TokenType.FORWARD_SLASH:
      return '/';
    case TokenType.BACKWARD_SLASH:
      return '\\';
    default:
      throw new Error('Unknown bracket type! Could not match.')
  }
}

export const getTokenTypeFromBracket = (bracket: string) => {
  switch (bracket) {
    case '{':
      return TokenType.L_BRACE;
    case '}':
      return TokenType.R_BRACE;
    case '(':
      return TokenType.L_PAREN;
    case ')':
      return TokenType.R_PAREN;
    case '[':
      return TokenType.L_BRACKET;
    case ']':
      return TokenType.R_BRACKET;
    default:
      throw new Error('Unknown bracket type! Could not match.')
  }
}
