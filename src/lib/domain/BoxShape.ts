import { ThemeElement } from "./Themes";

export enum BoxShape {
  SQUARE = 'SQUARE',
  CIRCULAR = 'CIRCULAR',
  ROUNDED = 'ROUNDED',
  CONDITION = 'CONDITION',
  PARALLELOGRAM = 'PARALLELOGRAM',
  REVERSE_PARALLELOGRAM = 'REVERSE_PARALLELOGRAM',
}

export const boxShapeThemeKeys: Record<BoxShape, ThemeElement> = {
  SQUARE: 'square',
  CIRCULAR: 'circular',
  ROUNDED: 'rounded',
  CONDITION: 'condition',
  PARALLELOGRAM: 'parallelogram',
  REVERSE_PARALLELOGRAM: 'reverse_parallelogram',
}

export const boxShapeBracketMap: Record<BoxShape, [string, string]> = {
  [BoxShape.CIRCULAR]: ['((', '))'],
  [BoxShape.CONDITION]: ['{', '}'],
  [BoxShape.ROUNDED]: ['(', ')'],
  [BoxShape.SQUARE]: ['[', ']'],
  [BoxShape.PARALLELOGRAM]: ['[/', '/]'],
  [BoxShape.REVERSE_PARALLELOGRAM]: ['[\\', '\\]'],
}
