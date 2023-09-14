export type FlowchartDirection = 'TD' | 'LR';

export interface ParserOptions {
  trueLabel: string;
  falseLabel: string;
  flowchartDirection: FlowchartDirection;
}

export type ParserOptionsArgs = Partial<ParserOptions>;
