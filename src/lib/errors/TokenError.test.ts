import { TokenError } from "./TokenError";

describe('TokenError', () => {

  it('throws like an error', () => {
    expect(() => throwError()).toThrowError(TokenError);
  });

  it('throws like an error with a message', () => {
    const message = 'this is the message.';
    expect(() => throwError(message)).toThrowError(message);
  });

  it('has a name', () => {
    const err = new TokenError('');
    expect(err.name).toStrictEqual('TokenError');
  });

  it('has a message', () => {
    const err = new TokenError('with message');
    expect(err.message).toStrictEqual('with message');
  });
});

const throwError = (message?: string) => {
  throw new TokenError(message ?? '');
}
