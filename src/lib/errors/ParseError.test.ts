import { ParseError } from "./ParseError";

describe('ParseError', () => {

  it('throws like an error', () => {
    expect(() => throwError()).toThrowError(ParseError);
  });

  it('throws like an error with a message', () => {
    const message = 'this is the message.';
    expect(() => throwError(message)).toThrowError(message);
  });

  it('has a name', () => {
    const err = new ParseError('');
    expect(err.name).toStrictEqual('ParseError');
  });

  it('has a message', () => {
    const err = new ParseError('with message');
    expect(err.message).toStrictEqual('with message');
  });
});

const throwError = (message?: string) => {
  throw new ParseError(message ?? '');
}
