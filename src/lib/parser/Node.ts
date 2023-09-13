import { Token, TokenType } from "../domain/Token";
import { Tokeniser } from "./Tokeniser";

enum BoxShape {
  SQUARE = 'SQUARE',
  CIRCULAR = 'CIRCULAR',
  ROUNDED = 'ROUNDED',
  CONDITION = 'CONDITION',
  PARALLELOGRAM = 'PARALLELOGRAM',
  REVERSE_PARALLELOGRAM = 'REVERSE_PARALLELOGRAM',
}

export const { getId, resetId } = (() => {
  let id = 0;
  return {
    getId: () => id++,
    resetId: () => { id = 0; },
  }
})();

abstract class AbstractNode {

  readonly id: number;
  readonly text: string;
  readonly instructions: AbstractNode[];

  constructor(text: string) {
    if (this.constructor === AbstractNode) {
      throw new Error('Cannot instantiate abstract Node');
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

type FlowchartDirection = 'TD' | 'LR';
class ProgramNode extends AbstractNode {

  constructor(direction: FlowchartDirection) {
    super(`flowchart ${direction};`);
  }

  getMermaid() {
    return this.text + '\n';
  }
}

class ExpressionNode extends AbstractNode {
  readonly shape: BoxShape;

  constructor(text: string, shape?: BoxShape) {
    super(text);
    this.shape = shape ?? BoxShape.SQUARE;
  }

  getMermaid(): string {
    return `  ${this.id}${this.#openBrackets()}"${this.text}"${this.#closeBrackets()}\n`;
  }
  #openBrackets() {
    switch (this.shape) {
      case BoxShape.CIRCULAR: return '((';
      case BoxShape.CONDITION: return '{';
      case BoxShape.ROUNDED: return '(';
      case BoxShape.SQUARE: return '[';
      case BoxShape.PARALLELOGRAM: return '[/';
      case BoxShape.REVERSE_PARALLELOGRAM: return '[\\';
      default:
        throw new Error('Unknown BoxShape');

    }
  }
  #closeBrackets() {
    switch (this.shape) {
      case BoxShape.CIRCULAR: return '))';
      case BoxShape.CONDITION: return '}';
      case BoxShape.ROUNDED: return ')';
      case BoxShape.SQUARE: return ']';
      case BoxShape.PARALLELOGRAM: return '/]';
      case BoxShape.REVERSE_PARALLELOGRAM: return '\\]';
      default:
        throw new Error('Unknown BoxShape');
    }
  }
}

class ConditionNode extends AbstractNode {
  readonly ifBlock: IfBlock;
  readonly elseBlock: ElseBlock;

  constructor(text: string) {
    super(text);
    this.ifBlock = new IfBlock();
    this.elseBlock = new ElseBlock();
  }

  getMermaid(): string {
    return `  ${this.id}{"${this.text}"}\n`;
  }

  getTerminalIds(): number[] {
    let ids = [];
    const lastIf = this.ifBlock.getLastInstruction();
    if (lastIf instanceof ConditionNode) {
      ids.push(...lastIf.getTerminalIds());
    } if (!(lastIf instanceof ReturnNode) && lastIf) {
      ids.push(lastIf.id);
    }
    const lastElse = this.elseBlock.getLastInstruction();
    if (lastElse instanceof ConditionNode) {
      ids.push(...lastElse.getTerminalIds());
    } if (!(lastElse instanceof ReturnNode) && lastElse) {
      ids.push(lastElse.id);
    }
    return ids;
  }
}

class IfBlock extends AbstractNode {

  constructor() {
    super('ifblock');
  }

  getMermaid(): string {
    return '';
  }
}

class ElseBlock extends AbstractNode {

  constructor() {
    super('elseblock');
  }

  getMermaid(): string {
    return '';
  }
}

class ReturnNode extends AbstractNode {
  constructor() {
    super('RETURN');
  }

