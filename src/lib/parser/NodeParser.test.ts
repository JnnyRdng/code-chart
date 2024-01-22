import { Tokeniser } from "./Tokeniser";
import { ExpressionNode, ProgramNode, resetId } from "./Node";
import { NodeParser } from "./NodeParser";
import { ParserOptionsArgs } from "../domain/Parser";
import { TokenType } from "../domain/Token";

const getParser = (input: string, options: ParserOptionsArgs = {}) => {
  const tokeniser = new Tokeniser(input);
  tokeniser.tokenise();
  const parser = new NodeParser(tokeniser, options);
  parser.parse();
  return parser;
}

const getUnparsed = (input: string, options: ParserOptionsArgs = {}) => {
  const tokeniser = new Tokeniser(input);
  tokeniser.tokenise();
  return new NodeParser(tokeniser, options);
}

describe('NodeParser tests', () => {

  beforeEach(() => {
    resetId();
  });

  describe('default values', () => {

    let tokeniser: Tokeniser;
    let parser: NodeParser;

    const create = (options: ParserOptionsArgs = {}) => {
      tokeniser = new Tokeniser('');
      tokeniser.tokenise();
      parser = new NodeParser(tokeniser, options);
    }

    beforeEach(() => {
      create();
    });

    it('should initialise i to 0', () => {
      expect(parser.i).toStrictEqual(0);
    });

    it('should initialise tokens to tokeniser.tokens', () => {
      expect(parser.tokens).toStrictEqual(tokeniser.getTokens());
    });

    it('should initialise code to empty string', () => {
      expect(parser.code).toStrictEqual('');
    });

    it('should initialise arrows to empty string', () => {
      expect(parser.links).toStrictEqual('');
    });

    it('should initialise classDefs to empty string', () => {
      expect(parser.classDefs).toStrictEqual('');
    });

    it('should initialise code to empty string', () => {
      expect(parser.code).toStrictEqual('');
    });

    it('creates a root ProgramNode', () => {
      expect(parser.root).toBeInstanceOf(ProgramNode);
    });

    describe('ParserOptions', () => {

      it('has a default value for the trueLabel', () => {
        expect(parser.options.trueLabel).toStrictEqual('True');
        create({ trueLabel: undefined });
        expect(parser.options.trueLabel).toStrictEqual('True');
      });

      it('should set the trueLabel', () => {
        create({ trueLabel: 'test' });
        expect(parser.options.trueLabel).toStrictEqual('test');
      });

      it('has a default value for the falseLabel', () => {
        expect(parser.options.falseLabel).toStrictEqual('False');
        create({ falseLabel: undefined });
        expect(parser.options.falseLabel).toStrictEqual('False');
      });

      it('should set the falseLabel', () => {
        create({ falseLabel: 'test' });
        expect(parser.options.falseLabel).toStrictEqual('test');
      });

      it('has a default value for flowchartDirection', () => {
        expect(parser.options.flowchartDirection).toStrictEqual('TD');
      });

      it('should set the flowchartDirection', () => {
        create({ flowchartDirection: 'LR' });
        expect(parser.options.flowchartDirection).toStrictEqual('LR');
      });
    });



  });

  describe('peek and consume', () => {

    it('peeking at the end of the file returns undefined', () => {
      const p = getUnparsed('');
      expect(p.peek()).toBeUndefined();
    });

    it('peeks at the first token', () => {
      const p = getUnparsed('string');
      expect(p.peek()).toStrictEqual({ type: TokenType.STRING, value: 'string', pos: { pos: 0, len: 6, ln: 1, col: 1 } });
    });

    it('consuming the last token returns undefined', () => {
      const p = getUnparsed('');
      expect(p.consume()).toBeUndefined();
    });

    it('consume ratchets through the tokens', () => {
      const p = getUnparsed('string;');
      expect(p.consume()).toStrictEqual({ type: TokenType.STRING, value: 'string', pos: { pos: 0, len: 6, ln: 1, col: 1 } });
      expect(p.consume()).toStrictEqual({ type: TokenType.SEMI, pos: { pos: 6, len: 1, ln: 1, col: 7 } });
    });

    it('identifies the next token', () => {
      const p = getUnparsed('string');
      expect(p.tokens).toHaveLength(1);
      expect(p.tokens[0]).toStrictEqual({ type: TokenType.STRING, value: 'string', pos: { pos: 0, len: 6, ln: 1, col: 1 } });

      expect(p.nextMatches(TokenType.STRING)).toBe(true);
      expect(p.nextMatches(TokenType.STRING, TokenType.SEMI)).toBe(false);
    });

    it('identifies multiple tokens', () => {
      const p = getUnparsed('string;');
      expect(p.tokens).toHaveLength(2);
      expect(p.tokens[0]).toStrictEqual({ type: TokenType.STRING, value: 'string', pos: { pos: 0, len: 6, ln: 1, col: 1 } });
      expect(p.tokens[1]).toStrictEqual({ type: TokenType.SEMI, pos: { pos: 6, len: 1, ln: 1, col: 7 } });

      expect(p.nextMatches(TokenType.STRING)).toBe(true);
      expect(p.nextMatches(TokenType.STRING, TokenType.SEMI)).toBe(true);
    });

    it('every token must match', () => {
      const p = getUnparsed('switch(condition)');
      expect(p.nextMatches(TokenType.IF, TokenType.L_PAREN, TokenType.STRING, TokenType.R_PAREN)).toBe(false);
      expect(p.nextMatches(TokenType.SWITCH, TokenType.L_PAREN, TokenType.STRING, TokenType.L_PAREN)).toBe(false);
      expect(p.nextMatches(TokenType.SWITCH, TokenType.L_PAREN, TokenType.STRING, TokenType.R_PAREN)).toBe(true);
    });

    it('starts from the current token index', () => {
      const p = getUnparsed('string;');
      const token = p.consume();
      expect(token).not.toBeUndefined();
      expect(token!.type).toStrictEqual(TokenType.STRING);
      expect(p.nextMatches(TokenType.STRING)).toBe(false);
      expect(p.nextMatches(TokenType.SEMI)).toBe(true);
    });

    it('peekType returns the next token type', () => {
      const p = getUnparsed('string;');
      expect(p.peekType()).toBe(TokenType.STRING);
      expect(p.peekType(1)).toBe(TokenType.SEMI);
    });

    it('peekType on EoF returns undefined', () => {
      const p = getUnparsed('');
      expect(p.peekType()).toBeUndefined();
    });

    it('consumeIf returns the next token if it is of the expected type', () => {
      const p = getUnparsed('string');
      expect(p.consumeIf(TokenType.STRING)).toStrictEqual({ type: TokenType.STRING, value: 'string', pos: { pos: 0, len: 6, ln: 1, col: 1 } });
    });

    it('consumeIf throws an error if the next token is of a different type', () => {
      const p = getUnparsed('string');
      expect(() => {
        p.consumeIf(TokenType.L_BRACKET);
      }).toThrow(`Expected 'L_BRACKET' at pos 0 (ln: 1, col: 1).`);
    });

    it('consumeIf throws an error if at EoF', () => {
      const p = getUnparsed('');
      expect(() => {
        p.consumeIf(TokenType.STRING);
      }).toThrow(`Expected 'STRING' at pos EoF.`);
    });
  });

  //   it('parses a list of expressions', () => {
  //     // const parser = get(`((start));
  //     // if ("\`i am
  //     // _hungry_\`") { 
  //     //   eat food; 
  //     //   if(sleepy) {
  //     //     /have a lie down/; 
  //     //   } 
  //     //   "\`do your _own_ thing\`";

  //     // } else { 
  //     //   \\drink water?\\; 
  //     // }
  //     // ((finish));`)
  //     const parser = getParser(`
  //     start;
  // (make a box);
  // if (i am cool) {
  //   do a thing;
  // } else {
  //   do nothing;
  // }

  // end;
  //     `)
  //     console.dir(parser.root, { depth: null });
  //     console.log(parser.mermaid);
  //   });

  describe('Builds expression nodes', () => {

    it('appends ExpressionNodes to the ProgramNode', () => {
      const parser = getParser('block;');
      expect(parser.root.instructions).toHaveLength(1);
      expect(parser.root.getLastInstruction()).toBeInstanceOf(ExpressionNode);
      expect(parser.root.getLastInstruction().text).toBe('block');
    });

    it('appends successive ExpressionNodes to the ProgramNode', () => {
      const parser = getParser('block1;block2');
      expect(parser.root.instructions).toHaveLength(2);
      expect(parser.root.instructions[0]).toBeInstanceOf(ExpressionNode);
      expect(parser.root.instructions[0].text).toBe('block1');
      expect(parser.root.getLastInstruction()).toBeInstanceOf(ExpressionNode);
      expect(parser.root.getLastInstruction().text).toBe('block2');
    });

    it('produces a single block diagram', () => {
      const parser = getParser('block;');
      expect(parser.mermaid).toStrictEqual('flowchart TD;\n  1["block"]\n' + parser.classDefs);
    });

    it('produces a two block diagram with an arrow', () => {
      const parser = getParser('block; block;');
      expect(parser.mermaid).toStrictEqual('flowchart TD;\n  1["block"]\n  2["block"]\n  1-->2\n' + parser.classDefs);
    });
  });
});