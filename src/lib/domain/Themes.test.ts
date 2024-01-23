import { ThemeKey, getThemeClass, getThemeValue, themes, getArrowStyle } from "./Themes";

describe('Themes', () => {

  let key: ThemeKey;

  describe('none theme', () => {

    beforeEach(() => {
      key = 'none';
    });

    it('has no keys', () => {
      expect(Object.keys(themes[key])).toHaveLength(0);
    });

    it('getThemeValue returns an empty string for an undefined element', () => {
      expect(getThemeValue(key, undefined)).toStrictEqual('');
    });

    it('getThemeClass returns an empty string for an undefined element', () => {
      expect(getThemeClass(key, undefined)).toStrictEqual('');
    });

    it('getThemeValue returns empty string', () => {
      expect(getThemeValue(key, 'condition')).toStrictEqual('');
    });

    it('getThemeClass returns empty string', () => {
      expect(getThemeClass(key, 'condition')).toStrictEqual('');
    });

    it('getArrowStyle returns empty string', () => {
      expect(getArrowStyle(key)).toStrictEqual('');
    });
  });

  describe('_TESTING theme', () => {

    beforeEach(() => {
      key = '_TESTING';
    });

    it('gets condition value', () => {
      expect(getThemeValue(key, 'condition')).toStrictEqual('classDef condition fill:hotpink\n');
    });

    it('gets condition className', () => {
      expect(getThemeClass(key, 'condition')).toStrictEqual(':::condition');
    });

    it('gets square value', () => {
      expect(getThemeValue(key, 'square')).toStrictEqual('classDef square fill:coral\n');
    });

    it('gets square className', () => {
      expect(getThemeClass(key, 'square')).toStrictEqual(':::square');
    });

    it('gets rounded value', () => {
      expect(getThemeValue(key, 'rounded')).toStrictEqual('classDef rounded fill:black,color:white\n');
    });

    it('gets rounded className', () => {
      expect(getThemeClass(key, 'rounded')).toStrictEqual(':::rounded');
    });

    it('gets circular value', () => {
      expect(getThemeValue(key, 'circular')).toStrictEqual('classDef circular fill:mediumseagreen\n');
    });

    it('gets circular className', () => {
      expect(getThemeClass(key, 'circular')).toStrictEqual(':::circular');
    });

    it('get arrow style', () => {
      expect(getArrowStyle(key)).toStrictEqual('linkStyle default stroke: red\n');
    });
  });
});
