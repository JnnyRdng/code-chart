import { Token, TokenType } from "../domain/Token";
import { Tokeniser, getMatchedBracketFromTokenType, getTokenTypeFromBracket } from "./Tokeniser";

const getTokens = (input: string) => {
  const tokeniser = new Tokeniser(input);
  tokeniser.tokenise();
  return tokeniser.getTokens();
}

describe('Tokeniser tests', () => {

  describe('Matching TokenTypes to opposing brackets', () => {
    it('matches TokenType.L_PAREN to `)`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.L_PAREN)).toStrictEqual(')');
    });

    it('matches TokenType.R_PAREN to `(`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.R_PAREN)).toStrictEqual('(');
    });

    it('matches TokenType.L_BRACKET to `]`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.L_BRACKET)).toStrictEqual(']');
    });

    it('matches TokenType.R_BRACKET to `[`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.R_BRACKET)).toStrictEqual('[');
    });

    it('matches TokenType.L_BRACE to `}`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.L_BRACE)).toStrictEqual('}');
    });

    it('matches TokenType.R_BRACE to `{`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.R_BRACE)).toStrictEqual('{');
    });

    it('matches TokenType.FORWARD_SLASH to `/`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.FORWARD_SLASH)).toStrictEqual('/');
    });

    it('matches TokenType.BACKWARD_SLASH to `\\`', () => {
      expect(getMatchedBracketFromTokenType(TokenType.BACKWARD_SLASH)).toStrictEqual('\\');
    });

    it('throws error if passed a non-bracket type', () => {
      expect(() => getMatchedBracketFromTokenType(TokenType.SEMI)).toThrow('Unknown bracket type! Could not match.');
    });
  });

  describe('Matching strings that are brackets to TokenTypes', () => {
    it('matches `(` to TokenType.L_PAREN', () => {
      expect(getTokenTypeFromBracket('(')).toStrictEqual(TokenType.L_PAREN);
    });

    it('matches `)` to TokenType.R_PAREN', () => {
      expect(getTokenTypeFromBracket(')')).toStrictEqual(TokenType.R_PAREN);
    });

    it('matches `{` to TokenType.L_BRACE', () => {
      expect(getTokenTypeFromBracket('{')).toStrictEqual(TokenType.L_BRACE);
    });

    it('matches `}` to TokenType.R_BRACE', () => {
      expect(getTokenTypeFromBracket('}')).toStrictEqual(TokenType.R_BRACE);
    });

    it('matches `[` to TokenType.L_BRACKET', () => {
      expect(getTokenTypeFromBracket('[')).toStrictEqual(TokenType.L_BRACKET);
    });

    it('matches `]` to TokenType.R_BRACKET', () => {
      expect(getTokenTypeFromBracket(']')).toStrictEqual(TokenType.R_BRACKET);
    });

    it('throws error if passed a non-bracket string', () => {
      expect(() => getTokenTypeFromBracket('x')).toThrow('Unknown bracket type! Could not match.');
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
        { type: TokenType.SEMI, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses multiple semicolons', () => {
      const input = ';;;';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SEMI, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.SEMI, pos: { pos: 1, len: 1, ln: 1, col: 2 } },
        { type: TokenType.SEMI, pos: { pos: 2, len: 1, ln: 1, col: 3 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('ignores whitespace', () => {
      const input = '  ;  ;\n;\t';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SEMI, pos: { pos: 2, len: 1, ln: 1, col: 3 } },
        { type: TokenType.SEMI, pos: { pos: 5, len: 1, ln: 1, col: 6 } },
        { type: TokenType.SEMI, pos: { pos: 7, len: 1, ln: 2, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses parenthesis', () => {
      const input = `())(`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.R_PAREN, pos: { pos: 1, len: 1, ln: 1, col: 2 } },
        { type: TokenType.R_PAREN, pos: { pos: 2, len: 1, ln: 1, col: 3 } },
        { type: TokenType.L_PAREN, pos: { pos: 3, len: 1, ln: 1, col: 4 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses braces', () => {
      const input = `{}}{`;
      const actual = getTokens(input);
      const expected = [
        { type: TokenType.L_BRACE, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.R_BRACE, pos: { pos: 1, len: 1, ln: 1, col: 2 } },
        { type: TokenType.R_BRACE, pos: { pos: 2, len: 1, ln: 1, col: 3 } },
        { type: TokenType.L_BRACE, pos: { pos: 3, len: 1, ln: 1, col: 4 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses brackets', () => {
      const input = `[]][`;
      const actual = getTokens(input);
      const expected = [
        { type: TokenType.L_BRACKET, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.R_BRACKET, pos: { pos: 1, len: 1, ln: 1, col: 2 } },
        { type: TokenType.R_BRACKET, pos: { pos: 2, len: 1, ln: 1, col: 3 } },
        { type: TokenType.L_BRACKET, pos: { pos: 3, len: 1, ln: 1, col: 4 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a string', () => {
      const input = '"this is a string"';
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: 'this is a string', pos: { pos: 0, len: 18, ln: 1, col: 1 } },
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
        { type: TokenType.STRING, value: `it's escaped`, pos: { pos: 0, len: 15, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('escapes a double quote in a string', () => {
      const input = `"it\\"s escaped"`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `it"s escaped`, pos: { pos: 0, len: 15, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('begins and ends a string with matching single quotes', () => {
      const input = `'text with """ double quotes inside'`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `text with """ double quotes inside`, pos: { pos: 0, len: 36, ln: 1, col: 1 } }
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('begins and ends a string with matching double quotes', () => {
      const input = `"text with ''' single quotes inside"`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: `text with ''' single quotes inside`, pos: { pos: 0, len: 36, ln: 1, col: 1 } }
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
        { type: TokenType.IF, pos: { pos: 0, len: 2, ln: 1, col: 1 } },
        { type: TokenType.L_PAREN, pos: { pos: 3, len: 1, ln: 1, col: 4 } },
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 4, len: 8, ln: 1, col: 5 } },
        { type: TokenType.R_PAREN, pos: { pos: 12, len: 1, ln: 1, col: 13 } },
        { type: TokenType.L_BRACE, pos: { pos: 14, len: 1, ln: 1, col: 15 } },
        { type: TokenType.STRING, value: 'do well', pos: { pos: 17, len: 9, ln: 2, col: 2 } },
        { type: TokenType.SEMI, pos: { pos: 26, len: 1, ln: 2, col: 11 } },
        { type: TokenType.R_BRACE, pos: { pos: 28, len: 1, ln: 3, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not need quoted text in parenthesis', () => {
      const input = `(thingy)`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 1, len: 6, ln: 1, col: 2 } },
        { type: TokenType.R_PAREN, pos: { pos: 7, len: 1, ln: 1, col: 8 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not need quoted text in double parenthesis', () => {
      const input = `((thingy))`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.L_PAREN, pos: { pos: 1, len: 1, ln: 1, col: 2 } },
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 2, len: 6, ln: 1, col: 3 } },
        { type: TokenType.R_PAREN, pos: { pos: 8, len: 1, ln: 1, col: 9 } },
        { type: TokenType.R_PAREN, pos: { pos: 9, len: 1, ln: 1, col: 10 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not need quoted text in brackets', () => {
      const input = `[thingy]`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_BRACKET, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 1, len: 6, ln: 1, col: 2 } },
        { type: TokenType.R_BRACKET, pos: { pos: 7, len: 1, ln: 1, col: 8 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('unquoted text does not end with an unmatched bracket', () => {
      const input = `[thingy()] [no bracket![`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_BRACKET, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.STRING, value: 'thingy()', pos: { pos: 1, len: 8, ln: 1, col: 2 } },
        { type: TokenType.R_BRACKET, pos: { pos: 9, len: 1, ln: 1, col: 10 } },
        { type: TokenType.L_BRACKET, pos: { pos: 11, len: 1, ln: 1, col: 12 } },
        { type: TokenType.STRING, value: 'no bracket![', pos: { pos: 12, len: 12, ln: 1, col: 13 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not require quoted text in an if condition', () => {
      const input = `if (thingy) {}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.IF, pos: { pos: 0, len: 2, ln: 1, col: 1 } },
        { type: TokenType.L_PAREN, pos: { pos: 3, len: 1, ln: 1, col: 4 } },
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 4, len: 6, ln: 1, col: 5 } },
        { type: TokenType.R_PAREN, pos: { pos: 10, len: 1, ln: 1, col: 11 } },
        { type: TokenType.L_BRACE, pos: { pos: 12, len: 1, ln: 1, col: 13 } },
        { type: TokenType.R_BRACE, pos: { pos: 13, len: 1, ln: 1, col: 14 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('does not require quotes around text', () => {
      const input = `thingy;do well;\noh my god;`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 0, len: 6, ln: 1, col: 1 } },
        { type: TokenType.SEMI, pos: { pos: 6, len: 1, ln: 1, col: 7 } },
        { type: TokenType.STRING, value: 'do well', pos: { pos: 7, len: 7, ln: 1, col: 8 } },
        { type: TokenType.SEMI, pos: { pos: 14, len: 1, ln: 1, col: 15 } },
        { type: TokenType.STRING, value: 'oh my god', pos: { pos: 16, len: 9, ln: 2, col: 1 } },
        { type: TokenType.SEMI, pos: { pos: 25, len: 1, ln: 2, col: 10 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a while statement', () => {
      const input = `while (thingy) {\n 'do well';\n}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.WHILE, pos: { pos: 0, len: 5, ln: 1, col: 1 } },
        { type: TokenType.L_PAREN, pos: { pos: 6, len: 1, ln: 1, col: 7 } },
        { type: TokenType.STRING, value: 'thingy', pos: { pos: 7, len: 6, ln: 1, col: 8 } },
        { type: TokenType.R_PAREN, pos: { pos: 13, len: 1, ln: 1, col: 14 } },
        { type: TokenType.L_BRACE, pos: { pos: 15, len: 1, ln: 1, col: 16 } },
        { type: TokenType.STRING, value: 'do well', pos: { pos: 18, len: 9, ln: 2, col: 2 } },
        { type: TokenType.SEMI, pos: { pos: 27, len: 1, ln: 2, col: 11 } },
        { type: TokenType.R_BRACE, pos: { pos: 29, len: 1, ln: 3, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a switch statement', () => {
      const input = `switch (condition) {}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.SWITCH, pos: { pos: 0, len: 6, ln: 1, col: 1 } },
        { type: TokenType.L_PAREN, pos: { pos: 7, len: 1, ln: 1, col: 8 } },
        { type: TokenType.STRING, value: 'condition', pos: { pos: 8, len: 9, ln: 1, col: 9 } },
        { type: TokenType.R_PAREN, pos: { pos: 17, len: 1, ln: 1, col: 18 } },
        { type: TokenType.L_BRACE, pos: { pos: 19, len: 1, ln: 1, col: 20 } },
        { type: TokenType.R_BRACE, pos: { pos: 20, len: 1, ln: 1, col: 21 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses an arrow', () => {
      const actual = getTokens(`=>`);
      const expected: Token[] = [
        { type: TokenType.ARROW, pos: { pos: 0, len: 2, ln: 1, col: 1 } }
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses an arrow function', () => {
      const input = `(arg) => result;`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.STRING, value: 'arg', pos: { pos: 1, len: 3, ln: 1, col: 2 } },
        { type: TokenType.R_PAREN, pos: { pos: 4, len: 1, ln: 1, col: 5 } },
        { type: TokenType.ARROW, pos: { pos: 6, len: 2, ln: 1, col: 7 } },
        { type: TokenType.STRING, value: 'result', pos: { pos: 9, len: 6, ln: 1, col: 10 } },
        { type: TokenType.SEMI, pos: { pos: 15, len: 1, ln: 1, col: 16 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a scoped arrow function', () => {
      const input = `(arg) => {\n    scope;\n}`;
      const actual = getTokens(input);
      const expected: Token[] = [
        { type: TokenType.L_PAREN, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
        { type: TokenType.STRING, value: 'arg', pos: { pos: 1, len: 3, ln: 1, col: 2 } },
        { type: TokenType.R_PAREN, pos: { pos: 4, len: 1, ln: 1, col: 5 } },
        { type: TokenType.ARROW, pos: { pos: 6, len: 2, ln: 1, col: 7 } },
        { type: TokenType.L_BRACE, pos: { pos: 9, len: 1, ln: 1, col: 10 } },
        { type: TokenType.STRING, value: 'scope', pos: { pos: 15, len: 5, ln: 2, col: 5 } },
        { type: TokenType.SEMI, pos: { pos: 20, len: 1, ln: 2, col: 10 } },
        { type: TokenType.R_BRACE, pos: { pos: 22, len: 1, ln: 3, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('expects a r angle bracket after an equals sign', () => {
      expect(() => getTokens('=')).toThrow('Unexpected assignment! Expected \'>\'');
    });

    it('parses a return statement', () => {
      const actual = getTokens(`return;`);
      const expected: Token[] = [
        { type: TokenType.RETURN, pos: { pos: 0, len: 6, ln: 1, col: 1 } },
        { type: TokenType.SEMI, pos: { pos: 6, len: 1, ln: 1, col: 7 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses an else statement', () => {
      const actual = getTokens(`else`);
      const expected: Token[] = [
        { type: TokenType.ELSE, pos: { pos: 0, len: 4, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a forward slash', () => {
      const actual = getTokens('/');
      const expected: Token[] = [
        { type: TokenType.FORWARD_SLASH, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a backward slash', () => {
      const actual = getTokens('\\');
      const expected: Token[] = [
        { type: TokenType.BACKWARD_SLASH, pos: { pos: 0, len: 1, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('parses a string with backticks', () => {
      const actual = getTokens('`string`');
      const expected: Token[] = [
        { type: TokenType.STRING, value: '`string`', pos: { pos: 0, len: 8, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('ignores escaped backticks when looking for the end of the string', () => {
      const actual = getTokens('`string\\` carries on`');
      const expected: Token[] = [
        { type: TokenType.STRING, value: '`string\\` carries on`', pos: { pos: 0, len: 21, ln: 1, col: 1 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('throws an error parsing a string with unterminated backticks', () => {
      expect(() => {
        getTokens('`string');
      }).toThrow("Unterminated string! Expected '`', got EoF");
    });
  });

  describe('Comments', () => {
    it('parses a comment from a double // to the end of the line', () => {
      const actual = getTokens('// this is a comment\n this is not');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: 'this is a comment', pos: { pos: 3, len: 17, ln: 1, col: 4 } },
        { type: TokenType.STRING, value: 'this is not', pos: { pos: 22, len: 11, ln: 2, col: 2 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('a comment does not need a space after a //', () => {
      const actual = getTokens('//comment\n');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: 'comment', pos: { pos: 2, len: 7, ln: 1, col: 3 } },
      ];
      expect(actual).toStrictEqual(expected);
    });

    it('a comment at the end of the file should not throw an error', () => {
      const actual = getTokens('//eof');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: 'eof', pos: { pos: 2, len: 3, ln: 1, col: 3 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('an empty comment should be empty', () => {
      const actual = getTokens('//');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: '', pos: { pos: 2, len: 0, ln: 1, col: 3 } },
      ]
      expect(actual).toStrictEqual(expected);
    });

    it('an empty comment followed by a newline should be empty', () => {
      const actual = getTokens('//\n');
      const expected: Token[] = [
        { type: TokenType.COMMENT, value: '', pos: { pos: 2, len: 0, ln: 1, col: 3 } },
      ]
      expect(actual).toStrictEqual(expected);
    });
  });
});
