import { Tokeniser } from "./Tokeniser";
import { resetId } from "./Node";
import { NodeParser } from "./NodeParser";
import { ParserOptionsArgs } from "../domain/Parser";

const getParser = (input: string, options: ParserOptionsArgs = {}) => {
  const tokeniser = new Tokeniser(input);
  tokeniser.tokenise();
  const parser = new NodeParser(tokeniser, options);
  parser.parse();
  return parser;
}

describe('NodeParser tests', () => {

  beforeEach(() => {
    resetId();
  });

  describe('Builds expression nodes', () => {

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