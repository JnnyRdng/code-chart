import fs from 'fs';
import { Tokeniser } from './util/Tokeniser';

const [, , fileDir] = process.argv;
if (fileDir === undefined) {
  throw new Error("Invalid program arguments. Did you pass a filename?");
}


const file = fs.readFileSync(`./code/${fileDir}`, { encoding: 'utf8', flag: 'r' });
console.log(file)
const tokeniser = new Tokeniser(file);
tokeniser.tokenise();
console.log(tokeniser.tokens);