  getMermaid(): string {
    return '';
  }
}

interface ParserOptions {
  trueLabel: string;
  falseLabel: string;
  flowchartDirection: 'TD' | 'LR';
}

export class NodeParser {

  #tokeniser: Tokeniser;
  tokens: Token[];
  root: ProgramNode;

  scope: number;

  i: number;
  code: string;
  arrows: string;
  options: ParserOptions;


  constructor(tokeniser: Tokeniser, options: Partial<ParserOptions> = {}) {
    resetId();
    this.#tokeniser = tokeniser;
    this.tokens = tokeniser.getTokens();
    this.i = 0;
    this.scope = 0;
    this.code = '';
    this.arrows = '';
    this.options = {
      trueLabel: options.trueLabel || 'True',
      falseLabel: options.falseLabel || 'False',
      flowchartDirection: options.flowchartDirection || 'TD',
    };
    this.root = new ProgramNode(this.options.flowchartDirection);

    while (this.peek()) {
      this.root.addInstructions(this.parse());
    }
    this.generate(this.root);
    this.generateLabels(this.root);
  }

  get mermaid() {
    return this.code + this.arrows;
  }

  generateLabels(root: AbstractNode): number[] {
    for (const [i, node] of root.instructions.entries()) {
      if (node instanceof ReturnNode) {
        continue;
      }
      let previous: AbstractNode | undefined;
      if (i > 0) {
        previous = root.instructions[i - 1];
      }
      if (previous instanceof ExpressionNode) {
        this.addLabel(previous.id, node.id);
      } else if (previous instanceof ConditionNode) {

        /* TODO: 
        i need to find the last node in the if and else blocks.
        if the last node is a return, ignore it.
        if the last node is another condition, get the last node of each of those if and else blocks.
        repeat until the call stack goes haywire.
        gather all the ids into an array
        const previousIds: number[];
        this.addLabel(previousIds.join('&'), node.id);

        */
        // let lastIf = previous.ifBlock.getLastInstruction();
        // let lastElse = previous.elseBlock.getLastInstruction();
        // while (lastIf instanceof ConditionNode) {
        //   lastIf = lastIf.ifBlock.getLastInstruction();
        // }
        // if (!(lastIf instanceof ReturnNode)) {
        //   this.addLabel(lastIf.id, node.id);
        // }
        const previousIds = previous.getTerminalIds().join(' & ');
        this.addLabel(previousIds, node.id);
      }
      if (node instanceof ConditionNode) {
        const firstIf = node.ifBlock.instructions[0];
        this.addLabel(node.id, firstIf.id, this.options.trueLabel);
        this.generateLabels(node.ifBlock);
        const firstElse = node.elseBlock.instructions[0];
        if (firstElse) {
          this.addLabel(node.id, firstElse.id, this.options.falseLabel);
          this.generateLabels(node.elseBlock);
        } else {
          const nextNode = root.instructions[i + 1];
          if (nextNode) {
            this.addLabel(node.ifBlock.getLastInstruction().id, nextNode.id);
            this.addLabel(node.id, nextNode.id, this.options.falseLabel);
          }
        }
      }
    }
    return [];

  }

  addLabel(from: string | number, to: number, label?: string) {
    const tag = label === undefined ? '' : `|${label}|`;
    const arrow = `  ${from}-->${tag}${to}\n`;
    if (!this.arrows.includes(arrow)) {
      this.arrows += arrow;
    }
  }

  generate(node: AbstractNode) {
    this.code += node.getMermaid();
    for (const instruction of node.instructions) {
      this.generate(instruction);
    }
    if (node instanceof ConditionNode) {
      this.generate(node.ifBlock);
      this.generate(node.elseBlock);
    } else if (node instanceof ExpressionNode) {
      return;
    }
  }

