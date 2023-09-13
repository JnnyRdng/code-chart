import fs from 'fs';
import { Tokeniser } from './lib/parser/Tokeniser';
import { NodeParser } from './lib/parser/Node';
// import { TextNode } from './util/Node';
// import { Boxer } from './util/Boxer';
// import { ToCode } from './util/ToCode';
// import { BoxType } from './util/Box';

const [, , fileDir] = process.argv;
if (fileDir === undefined) {
  throw new Error("Invalid program arguments. Did you pass a filename?");
}

const file = fs.readFileSync(`./code/${fileDir}`, { encoding: 'utf8', flag: 'r' });
console.log(file)
const tokeniser = new Tokeniser(file);
console.log(tokeniser.tokens);
console.log('done')

const parser = new NodeParser(tokeniser);
console.log(parser.mermaid);

// const m = new MakeTree(tokeniser);
// m.parse();
// console.log(JSON.stringify(m.root, null, 4))
// console.log(m.parents)
// if (m.root === null) {
//   throw new Error('no root box');
// }
// const code = new Code(m.root);
// code.generate();
// console.log(code.text)

// console.log('\n----\n')

// const boxer = new Boxer(tokeniser.tokens);
// boxer.parseBoxes();
// // console.log(JSON.stringify(boxer.root, null, 4));
// if (boxer.root.branches[0] !== undefined) {
//   boxer.root.branches[0].type = BoxType.START;
// }
// const code = new ToCode(boxer.root);
// code.generateCode();
// console.log(code.code);

