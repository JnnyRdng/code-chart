import React, { useEffect, useState } from 'react';
import { useCodeContext } from '../store/code-context.store';
import { Mermaid } from './Mermaid';
import { Tokeniser } from '../lib/parser/Tokeniser';
import { useDebounce } from '../hooks/useDebounce';
import { ErrorWindow } from './ErrorWindow';
import { NodeParser } from '../lib/parser/NodeParser';
import { FlowchartDirection } from '../lib/domain/Parser';


export const Viewer = () => {

  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>('');

  const { code, direction, trueLabel, falseLabel, setDirection, setTrueLabel, setFalseLabel, } = useCodeContext();
  const debounce = useDebounce(code, 200);

  useEffect(() => {
    try {
      const tokeniser = new Tokeniser(debounce);
      tokeniser.tokenise();
      const parser = new NodeParser(tokeniser, { trueLabel, falseLabel, flowchartDirection: direction });
      parser.parse();
      setText(parser.mermaid);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }
  }, [debounce, direction, falseLabel, trueLabel]);


  return (
    <div className='viewer-window'>
      <div>
        <input id='topdown' type='radio' value={'TD'} name='direction' onChange={e => setDirection(e.target.value as FlowchartDirection)} />
        <label htmlFor='topdown'>Top-to-bottom</label>
        <input id='leftright' type='radio' value={'LR'} name='direction' onChange={e => setDirection(e.target.value as FlowchartDirection)} />
        <label htmlFor='leftright'>Left-to-right</label>
        <label htmlFor='trueLabel'>True Label</label>
        <input id='trueLabel' value={trueLabel} onChange={e => setTrueLabel(e.target.value)} />
        <label htmlFor='falseLabel'>False Label</label>
        <input id='falseLabel' value={falseLabel} onChange={e => setFalseLabel(e.target.value)} />

      </div>
      <ErrorWindow error={error} />
      {/* {lexer.error !== '' && lexer.error !== undefined && <p>{lexer.error.toString()}</p>} */}
      {/* {parser.error !== '' && <p>{parser.error}</p>} */}
      {/* <Mermaid key={code} chart={'flowchart TD;\n' + code} /> */}
      {/* <Mermaid key={code} chart={parsed} /> */}
      <Mermaid key={text} chart={text} />

    </div>
  );
}