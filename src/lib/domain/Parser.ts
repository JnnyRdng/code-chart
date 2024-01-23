import { ThemeKey } from "./Themes";

export type FlowchartDirection = 'TD' | 'LR';

export interface ParserOptions {
  trueLabel: string;
  falseLabel: string;
  flowchartDirection: FlowchartDirection;
  theme: ThemeKey;
}

export type ParserOptionsArgs = Partial<ParserOptions>;
