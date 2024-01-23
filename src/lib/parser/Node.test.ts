import { BoxShape } from "../domain/BoxShape";
import { FlowchartDirection } from "../domain/Parser";
import { AbstractNode, ConditionNode, ElseBlock, ExpressionNode, IfBlock, ProgramNode, ReturnNode, getId, resetId } from "./Node";

describe('Node tests', () => {

  beforeEach(() => {
    resetId();
  });

  describe('Utilities', () => {

    it('increments id', () => {
      expect(getId()).toEqual(0);
      expect(getId()).toEqual(1);
    });

    it('resets id', () => {
      expect(getId()).toEqual(0);
      resetId();
      expect(getId()).toEqual(0);
    });
  });

  describe('AbstractNode', () => {
    it('Cannot instantiate', () => {
      expect(() => {
        // @ts-ignore
        new AbstractNode('test');
      }).toThrow('Cannot instantiate AbstractNode');
    });

    it('getMermaid method must be overridden', () => {
      // a class extending AbstractNode, without an explicit override.
      class TestNode extends AbstractNode {
        constructor() {
          super('test');
        }
      }

      const testNode = new TestNode();
      expect(testNode.id).toStrictEqual(0);
      expect(testNode.text).toStrictEqual('test');
      expect(() => testNode.getMermaid()).toThrow("'getMermaid()' not implemented in class TestNode extends _Node.AbstractNode");
    });
  });

  describe('ProgramNode', () => {
    let node: ProgramNode;
    let dir: FlowchartDirection;

    beforeEach(() => {
      dir = 'TD';
      node = new ProgramNode(dir);
    });

    it('has an id', () => {
      expect(node.id).toEqual(0);
    });

    it('has the flowchart directive', () => {
      expect(node.getMermaid()).toStrictEqual('flowchart TD;\n');
      expect(node.text).toStrictEqual('flowchart TD;');
    });

    it('accepts an alternative direction', () => {
      node = new ProgramNode('LR');
      expect(node.text).toStrictEqual('flowchart LR;');
    });

    it('has an instruction list', () => {
      expect(node.instructions).toHaveLength(0);
      const anotherNode = new ProgramNode('LR');
      node.addInstruction(anotherNode);
      expect(node.instructions).toHaveLength(1);
      expect(node.instructions[0]).toBe(anotherNode);
    });

    it('can add multiple nodes to instruction list at once', () => {
      const one = new ProgramNode('TD');
      const two = new ProgramNode('TD');
      node.addInstructions([one, two]);
      expect(node.instructions).toHaveLength(2);
    });

    it('gets the last node in the instruction list', () => {
      const one = new ProgramNode('TD');
      const two = new ProgramNode('TD');
      node.addInstructions([one, two]);
      expect(node.getLastInstruction()).toStrictEqual(two);
    });
  });

  describe('ExpressionNode', () => {
    let node: ExpressionNode;

    beforeEach(() => {
      node = new ExpressionNode('test');
    });

    it('has an id', () => {
      expect(node.id).toEqual(0);
    });

    it('has a default shape == BoxShape.SQUARE', () => {
      expect(node.shape).toStrictEqual(BoxShape.SQUARE);
    });

    it('SQUARE getMermaid returns a mermaid box identifier', () => {
      const mermaid = '  0["test"]\n';
      expect(node.getMermaid()).toStrictEqual(mermaid);
    });

    it('CIRCULAR getMermaid returns a mermaid box identifier', () => {
      resetId();
      node = new ExpressionNode('test', BoxShape.CIRCULAR);
      const mermaid = '  0(("test"))\n';
      expect(node.getMermaid()).toStrictEqual(mermaid);
    });

    it('ROUNDED getMermaid returns a mermaid box identifier', () => {
      resetId();
      node = new ExpressionNode('testers', BoxShape.ROUNDED);
      const mermaid = '  0("testers")\n';
      expect(node.getMermaid()).toStrictEqual(mermaid);
    });

    it('PARALLELOGRAM getMermaid returns a mermaid box identifier', () => {
      resetId();
      node = new ExpressionNode('tests', BoxShape.PARALLELOGRAM);
      const mermaid = '  0[/"tests"/]\n';
      expect(node.getMermaid()).toStrictEqual(mermaid);
    });

    it('REVERSE_PARALLELOGRAM getMermaid returns a mermaid box identifier', () => {
      resetId();
      node = new ExpressionNode('testing', BoxShape.REVERSE_PARALLELOGRAM);
      const mermaid = '  0[\\"testing"\\]\n';
      expect(node.getMermaid()).toStrictEqual(mermaid);
    });

    it('CONDITION getMermaid returns a mermaid box identifier', () => {
      resetId();
      node = new ExpressionNode('test', BoxShape.CONDITION);
      const mermaid = '  0{"test"}\n';
      expect(node.getMermaid()).toStrictEqual(mermaid);
    });

    it('throws error on unknown BoxShape brackets', () => {
      // @ts-ignore
      node = new ExpressionNode('test', 'not a box shape');
      expect(() => node.getMermaid()).toThrow('Unknown BoxShape');
    });
  });

  describe('ConditionNode', () => {
    let node: ConditionNode;

    beforeEach(() => {
      node = new ConditionNode('condition');
    });

    it('instantiates with an if block', () => {
      expect(node.ifBlock).toBeInstanceOf(IfBlock);
      expect(node.ifBlock).not.toBeUndefined();
      expect(node.ifBlock.instructions).toHaveLength(0);
    });

    it('instantiates with an else block', () => {
      expect(node.elseBlock).toBeInstanceOf(ElseBlock);
      expect(node.elseBlock).not.toBeUndefined();
      expect(node.elseBlock.instructions).toHaveLength(0);
    });

    it('generates a mermaid decision block', () => {
      expect(node.text).toStrictEqual('condition');
      expect(node.getMermaid()).toStrictEqual('  0{"condition"}\n');
    });

    it('getTerminalIds() gets the last nodes in the if and else blocks', () => {
      const terminalIfNode = new ExpressionNode('.');
      node.ifBlock.addInstruction(terminalIfNode);
      const terminalElseNode = new ExpressionNode('.');
      node.elseBlock.addInstruction(terminalElseNode);
      const expected = [terminalIfNode.id, terminalElseNode.id];
      expect(node.getTerminalIds()).toStrictEqual(expected);
    });

    it('getTerminalIds() skips a node if it is a ReturnNode', () => {
      const terminalIfNode = new ExpressionNode('.');
      node.ifBlock.addInstruction(terminalIfNode);
      const terminalElseNode = new ReturnNode();
      node.elseBlock.addInstruction(terminalElseNode);
      const expected = [terminalIfNode.id];
      expect(node.getTerminalIds()).toStrictEqual(expected);
    });

    it('getTerminalIds() recurses down the tree if an if terminal node is another ConditionNode', () => {
      const terminalIfNode = new ConditionNode('another');
      node.ifBlock.addInstruction(terminalIfNode);
      const terminalElseNode = new ExpressionNode('.');
      node.elseBlock.addInstruction(terminalElseNode);
      const nestedIfNode = new ExpressionNode('.');
      terminalIfNode.ifBlock.addInstruction(nestedIfNode);
      const nestedElseNode = new ExpressionNode('.');
      terminalIfNode.elseBlock.addInstruction(nestedElseNode);
      const expected = [nestedIfNode.id, nestedElseNode.id, terminalElseNode.id];
      expect(node.getTerminalIds()).toStrictEqual(expected);
    });

    it('getTerminalIds() recurses down the tree if an else terminal node is another ConditionNode', () => {
      const terminalIfNode = new ExpressionNode('.');
      node.ifBlock.addInstruction(terminalIfNode);
      const terminalElseNode = new ConditionNode('another');
      node.elseBlock.addInstruction(terminalElseNode);
      const nestedIfNode = new ExpressionNode('.');
      terminalElseNode.ifBlock.addInstruction(nestedIfNode);
      const nestedElseNode = new ExpressionNode('.');
      terminalElseNode.elseBlock.addInstruction(nestedElseNode);
      const expected = [terminalIfNode.id, nestedIfNode.id, nestedElseNode.id];
      expect(node.getTerminalIds()).toStrictEqual(expected);
    });
  });

  describe('IfBlock', () => {
    it('An IfBlock does not produce mermaid code', () => {
      const node = new IfBlock();
      expect(node.getMermaid()).toStrictEqual('');
    });

    it('An IfBlock has instructions', () => {
      const node = new IfBlock();
      expect(node.instructions).toHaveLength(0);
    });
  });

  describe('ElseBlock', () => {
    it('An ElseBlock does not produce mermaid code', () => {
      const node = new ElseBlock();
      expect(node.getMermaid()).toStrictEqual('');
    });

    it('An ElseBlock has instructions', () => {
      const node = new ElseBlock();
      expect(node.instructions).toHaveLength(0);
    });
  });

  describe('ReturnNode', () => {
    let node: ReturnNode;
    beforeEach(() => {
      node = new ReturnNode();
    });

    it('An ReturnNode does not produce mermaid code', () => {
      expect(node.getMermaid()).toStrictEqual('');
    });

    it('An ReturnNode has instructions', () => {
      expect(node.instructions).toHaveLength(0);
    });

    it('cannot add an instruction to a ReturnNode', () => {
      expect(() => {
        node.addInstruction(new ExpressionNode('.'));
      }).toThrow('Cannot add instruction to a ReturnNode');
    });

    it('cannot add an instructions to a ReturnNode', () => {
      expect(() => {
        node.addInstructions([new ExpressionNode('.')]);
      }).toThrow('Cannot add instruction to a ReturnNode');
    });
  });
});
