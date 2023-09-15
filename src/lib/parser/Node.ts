import { BoxShape, boxShapeBracketMap } from "../domain/BoxShape";
import { FlowchartDirection } from "../domain/Parser";


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
}

export class ProgramNode extends AbstractNode {

  constructor(direction: FlowchartDirection) {
    super(`flowchart ${direction};`);
  }

  getMermaid() {
    return this.text + '\n';
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
    return `  ${this.id}${opening}"${this.text}"${closing}\n`;
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
    return `  ${this.id}{"${this.text}"}:::condition\n`;
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
