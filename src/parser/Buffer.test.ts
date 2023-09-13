import { Buffer } from './Buffer';
import { Char } from './Char';

describe('Buffer tests', () => {

  let buffer: Buffer;

  beforeEach(() => {
    buffer = new Buffer();
  });

  it('initialises with an empty buffer', () => {
    expect(buffer.toString()).toStrictEqual('');
  });

  it('hasContents is false when first initialised', () => {
    expect(buffer.hasContents()).toStrictEqual(false);
  });

  it('when initialised equals empty string', () => {
    expect(buffer.equals('')).toStrictEqual(true);
  });

  it('pushes a char to the buffer', () => {
    buffer.push(new Char('a'));
    expect(buffer.toString()).toStrictEqual('a');
  });

  it('pushing multiple chars to the buffer makes a longer string', () => {
    buffer.push(new Char('a'));
    buffer.push(new Char('b'));
    buffer.push(new Char('c'));
    buffer.push(new Char('d'));
    buffer.push(new Char('e'));
    expect(buffer.toString()).toStrictEqual('abcde');
    expect(buffer.equals('abcde')).toStrictEqual(true);
  });

  it('hasContents returns true when a value has been pushed', () => {
    buffer.push(new Char('a'));
    expect(buffer.hasContents()).toStrictEqual(true);
  });

  it('clears the buffer', () => {
    buffer.push(new Char('a'));
    buffer.clear();
    expect(buffer.hasContents()).toStrictEqual(false);
  });
});