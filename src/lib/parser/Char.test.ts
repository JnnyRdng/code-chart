import { Char } from "./Char";

describe('Char tests', () => {

  describe('Constructor', () => {

    it('constructs with a single character', () => {
      expect(() => new Char('a')).not.toThrowError();
    });

    it('fails to construct with empty string', () => {
      expect(() => new Char('')).toThrow(' is not a single letter');
    });

    it('fails to construct with multiple characters', () => {
      expect(() => new Char('abc')).toThrow('abc is not a single letter');
    });
  });

  describe('utility methods', () => {
    it('toString returns the char', () => {
      const c = new Char('a');
      expect(c.toString()).toStrictEqual('a');
    });

    it('toUpperCase returns uppercase char', () => {
      const c = new Char('a');
      expect(c.toUpperCase()).toStrictEqual('A');
    });

    it('toLowerCase returns lowercase char', () => {
      const c = new Char('A');
      expect(c.toLowerCase()).toStrictEqual('a');
    });

    it('isAlpha is true for letters', () => {
      const c = new Char('a');
      expect(c.isAlpha()).toStrictEqual(true);
    });

    it('isAlpha is false for digits', () => {
      const c = new Char('1');
      expect(c.isAlpha()).toStrictEqual(false);
    });

    it('isNumeric is false for letters', () => {
      const c = new Char('a');
      expect(c.isNumeric()).toStrictEqual(false);
    });

    it('isNumeric is true for digits', () => {
      const c = new Char('1');
      expect(c.isNumeric()).toStrictEqual(true);
    });

    it('isOneOf is false when the char value is not in the provided array', () => {
      const array = ['a', 'b'];
      const c = new Char('c');
      expect(c.isOneOf(array)).toStrictEqual(false);
    });

    it('isOneOf is true when the char value is in the provided array', () => {
      const array = ['a', 'b', 'c'];
      const c = new Char('c');
      expect(c.isOneOf(array)).toStrictEqual(true);
    });
  });
});