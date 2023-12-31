import { ParserOptions, ParserOptionsArgs } from '../domain/Parser';
import { Token, TokenType } from '../domain/Token';
import { BoxShape } from '../domain/BoxShape';
import { AbstractNode, ConditionNode, ExpressionNode, ProgramNode, ReturnNode, resetId } from './Node';
import { Tokeniser } from './Tokeniser';

export class NodeParser {

  tokens: Token[];
  root: ProgramNode;

  i: number;
  code: string;
  arrows: string;
  classDefs: string;
  options: ParserOptions;


  constructor(tokeniser: Tokeniser, options: ParserOptionsArgs = {}) {
    resetId();
    this.tokens = tokeniser.getTokens();
    this.i = 0;
    this.code = '';
    this.arrows = '';
    this.classDefs = '';
    this.options = {
      trueLabel: options.trueLabel || 'True',
      falseLabel: options.falseLabel || 'False',
      flowchartDirection: options.flowchartDirection || 'TD',
      theme: options.theme ?? false,
    };
    this.root = new ProgramNode(this.options.flowchartDirection);
  }

  parse() {
    while (this.peek()) {
      this.root.addInstructions(this.#parse());
    }
    this.generate(this.root);
    this.generateLabels(this.root);
    this.addClassDefs();
  }

  addClassDefs() {
    this.classDefs += '\nclassDef condition fill:#c3516b\n'
  }

  get mermaid() {
    return this.code + this.arrows + this.classDefs;
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

  #parse(): AbstractNode[] {
    const nodes: AbstractNode[] = [];
    while (this.peek()) {
      if (this.nextMatches(TokenType.STRING)) {
        const string = this.consume()?.value ?? '';
        this.consume();
        if (this.nextMatches(TokenType.SEMI)) {
          this.consume();
        }
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
        nodes.push(this.#parseIf());
      } else if (this.nextMatches(TokenType.RETURN, TokenType.SEMI)) {
        nodes.push(new ReturnNode());
        this.consume();
        this.consume();
        let scope = 0;
        while(this.peek() && scope > -1) {
          const next = this.consume();
          if (next?.type === TokenType.L_BRACE) {
            scope++;
          }
          if (next?.type === TokenType.R_BRACE) {
            scope--;
          }
        }
        return nodes;
      } else if (this.nextMatches(TokenType.COMMENT)) {
        //TODO: would prefer to do something with comments.
        // Maybe put them in a box next to the _next_ string? Dashed line, different formatting?
        // Need to handle multiple consecutive comments, join them together? Might be better to do that in the tokenising stage
        this.consume();
      } else {
        const token = this.consume();
        throw new Error(`I don't know what to do with this ${token!.type} at ${token!.pos}`);
      }
    }
    return nodes;
  }

  #parseIf(): AbstractNode {
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
    conditionNode.ifBlock.addInstructions(this.#parse());
    if (this.nextMatches(TokenType.ELSE)) {
      this.consume();
      if (!this.nextMatches(TokenType.L_BRACE)) {
        throw new Error(`Expected '{' at pos ${this.peek()?.pos}`);
      }
      this.consume();
      conditionNode.elseBlock.addInstructions(this.#parse());
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
    this.i++;
    return this.peek(-1);
  }

  consumeIf(tokenType: TokenType) {
    if (this.peekType() !== tokenType) {
      throw new Error(`Expected '${tokenType}' at pos ${this.peek()?.pos ?? 'EoF'}.`);
    }
    return this.consume();
  }
}