  parse(): AbstractNode[] {
    const nodes: AbstractNode[] = [];
    while (this.peek()) {
      if (this.nextMatches(TokenType.STRING, TokenType.SEMI)) {
        const string = this.consume()?.value ?? '';
        this.consume();
        const node = new ExpressionNode(string);
        nodes.push(node);
      } else if (this.nextMatches(TokenType.L_PAREN, TokenType.STRING, TokenType.R_PAREN, TokenType.SEMI)) {
        this.consume();
        const string = this.consume()?.value ?? '';
        this.consume();
        this.consume();
        const node = new ExpressionNode(string, BoxShape.ROUNDED);
        nodes.push(node);
      } else if (this.nextMatches(TokenType.L_PAREN, TokenType.L_PAREN, TokenType.STRING, TokenType.R_PAREN, TokenType.R_PAREN, TokenType.SEMI)) {
        this.consume();
        this.consume();
        const string = this.consume()?.value ?? '';
        this.consume();
        this.consume();
        this.consume();
        const node = new ExpressionNode(string, BoxShape.CIRCULAR);
        nodes.push(node);
      } else if (this.nextMatches(TokenType.FORWARD_SLASH, TokenType.STRING, TokenType.FORWARD_SLASH, TokenType.SEMI)) {
        this.consume();
        const string = this.consume()?.value ?? '';
        this.consume();
        this.consume();
        const node = new ExpressionNode(string, BoxShape.PARALLELOGRAM);
        nodes.push(node);
      } else if (this.nextMatches(TokenType.BACKWARD_SLASH, TokenType.STRING, TokenType.BACKWARD_SLASH, TokenType.SEMI)) {
        this.consume();
        const string = this.consume()?.value ?? '';
        this.consume();
        this.consume();
        const node = new ExpressionNode(string, BoxShape.REVERSE_PARALLELOGRAM);
        nodes.push(node);
      } else if (this.nextMatches(TokenType.R_BRACE)) {
        this.consume();
        return nodes;
      } else if (this.nextMatches(TokenType.IF)) {
        this.consume();
        nodes.push(this.parseIf());
      } else if (this.nextMatches(TokenType.RETURN, TokenType.SEMI)) {
        nodes.push(new ReturnNode());
        this.consume();
        this.consume();
        return nodes;
      } else {
        const token = this.consume();
        console.dir(this.tokens, { depth: null })
        throw new Error(`I don't know what to do with this ${token!.type} at ${token!.pos}`);
      }
    }
    return nodes;
  }

  parseIf(): AbstractNode {
    if (this.peekType() !== TokenType.L_PAREN) {
      throw new Error(`Expected '(' at pos ${this.peek()?.pos}`);
    }
    this.consume();
    if (this.peekType() !== TokenType.STRING) {
      throw new Error(`Expected string at pos ${this.peek()?.pos}`);
    }
    const string = this.consume()?.value ?? '';
    if (!this.nextMatches(TokenType.R_PAREN)) {
      throw new Error(`Expected ')' at pos ${this.peek()?.pos}`);
    }
    this.consume();
    if (!this.nextMatches(TokenType.L_BRACE)) {
      throw new Error(`Expected '{' at pos ${this.peek()?.pos}`);
    }
    this.consume();
    const conditionNode = new ConditionNode(string);
    conditionNode.ifBlock.addInstructions(this.parse());
    if (this.nextMatches(TokenType.ELSE)) {
      this.consume();
      if (!this.nextMatches(TokenType.L_BRACE)) {
        throw new Error(`Expected '{' at pos ${this.peek()?.pos}`);
      }
      this.consume();
      conditionNode.elseBlock.addInstructions(this.parse());
    }
    return conditionNode;
  }


  nextMatches(...tokenTypes: TokenType[]) {
    return tokenTypes.every((type, i) => this.peekType(i) === type);
  }

  peek(at = 0): Token | undefined {
    return this.tokens[this.i + at];
  }

  peekType(at = 0): TokenType | undefined {
    return this.peek(at)?.type;
  }

  consume() {
    if (this.nextMatches(TokenType.L_BRACE)) {
      this.scope++;
    }
    if (this.nextMatches(TokenType.R_BRACE)) {
      this.scope--;
    }
    this.i++;
    return this.peek(-1);
  }

}