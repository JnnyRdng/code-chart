import { AbstractNode, ConditionNode, ExpressionNode, ProgramNode, ReturnNode } from "./Node";

interface LinkGeneratorOptions {
  trueLabel: string;
  falseLabel: string;
}

export class LinkGenerator {
  root: ProgramNode;
  options: LinkGeneratorOptions;

  #text: string;

  constructor(root: ProgramNode, options: LinkGeneratorOptions) {
    this.root = root;
    this.options = {
      trueLabel: options.trueLabel,
      falseLabel: options.falseLabel,
    };
    this.#text = '';
  }

  get text() {
    return this.#text;
  }

  start() {
    this.#generate(this.root);
  }

  #generate(root: AbstractNode): number[] {
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
        this.#handleConditionNode(i, root, node);
      }
    }
    return [];
  }

  #handleConditionNode(i: number, root: AbstractNode, node: ConditionNode) {
    const firstIf = node.ifBlock.instructions[0];
    this.addLabel(node.id, firstIf.id, this.options.trueLabel);
    this.#generate(node.ifBlock);
    const firstElse = node.elseBlock.instructions[0];
    if (firstElse) {
      this.addLabel(node.id, firstElse.id, this.options.falseLabel);
      this.#generate(node.elseBlock);
    } else {
      const nextNode = root.instructions[i + 1];
      if (nextNode) {
        this.addLabel(node.ifBlock.getLastInstruction().id, nextNode.id);
        this.addLabel(node.id, nextNode.id, this.options.falseLabel);
      }
    }
  }

  addLabel(from: string | number, to: string | number, label?: string) {
    if (from === undefined || from === '' || to === undefined || to === '') return;
    const tag = label === undefined ? '' : `|${label}|`;
    const arrow = `  ${from}-->${tag}${to}\n`;
    if (!this.text.includes(arrow)) {
      this.#text += arrow;
    }
  }
}
