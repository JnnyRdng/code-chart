import { Token, TokenType } from "../domain/Token";
import { Tokeniser, getMatchedBracketFromTokenType } from "./Tokeniser";

const getTokens = (input: string) => {
  const tokeniser = new Tokeniser(input);
  tokeniser.tokenise();
  return tokeniser.getTokens();
}

describe('Tokeniser tests', () => {

  describe('Matching brackets', () => {
    it('matches `)` to TokenType.L_PAREN', () => {
      expect(getMatchedBracketFromTokenType(TokenType.L_PAREN)).toStrictEqual(')');
    });

    it('matches `(` to TokenType.R_PAREN', () => {
      expect(getMatchedBracketFromTokenType(TokenType.R_PAREN)).toStrictEqual('(');
    });

    it('matches `]` to TokenType.L_BRACKET', () => {
      expect(getMatchedBracketFromTokenType(TokenType.L_BRACKET)).toStrictEqual(']');
    });

    it('matches `[` to TokenType.R_BRACKET', () => {
      expect(getMatchedBracketFromTokenType(TokenType.R_BRACKET)).toStrictEqual('[');
    });

    it('matches `}` to TokenType.L_BRACE', () => {
      expect(getMatchedBracketFromTokenType(TokenType.L_BRACE)).toStrictEqual('}');
    });

    it('matches `{` to TokenType.R_BRACE', () => {
      expect(getMatchedBracketFromTokenType(TokenType.R_BRACE)).toStrictEqual('{');
    });

    it('matches `/` to TokenType.FORWARD_SLASH', () => {
      expect(getMatchedBracketFromTokenType(TokenType.FORWARD_SLASH)).toStrictEqual('/');
    });

    it('matches `\\` to TokenType.BACKWARD_SLASH', () => {
      expect(getMatchedBracketFromTokenType(TokenType.BACKWARD_SLASH)).toStrictEqual('\\');
    });

    it('throws error if passed a non-bracket type', () => {
      expect(() => getMatchedBracketFromTokenType(TokenType.SEMI)).toThrow('Unknown bracket type! Could not match.');
    });
  });

  describe('Tokeniser Peek and Consume', () => {
    const input = '012';
    let t: Tokeniser;

    beforeEach(() => {
      t = new Tokeniser(input);
    });

    it('should peek by default at current char', () => {
      expect(t.peek().toString()).toStrictEqual('0');
    });

    it('should peek at +1', () => {
      expect(t.peek(1).toString()).toStrictEqual('1');
    });

    it('should consume', () => {
      expect(t.consume().toString()).toStrictEqual('0');
      expect(t.peek().toString()).toStrictEqual('1');
      expect(t.consume().toString()).toStrictEqual('1');
      expect(t.peek().toString()).toStrictEqual('2');
    });

    it('should peek backwards', () => {
      t.consume();
      expect(t.peek(-1).toString()).toStrictEqual('0');
    });

    it('should peek into eof', () => {
      expect(t.peek(-1).isEoF()).toStrictEqual(true);
      expect(t.peek(input.length - 1).isEoF()).toStrictEqual(false);
      expect(t.peek(input.length).isEoF()).toStrictEqual(true);
    });

    it('throws an error if it consumes EoF', () => {
      t.consume();
      t.consume();
      t.consume();
      expect(() => t.consume()).toThrow('Cannot consume, end of file.');
    });
  });

  describe('Tokenising', () => {

    it('parses a semicolon', () => {
      const input = ';';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SEMI, pos: 0, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses multiple semicolons', () => {
      const input = ';;;';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SEMI, pos: 0, len: 1 },
        { type: TokenType.SEMI, pos: 1, len: 1 },
        { type: TokenType.SEMI, pos: 2, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('ignores whitespace', () => {
      const input = '  ;  ;\n;\t';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SEMI, pos: 2, len: 1 },
        { type: TokenType.SEMI, pos: 5, len: 1 },
        { type: TokenType.SEMI, pos: 7, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses parenthesis', () => {
      const input = `())(`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: 0, len: 1 },
        { type: TokenType.R_PAREN, pos: 1, len: 1 },
        { type: TokenType.R_PAREN, pos: 2, len: 1 },
        { type: TokenType.L_PAREN, pos: 3, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses braces', () => {
      const input = `{}}{`;
      const actual = getTokens(input);
      const expected = [
        { type: TokenType.L_BRACE, pos: 0, len: 1 },
        { type: TokenType.R_BRACE, pos: 1, len: 1 },
        { type: TokenType.R_BRACE, pos: 2, len: 1 },
        { type: TokenType.L_BRACE, pos: 3, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses brackets', () => {
      const input = `[]][`;
      const actual = getTokens(input);
      const expected = [
        { type: TokenType.L_BRACKET, pos: 0, len: 1 },
        { type: TokenType.R_BRACKET, pos: 1, len: 1 },
        { type: TokenType.R_BRACKET, pos: 2, len: 1 },
        { type: TokenType.L_BRACKET, pos: 3, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a string', () => {
      const input = '"this is a string"';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: 'this is a string', pos: 0, len: 18 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('throws an error on an unterminated string', () => {
      expect(() => getTokens('"this is an unterminated string')).toThrow('Unterminated string! Expected `"`, got EoF');
      expect(() => getTokens("'this is an unterminated string")).toThrow('Unterminated string! Expected `\'`, got EoF');
    });

    it('escapes a quote in a string', () => {
      const input = `'it\\'s escaped'`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `it's escaped`, pos: 0, len: 15 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('escapes a double quote in a string', () => {
      const input = `"it\\"s escaped"`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `it"s escaped`, pos: 0, len: 15 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('begins and ends a string with matching single quotes', () => {
      const input = `'text with """ double quotes inside'`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `text with """ double quotes inside`, pos: 0, len: 36 }
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('begins and ends a string with matching double quotes', () => {
      const input = `"text with ''' single quotes inside"`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `text with ''' single quotes inside`, pos: 0, len: 36 }
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does nothing for empty string', () => {
      const input = ``;
      const actual = getTokens(input);
      expect(actual).toHaveLength(0);
    });

    it('does nothing for input with unknown letters', () => {
      const input = `###`;
      const actual = getTokens(input);
      expect(actual).toHaveLength(0);
    });

    it('parses an if statement', () => {
      const input = `if ('thingy') {\n 'do well';\n}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.IF, pos: 0, len: 2 },
        { type: TokenType.L_PAREN, pos: 3, len: 1 },
        { type: TokenType.STRING, value: 'thingy', pos: 4, len: 8 },
        { type: TokenType.R_PAREN, pos: 12, len: 1 },
        { type: TokenType.L_BRACE, pos: 14, len: 1 },
        { type: TokenType.STRING, value: 'do well', pos: 17, len: 9 },
        { type: TokenType.SEMI, pos: 26, len: 1 },
        { type: TokenType.R_BRACE, pos: 28, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not need quoted text in parenthesis', () => {
      const input = `(thingy)`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: 0, len: 1 },
        { type: TokenType.STRING, value: 'thingy', pos: 1, len: 6 },
        { type: TokenType.R_PAREN, pos: 7, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not need quoted text in double parenthesis', () => {
      const input = `((thingy))`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: 0, len: 1 },
        { type: TokenType.L_PAREN, pos: 1, len: 1 },
        { type: TokenType.STRING, value: 'thingy', pos: 2, len: 6 },
        { type: TokenType.R_PAREN, pos: 8, len: 1 },
        { type: TokenType.R_PAREN, pos: 9, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not need quoted text in brackets', () => {
      const input = `[thingy]`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_BRACKET, pos: 0, len: 1 },
        { type: TokenType.STRING, value: 'thingy', pos: 1, len: 6 },
        { type: TokenType.R_BRACKET, pos: 7, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('unquoted text does not end with an unmatched bracket', () => {
      const input = `[thingy()] [no bracket![`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_BRACKET, pos: 0, len: 1 },
        { type: TokenType.STRING, value: 'thingy()', pos: 1, len: 8 },
        { type: TokenType.R_BRACKET, pos: 9, len: 1 },
        { type: TokenType.L_BRACKET, pos: 11, len: 1 },
        { type: TokenType.STRING, value: 'no bracket![', pos: 12, len: 12 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not require quoted text in an if condition', () => {
      const input = `if (thingy) {}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.IF, pos: 0, len: 2 },
        { type: TokenType.L_PAREN, pos: 3, len: 1 },
        { type: TokenType.STRING, value: 'thingy', pos: 4, len: 6 },
        { type: TokenType.R_PAREN, pos: 10, len: 1 },
        { type: TokenType.L_BRACE, pos: 12, len: 1 },
        { type: TokenType.R_BRACE, pos: 13, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not require quotes around text', () => {
      const input = `thingy;do well;\noh my god;`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: 'thingy', pos: 0, len: 6 },
        { type: TokenType.SEMI, pos: 6, len: 1 },
        { type: TokenType.STRING, value: 'do well', pos: 7, len: 7 },
        { type: TokenType.SEMI, pos: 14, len: 1 },
        { type: TokenType.STRING, value: 'oh my god', pos: 16, len: 9 },
        { type: TokenType.SEMI, pos: 25, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a while statement', () => {
      const input = `while (thingy) {\n 'do well';\n}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.WHILE, pos: 0, len: 5 },
        { type: TokenType.L_PAREN, pos: 6, len: 1 },
        { type: TokenType.STRING, value: 'thingy', pos: 7, len: 6 },
        { type: TokenType.R_PAREN, pos: 13, len: 1 },
        { type: TokenType.L_BRACE, pos: 15, len: 1 },
        { type: TokenType.STRING, value: 'do well', pos: 18, len: 9 },
        { type: TokenType.SEMI, pos: 27, len: 1 },
        { type: TokenType.R_BRACE, pos: 29, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a switch statement', () => {
      const input = `switch (condition) {}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SWITCH, pos: 0, len: 6 },
        { type: TokenType.L_PAREN, pos: 7, len: 1 },
        { type: TokenType.STRING, value: 'condition', pos: 8, len: 9 },
        { type: TokenType.R_PAREN, pos: 17, len: 1 },
        { type: TokenType.L_BRACE, pos: 19, len: 1 },
        { type: TokenType.R_BRACE, pos: 20, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses an arrow', () => {
      const actual = getTokens(`=>`);
      const expected: Token[] = [
        { type: TokenType.ARROW, pos: 0, len: 2 }
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses an arrow function', () => {
      const input = `(arg) => result;`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: 0, len: 1 },
        { type: TokenType.STRING, value: 'arg', pos: 1, len: 3 },
        { type: TokenType.R_PAREN, pos: 4, len: 1 },
        { type: TokenType.ARROW, pos: 6, len: 2 },
        { type: TokenType.STRING, value: 'result', pos: 9, len: 6 },
        { type: TokenType.SEMI, pos: 15, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a scoped arrow function', () => {
      const input = `(arg) => {\n    scope;\n}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: 0, len: 1 },
        { type: TokenType.STRING, value: 'arg', pos: 1, len: 3 },
        { type: TokenType.R_PAREN, pos: 4, len: 1 },
        { type: TokenType.ARROW, pos: 6, len: 2 },
        { type: TokenType.L_BRACE, pos: 9, len: 1 },
        { type: TokenType.STRING, value: 'scope', pos: 15, len: 5 },
        { type: TokenType.SEMI, pos: 20, len: 1 },
        { type: TokenType.R_BRACE, pos: 22, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('expects a r angle bracket after an equals sign', () => {
      expect(() => getTokens('=')).toThrow('Unexpected assignment! Expected \'>\'');
    });

    it('parses a return statement', () => {
      const actual = getTokens(`return;`);
      const expected: Token[] = [
        { type: TokenType.RETURN, pos: 0, len: 6 },
        { type: TokenType.SEMI, pos: 6, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses an else statement', () => {
      const actual = getTokens(`else`);
      const expected: Token[] = [
        { type: TokenType.ELSE, pos: 0, len: 4 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a forward slash', () => {
      const actual = getTokens('/');
      const expected: Token[] = [
        { type: TokenType.FORWARD_SLASH, pos: 0, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a backward slash', () => {
      const actual = getTokens('\\');
      const expected: Token[] = [
        { type: TokenType.BACKWARD_SLASH, pos: 0, len: 1 },
      ]
      expect(actual).toStrictEqual(expected);
    });
  });

  describe('Comments', () => {
    it('parses a comment from a double // to the end of the line', () => {
      const actual = getTokens('// this is a comment\n this is not');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: 'this is a comment', pos: 3, len: 17 },
        { type: TokenType.STRING, value: 'this is not', pos: 22, len: 11 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('a comment does not need a space after a //', () => {
      const actual = getTokens('//comment\n');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: 'comment', pos: 2, len: 7 },
      ];
      expect(actual).toStrictEqual(expected);
    });

    it('a comment at the end of the file should not throw an error', () => {
      const actual = getTokens('//eof');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: 'eof', pos: 2, len: 3 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('an empty comment should be empty', () => {
      const actual = getTokens('//');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: '', pos: 2, len: 0 },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('an empty comment followed by a newline should be empty', () => {
      const actual = getTokens('//\n');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: '', pos: 2, len: 0 },
      ]
      expect(actual).toStrictEqual(expected);
    });
  });
});
