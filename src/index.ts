import fs from 'fs';

const [, , fileDir] = process.argv;
if (fileDir === undefined) {
  throw new Error("Invalid program arguments. Did you pass a filename?");
}


const file = fs.readFileSync(`./code/${fileDir}`, { encoding: 'utf8', flag: 'r' });
console.log(file)
