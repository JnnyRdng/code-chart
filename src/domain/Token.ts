export enum TokenType {
  R_PAREN = 'R_PAREN',
  L_PAREN = 'L_PAREN',
  R_BRACKET = 'R_BRACKET',
  L_BRACKET = 'L_BRACKET',
  R_BRACE = 'R_BRACE',
  L_BRACE = 'L_BRACE',
  STRING = 'STRING',
  INT_LIT = 'INT_LIT',
  RETURN = 'RETURN',
  SEMI = 'SEMI',
}

export interface Token {
  type: TokenType;
  value?: string;
}