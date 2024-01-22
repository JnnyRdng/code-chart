import { Char, EOF_CHAR } from "./Char";
import { CharPos, Token, TokenType } from "../domain/Token";
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
    this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString(), pos: this.#getCharPos(pos, this.i - pos) });
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
    this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString(), pos: this.#getCharPos(pos, this.i - pos) });
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
      if (this.buffer.equals('return') && this.nextIsOneOf(';', ' ')) {
        this.tokens.push({ type: TokenType.RETURN, pos: this.#getCharPos(pos, 6) });
        return;
      }
      if (this.buffer.equals('if') && this.nextIsOneOf(' ', '(')) {
        this.tokens.push({ type: TokenType.IF, pos: this.#getCharPos(pos, 2) });
        return;
      }
      if (this.buffer.equals('while') && this.nextIsOneOf(' ', '(')) {
        this.tokens.push({ type: TokenType.WHILE, pos: this.#getCharPos(pos, 5) });
        return;
      }
      if (this.buffer.equals('else') && this.nextIsOneOf(' ', '{')) {
        this.tokens.push({ type: TokenType.ELSE, pos: this.#getCharPos(pos, 4) });
        return;
      }
      if (this.buffer.equals('switch') && this.nextIsOneOf(' ', '(')) {
        this.tokens.push({ type: TokenType.SWITCH, pos: this.#getCharPos(pos, 6) });
        return;
      }
    }
    this.tokens.push({ type: TokenType.STRING, value: this.buffer.toString(), pos: this.#getCharPos(pos, this.buffer.length()) });
  }

  #handleEquals() {
    const pos = this.i;
    this.consume();
    if (!this.peek().equals('>')) {
      this.throwError("Unexpected assignment! Expected '>'");
    }
    this.consume();
    this.tokens.push({ type: TokenType.ARROW, pos: this.#getCharPos(pos, 2) });
  }

  #handleSemi() {
    this.tokens.push({ type: TokenType.SEMI, pos: this.#getCharPos(this.i, 1) });
    this.consume();
  }

  #handleForwardSlash() {
    if (this.peek(1).equals('/')) {
      this.#handleComment();
    } else if (this.peek(1).equals('*')) {
      this.#handleBlockComment();
    } else {
      this.tokens.push({ type: TokenType.FORWARD_SLASH, pos: this.#getCharPos(this.i, 1) });
      this.consume();
    }
  }

  #handleBackSlash() {
    this.tokens.push({ type: TokenType.BACKWARD_SLASH, pos: this.#getCharPos(this.i, 1) });
    this.consume();
  }

  #handleBracket() {
    const char = this.consume();
    const type = getTokenTypeFromBracket(char.toString());
    this.tokens.push({ type, pos: this.#getCharPos(this.i - 1, 1) });
  }

  #handleComment() {
    const pos = this.i;
    this.consume();
    this.consume();
    while (this.peek().isWhiteSpace()) {
      this.consume();
    }
    while (!this.peek().isNewLine() && !this.peek().isEoF()) {
      this.buffer.push(this.consume());
    }
    const tokenLength = this.tokens.length;
    const lastToken = this.tokens[tokenLength - 1];
    const charPos = this.#getCharPos(pos, this.i - pos);
    if (lastToken && lastToken.type === TokenType.COMMENT) {
      lastToken.value += '\n' + this.buffer.toString();
      lastToken.pos.len += charPos.len + 1;
    } else {
      this.tokens.push({ type: TokenType.COMMENT, value: this.buffer.toString(), pos: charPos });
    }
  }

  #handleBlockComment() {
    const pos = this.i;
    this.consume();
    this.consume();
    while (!this.peek().isEoF() && (!this.peek().equals('*') || !this.peek(1).equals('/'))) {
      this.buffer.push(this.consume());
    }
    // this is probably bad
    this.consume();
    this.consume();
    this.tokens.push({ type: TokenType.COMMENT, value: this.buffer.toString(), pos: this.#getCharPos(pos, this.i - pos) })
  }


  peek(at: number = 0): Char {
    const c = this.src[this.i + at];
    if (c === undefined) {
      return new Char('•');
    }
    return new Char(c);
  }

  nextIsOneOf(...charValues: string[]) {
    const next = this.peek();
    return [EOF_CHAR, ...charValues].includes(next.char);
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

  #getCharPos(pos: number, len: number): CharPos {
    let ln = 1;
    let col = 1;
    for (let i = 0; i < pos; i++) {
      const c = this.src[i];
      col++;
      if (c === '\n') {
        ln++;
        col = 1;
      }
    }
    return { pos, len, ln, col }
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
