import { Token, TokenType } from "../domain/Token";
import { Tokeniser, getMatchedBracketFromTokenType } from "./Tokeniser";

const getTokens = (input: string) => {
  const t = new Tokeniser(input);
  return t.getTokens();
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

    it('forms a list of tokens', () => {
      const input = `first;\nsecond; if (condition) {\n
        print;
      } else {
        sleep;
        return;
      }
      end;`
      const actual = getTokens(input)
      // console.log(actual)
      console.log(tokensToFlowchart(actual))
    });
  });
});


function tokensToFlowchart(tokens: Token[]) {
  let flowchartText = 'flowchart TD;\n';
  let nodeCounter = 1;
  let inIfStatement = false;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    if (token.type === 'STRING') {
      flowchartText += `${nodeCounter}(${token.value})`;

      if (nextToken && nextToken.type === 'SEMI') {
        flowchartText += '\n';
        if (inIfStatement) {
          flowchartText += `${nodeCounter}-->|true|${++nodeCounter}`;
        } else {
          flowchartText += `-->${++nodeCounter}`;
        }
      }
    } else if (token.type === 'IF') {
      inIfStatement = true;
      flowchartText += `${nodeCounter}{${nextToken.value}}`;
      nodeCounter += 2;
    } else if (token.type === 'ELSE') {
      inIfStatement = false;
      flowchartText += `-->|false|${nodeCounter}`;
    }

    if (nextToken && nextToken.type === 'SEMI') {
      i++; // Skip the SEMI token
    }

    if (nextToken && nextToken.type !== 'ELSE') {
      flowchartText += '\n';
    }
  }

  return flowchartText;
}