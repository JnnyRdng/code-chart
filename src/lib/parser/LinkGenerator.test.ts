import { LinkGenerator } from "./LinkGenerator";
import { NodeParser } from "./NodeParser";
import { Tokeniser } from "./Tokeniser";
import { resetId } from "./Node";


interface GeneratorOptionsArgs {
  trueLabel?: string;
  falseLabel?: string;
  skipGeneration?: boolean;
}

const getGenerator = (input: string, options: GeneratorOptionsArgs = {}) => {
  const tokeniser = new Tokeniser(input);
  tokeniser.tokenise();
  const parser = new NodeParser(tokeniser);
  parser.parse();
  const linkGenerator = new LinkGenerator(parser.root, {
    trueLabel: options.trueLabel ?? 'True',
    falseLabel: options.falseLabel ?? 'False',
  });
  if (!options.skipGeneration) {
    linkGenerator.start();
  }
  return linkGenerator;
}

describe('LinkGenerator tests', () => {

  beforeEach(() => {
    resetId();
  });

  describe('LinkGenerator.addLabel()', () => {
    it('adds a basic label using numbers', () => {
      const generator = getGenerator('');
      generator.addLabel('1', '2');
      expect(generator.text).toStrictEqual('  1-->2\n');
    });

    it('adds a basic label using strings', () => {
      const generator = getGenerator('');
      generator.addLabel('80', '82');
      expect(generator.text).toStrictEqual('  80-->82\n');
    });

    it('adds a label with text', () => {
      const generator = getGenerator('');
      generator.addLabel(5, 6, 'some text');
      expect(generator.text).toStrictEqual('  5-->|some text|6\n');
    });

    it('will add multiple labels', () => {
      const generator = getGenerator('');
      generator.addLabel(5, 6);
      generator.addLabel(6, 7);
      expect(generator.text).toStrictEqual('  5-->6\n  6-->7\n');
    });

    it('will not add a duplicate label', () => {
      const generator = getGenerator('');
      generator.addLabel(5, 6);
      generator.addLabel(5, 6);
      expect(generator.text).toStrictEqual('  5-->6\n');
    });
  });

  it('initialises the text to be empty', () => {
    const generator = getGenerator('one; two', { skipGeneration: true, });
    expect(generator.text).toStrictEqual('');
  });

  it('empty input causes no links to be generated', () => {
    const generator = getGenerator('');
    expect(generator.text).toStrictEqual('');
  });

  it('creates a link between two nodes', () => {
    const generator = getGenerator('one; two;');
    expect(generator.text).toStrictEqual('  1-->2\n');
  });

  it('does not link to a return node', () => {
    const generator = getGenerator('one; return;');
    expect(generator.text).toStrictEqual('');
  });

  describe('Conditions', () => {
    it('will link to both sides of an if/else block', () => {
      const generator = getGenerator('if (true) { one; } else { two; }');
      const expected = '  1-->|True|4\n  1-->|False|5\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('will join both sides back up to a following node', () => {
      const generator = getGenerator('if (true) { one; } else { two; } three;');
      const expected = '  1-->|True|4\n  1-->|False|5\n  4 & 5-->6\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('will respect a return statement in an if block', () => {
      const generator = getGenerator('if (true) { one; return; } else { two; } three;');
      const expected = '  1-->|True|4\n  1-->|False|6\n  6-->7\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('will respect a return statement in an else block', () => {
      const generator = getGenerator('if (true) { one; } else { two; return; } three;');
      const expected = '  1-->|True|4\n  1-->|False|5\n  4-->7\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('will terminate both sides if both contain return statements', () => {
      const generator = getGenerator('if (true) { one; return; } else { two; return; } three;');
      const expected = '  1-->|True|4\n  1-->|False|6\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('will terminate both sides if both contain return statements and start a new graph section', () => {
      const generator = getGenerator('if (true) { one; return; } else { two; return; } three; four;');
      const expected = '  1-->|True|4\n  1-->|False|6\n  8-->9\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('handles an if block without an else', () => {
      const generator = getGenerator('if (true) { one; }');
      const expected = '  1-->|True|4\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('handles an if block without an else that continues on', () => {
      const generator = getGenerator('if (true) { one; } two;');
      const expected = '  1-->|True|4\n  4-->5\n  1-->|False|5\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('uses a custom value for true', () => {
      const generator = getGenerator('if (true) { one; } two;', {
        trueLabel: 'yes',
      });
      const expected = '  1-->|yes|4\n  4-->5\n  1-->|False|5\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('uses a custom value for false', () => {
      const generator = getGenerator('if (true) { one; } two;', {
        falseLabel: 'no',
      });
      const expected = '  1-->|True|4\n  4-->5\n  1-->|no|5\n';
      expect(generator.text).toStrictEqual(expected);
    });

    it('uses a custom value for true and false', () => {
      const generator = getGenerator('if (true) { one; } two;', {
        trueLabel: 'yes',
        falseLabel: 'no',
      });
      const expected = '  1-->|yes|4\n  4-->5\n  1-->|no|5\n';
      expect(generator.text).toStrictEqual(expected);
    });
  });
});