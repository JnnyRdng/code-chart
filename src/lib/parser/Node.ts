import { BoxShape, boxShapeBracketMap, boxShapeThemeKeys } from "../domain/BoxShape";
import { FlowchartDirection } from "../domain/Parser";
import { ThemeKey, getThemeClass } from "../domain/Themes";


export const { getId, resetId } = (() => {
  let id = 0;
  return {
    getId: () => id++,
    resetId: () => { id = 0; },
  }
})();

export abstract class AbstractNode {

  readonly id: number;
  readonly text: string;
  readonly instructions: AbstractNode[];
  theme: ThemeKey = 'none';

  constructor(text: string) {
    if (this.constructor === AbstractNode) {
      throw new Error('Cannot instantiate AbstractNode');
    }
    this.id = getId();
    this.text = text;
    this.instructions = []
  }

  addInstruction(node: AbstractNode) {
    this.instructions.push(node);
  }

  addInstructions(nodes: AbstractNode[]) {
    for (const node of nodes) {
      this.addInstruction(node);
    }
  }

  getLastInstruction() {
    return this.instructions[this.instructions.length - 1];
  }

  getMermaid(): string {
    throw new Error(`'getMermaid()' not implemented in ${this.constructor}`);
  }

  setTheme(theme: ThemeKey) {
    this.theme = theme;
  }
}

export class ProgramNode extends AbstractNode {

  constructor(direction: FlowchartDirection) {
    super(`flowchart ${direction};`);
  }

  getMermaid() {
    const config = {
      flowchart: {
        curve: 'bumpY',
        // defaultRenderer: 'elk'
      },
      themeVariables: {
        lineColor: 'hotpink'
      }
    }

    const init = `%%{ init: ${JSON.stringify(config)} }%%\n`
    return init + this.text + '\n';
  }
}

export class ExpressionNode extends AbstractNode {
  readonly shape: BoxShape;

  constructor(text: string, shape?: BoxShape) {
    super(text);
    this.shape = shape ?? BoxShape.SQUARE;
  }

  getMermaid(): string {
    const [opening, closing] = this.#getBrackets(this.shape);
    return `  ${this.id}${opening}"${this.text}"${closing}${getThemeClass(this.theme, this.#getThemeKey())}\n`;
  }

  #getThemeKey() {
    return boxShapeThemeKeys[this.shape];
  }

  #getBrackets(shape: BoxShape): [string, string] {
    const brackets = boxShapeBracketMap[shape];
    if (!brackets) {
      throw new Error('Unknown BoxShape');
    }
    return brackets;
  }
}

export class ConditionNode extends AbstractNode {
  readonly ifBlock: IfBlock;
  readonly elseBlock: ElseBlock;

  constructor(text: string) {
    super(text);
    this.ifBlock = new IfBlock();
    this.elseBlock = new ElseBlock();
  }

  getMermaid(): string {
    return `  ${this.id}{"${this.text}"}${getThemeClass(this.theme, 'condition')}\n`;
  }

  getTerminalIds(): number[] {
    let ids = [];
    const lastIf = this.ifBlock.getLastInstruction();
    if (lastIf instanceof ConditionNode) {
      ids.push(...lastIf.getTerminalIds());
    } else if (!(lastIf instanceof ReturnNode) && lastIf) {
      ids.push(lastIf.id);
    }
    const lastElse = this.elseBlock.getLastInstruction();
    if (lastElse instanceof ConditionNode) {
      ids.push(...lastElse.getTerminalIds());
    } else if (!(lastElse instanceof ReturnNode) && lastElse) {
      ids.push(lastElse.id);
    }
    return ids;
  }
}

export class IfBlock extends AbstractNode {

  constructor() {
    super('ifblock');
  }

  getMermaid(): string {
    return '';
  }
}

export class ElseBlock extends AbstractNode {

  constructor() {
    super('elseblock');
  }

  getMermaid(): string {
    return '';
  }
}

export class ReturnNode extends AbstractNode {
  constructor() {
    super('RETURN');
  }

  getMermaid(): string {
    return '';
  }

  addInstruction(node: AbstractNode): void {
    throw new Error('Cannot add instruction to a ReturnNode');
  }
}
