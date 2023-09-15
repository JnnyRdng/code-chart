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
  INT_LIT = 'INT_LIT',

  SEMI = 'SEMI',

  RETURN = 'RETURN',
  IF = 'IF',
  ELSE = 'ELSE',
  WHILE = 'WHILE',
  SWITCH = 'SWITCH',
  ARROW = 'ARROW',
}

export interface Token {
  type: TokenType;
  value?: string;
  pos: number;
  len: number;
}