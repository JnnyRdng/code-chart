export type FlowchartDirection = 'TD' | 'LR';

export interface ParserOptions {
  trueLabel: string;
  falseLabel: string;
  flowchartDirection: FlowchartDirection;
  theme: boolean;
}

export type ParserOptionsArgs = Partial<ParserOptions>;
