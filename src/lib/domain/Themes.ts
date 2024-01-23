interface Theme {
  square?: string;
  circular?: string;
  rounded?: string;
  condition?: string;
  parallelogram?: string;
  reverse_parallelogram?: string;
  linkStyle?: string;
}

export type ThemeKey = 'none' | 'bright' | '_TESTING';

type ThemeMap = { [T in ThemeKey]: Theme };

export type ThemeElement = keyof Theme;

export const themes: ThemeMap = {
  none: {

  },
  bright: {
    // square: 'hotpink',
    condition: '#c3516b',
    // circular: '#acff23',
    // rounded: 'hotpink',
    // linkStyle: 'red',
  },
  _TESTING: {
    condition: 'hotpink',
    square: 'coral',
    rounded: 'black,color:white',
    circular: 'mediumseagreen',
    linkStyle: 'red',
  }
}

export const getThemeValue = (key: ThemeKey, element: ThemeElement | undefined) => {
  if (element === undefined) return '';
  const value = themes[key][element];
  return value ? `classDef ${element} fill:${value}\n` : '';
}
export const getThemeClass = (key: ThemeKey, element: ThemeElement | undefined) => {
  if (element === undefined) return '';
  return themes[key][element] ? `:::${element}` : '';
}

export const getArrowStyle = (key: ThemeKey) => {
  const style = themes[key]?.linkStyle;
  return style ? `linkStyle default stroke: ${style}\n` : '';
}
