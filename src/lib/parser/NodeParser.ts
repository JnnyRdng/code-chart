import { ParserOptions, ParserOptionsArgs } from '../domain/Parser';
import { Token, TokenType } from '../domain/Token';
import { BoxShape, boxShapeThemeKeys } from '../domain/BoxShape';
import { AbstractNode, ConditionNode, ExpressionNode, ProgramNode, ReturnNode, resetId } from './Node';
import { Tokeniser } from './Tokeniser';
import { LinkGenerator } from './LinkGenerator';
import { getThemeValue } from '../domain/Themes';

export class NodeParser {

  tokens: Token[];
  root: ProgramNode;

  i: number;
  code: string;
  links: string;
  classDefs: string;
  options: ParserOptions;


  constructor(tokeniser: Tokeniser, options: ParserOptionsArgs = {}) {
    resetId();
    this.tokens = tokeniser.getTokens();
    this.i = 0;
    this.code = '';
    this.links = '';
    this.classDefs = '';
    this.options = {
      trueLabel: options.trueLabel || 'True',
      falseLabel: options.falseLabel || 'False',
      flowchartDirection: options.flowchartDirection ?? 'TD',
      theme: options.theme ?? 'none',
    };
    this.root = new ProgramNode(this.options.flowchartDirection);
  }

  parse() {
    while (this.peek()) {
      this.root.addInstructions(this.#parse());
    }
    this.generate(this.root);
    const linkGenerator = new LinkGenerator(this.root, {
      trueLabel: this.options.trueLabel,
      falseLabel: this.options.falseLabel,
    });
    linkGenerator.start()
    this.links += linkGenerator.text;
    this.addClassDefs();
  }

  addClassDefs() {
    Object.values(boxShapeThemeKeys).forEach(value => {
      this.classDefs += getThemeValue(this.options.theme, value);
    });
  }

  get mermaid() {
    return this.code + this.links + this.classDefs;
  }

  generate(node: AbstractNode) {
    node.setTheme(this.options.theme);
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
        nodes.push(this.#handleSquareString());
      } else if (this.nextMatches(TokenType.L_PAREN, TokenType.STRING, TokenType.R_PAREN, TokenType.SEMI)) {
        nodes.push(this.#handleRoundedString());
      } else if (this.nextMatches(TokenType.L_PAREN, TokenType.L_PAREN, TokenType.STRING, TokenType.R_PAREN, TokenType.R_PAREN, TokenType.SEMI)) {
        nodes.push(this.#handleCircularString());
      } else if (this.nextMatches(TokenType.FORWARD_SLASH, TokenType.STRING, TokenType.FORWARD_SLASH, TokenType.SEMI)) {
        nodes.push(this.#handleParallelogram());
      } else if (this.nextMatches(TokenType.BACKWARD_SLASH, TokenType.STRING, TokenType.BACKWARD_SLASH, TokenType.SEMI)) {
        nodes.push(this.#handleParallelogram(true));
      } else if (this.nextMatches(TokenType.R_BRACE)) {
        this.consume();
        return nodes;
      } else if (this.nextMatches(TokenType.IF)) {
        this.consume();
        nodes.push(this.#parseIf());
      } else if (this.nextMatches(TokenType.RETURN, TokenType.SEMI)) {
        nodes.push(this.#handleReturn());
        return nodes;
      } else if (this.nextMatches(TokenType.COMMENT)) {
        //TODO: would prefer to do something with comments.
        // Maybe put them in a box next to the _next_ string? Dashed line, different formatting?
        // Need to handle multiple consecutive comments, join them together? Might be better to do that in the tokenising stage
        this.consume();
      } else {
        const token = this.consume();
        throw new Error(`Unexpected ${token!.type} at [${token!.pos.ln}:${token!.pos.col}]`);
      }
    }
    return nodes;
  }

  #handleSquareString() {
    const string = this.consume()?.value ?? '';
    this.consume();
    if (this.nextMatches(TokenType.SEMI)) {
      this.consume();
    }
    return new ExpressionNode(string);
  }

  #handleRoundedString() {
    this.consume();
    const string = this.consume()?.value ?? '';
    this.consume();
    this.consume();
    return new ExpressionNode(string, BoxShape.ROUNDED);
  }

  #handleCircularString() {
    this.consume();
    this.consume();
    const string = this.consume()?.value ?? '';
    this.consume();
    this.consume();
    this.consume();
    return new ExpressionNode(string, BoxShape.CIRCULAR);
  }

  #handleParallelogram(reverse = false) {
    this.consume();
    const string = this.consume()?.value ?? '';
    this.consume();
    this.consume();
    return new ExpressionNode(string, reverse ? BoxShape.REVERSE_PARALLELOGRAM : BoxShape.PARALLELOGRAM);
  }

  #handleReturn() {
    this.consume();
    this.consume();
    let scope = 0;
    while (this.peek() && scope > -1) {
      const next = this.consume();
      if (next?.type === TokenType.L_BRACE) {
        scope++;
      }
      if (next?.type === TokenType.R_BRACE) {
        scope--;
      }
    }
    return new ReturnNode();
  }

  #parseIf(): AbstractNode {
    this.consumeIf(TokenType.L_PAREN);
    const string = this.consumeIf(TokenType.STRING)?.value ?? '';
    this.consumeIf(TokenType.R_PAREN);
    this.consumeIf(TokenType.L_BRACE);
    const conditionNode = new ConditionNode(string);
    conditionNode.ifBlock.addInstructions(this.#parse());
    if (this.nextMatches(TokenType.ELSE)) {
      this.consume();
      this.consumeIf(TokenType.L_BRACE);
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
      const c = this.peek();
      const hasPos = c !== undefined;
      const posAndLine = `${c?.pos.pos} (ln: ${c?.pos.ln}, col: ${c?.pos.col})`;
      throw new Error(`Expected '${tokenType}' at pos ${hasPos ? posAndLine : 'EoF'}.`);
    }
    return this.consume();
  }
}
