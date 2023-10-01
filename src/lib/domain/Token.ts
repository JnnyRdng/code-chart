export enum TokenType {
  R_PAREN = 'R_PAREN',
  L_PAREN = 'L_PAREN',
  R_BRACKET = 'R_BRACKET',
  L_BRACKET = 'L_BRACKET',
  R_BRACE = 'R_BRACE',
  L_BRACE = 'L_BRACE',

  FORWARD_SLASH = 'FORWARD_SLASH',
  BACKWARD_SLASH = 'BACKWARD_SLASH',
  COMMENT = 'COMMENT',

  STRING = 'STRING',

  SEMI = 'SEMI',

  RETURN = 'RETURN',
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  SWITCH = 'SWITCH',
  ARROW = 'ARROW',
}

// The TokenTypes that should require a value
type TokenTypesWithValue = [TokenType.COMMENT, TokenType.STRING,];

// Generate a type that includes values from tokenTypesWithValue
type ValueTokenType = Extract<TokenType, TokenTypesWithValue[number]>;

// Generate a type that includes values not in tokenTypesWithValue
type NonValueTokenType = Exclude<TokenType, TokenTypesWithValue[number]>;

interface TokenBase {
  pos: number;
  len: number;
}

interface TokenTypeWithValue extends TokenBase {
  type: ValueTokenType;
  value: string;
}

interface TokenTypeWithoutValue extends TokenBase {
  type: NonValueTokenType;
  value?: never;
}

// The full Token type
export type Token = TokenTypeWithValue | TokenTypeWithoutValue;
