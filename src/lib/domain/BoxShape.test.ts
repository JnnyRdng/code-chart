import { BoxShape, boxShapeBracketMap } from "./BoxShape";

describe('BoxShapeBracketMap tests', () => {
  it('gets the correct brackets for BoxShape.CIRCULAR', () => {
    const [opening, closing] = boxShapeBracketMap[BoxShape.CIRCULAR];
    expect(opening).toStrictEqual('((');
    expect(closing).toStrictEqual('))');
  });

  it('gets the correct brackets for BoxShape.CONDITION', () => {
    const [opening, closing] = boxShapeBracketMap[BoxShape.CONDITION];
    expect(opening).toStrictEqual('{');
    expect(closing).toStrictEqual('}');
  });

  it('gets the correct brackets for BoxShape.ROUNDED', () => {
    const [opening, closing] = boxShapeBracketMap[BoxShape.ROUNDED];
    expect(opening).toStrictEqual('(');
    expect(closing).toStrictEqual(')');
  });

  it('gets the correct brackets for BoxShape.SQUARE', () => {
    const [opening, closing] = boxShapeBracketMap[BoxShape.SQUARE];
    expect(opening).toStrictEqual('[');
    expect(closing).toStrictEqual(']');
  });

  it('gets the correct brackets for BoxShape.PARALLELOGRAM', () => {
    const [opening, closing] = boxShapeBracketMap[BoxShape.PARALLELOGRAM];
    expect(opening).toStrictEqual('[/');
    expect(closing).toStrictEqual('/]');
  });

  it('gets the correct brackets for BoxShape.REVERSE_PARALLELOGRAM', () => {
    const [opening, closing] = boxShapeBracketMap[BoxShape.REVERSE_PARALLELOGRAM];
    expect(opening).toStrictEqual('[\\');
    expect(closing).toStrictEqual('\\]');
  });
});
