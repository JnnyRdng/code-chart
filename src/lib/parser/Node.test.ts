import { Tokeniser } from "./Tokeniser";
import { resetId } from "./Node";
import { NodeParser } from "./NodeParser";

const get = (input: string) => {
  const tokeniser = new Tokeniser(input);
  const parser = new NodeParser(tokeniser, { trueLabel: 'Yes', falseLabel: 'No', });
  return parser;

}

describe('NodeParser tests', () => {

  beforeEach(() => {
    resetId();
  });

  it('parses a list of expressions', () => {
    // const parser = get(`((start));
    // if ("\`i am
    // _hungry_\`") { 
    //   eat food; 
    //   if(sleepy) {
    //     /have a lie down/; 
    //   } 
    //   "\`do your _own_ thing\`";

    // } else { 
    //   \\drink water?\\; 
    // }
    // ((finish));`)
    const parser = get(`
    start;
(make a box);
if (i am cool) {
  do a thing;
} else {
  do nothing;
}

end;
    `)
    console.dir(parser.root, { depth: null });
    console.log(parser.mermaid);
  });

  it('produces a single block diagram', () => {
    const parser = get('block;');
    expect(parser.mermaid).toStrictEqual('flowchart TD;\n  1["block"]\n' + parser.classDefs);
  });

  it('produces a two block diagram with an arrow', () => {
    const parser = get('block; block;');
    expect(parser.mermaid).toStrictEqual('flowchart TD;\n  1["block"]\n  2["block"]\n  1-->2\n' + parser.classDefs);
  });

});