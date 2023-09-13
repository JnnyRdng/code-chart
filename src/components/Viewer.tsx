import React, { useEffect, useState } from 'react';
import { useCodeContext } from '../store/code-context.store';
import { Mermaid } from './Mermaid';
import { Tokeniser } from '../lib/parser/Tokeniser';
import { NodeParser } from '../lib/parser/Node';
import { useDebounce } from '../hooks/useDebounce';
import { ErrorWindow } from './ErrorWindow';


export const Viewer = () => {

  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState<string>('');

  const { code } = useCodeContext();
  const debounce = useDebounce(code, 200);

  useEffect(() => {
    try {
      const tokeniser = new Tokeniser(debounce);
      const parser = new NodeParser(tokeniser);
      setText(parser.mermaid);
      setError(null);
    } catch (e: any) {
      if (e instanceof Error) {
        setError(e.message);
      }
    }

    // const tokeniser = new Tokeniser(code);
    // tokeniser.tokenise();
    // const parser = new Parser(tokeniser);
    // parser.parse();
    // try {
    //   const coder = new Code(parser.root);
    //   coder.generate();
    //   setError('');
    //   setText(coder.text);
    //   console.log(coder.text)
    // } catch (e) {
    //   setError('Error!');
    // }
  }, [debounce]);


  // const lexer = new Lexer(code);
  // lexer.getTokens();
  // const parser = new Parser(lexer);
  // parser.parse();

  console.log(text.replaceAll('\n', 'Z'))

  return (
    <div className='viewer-window'>
      <ErrorWindow error={error} />
      {/* {lexer.error !== '' && lexer.error !== undefined && <p>{lexer.error.toString()}</p>} */}
      {/* {parser.error !== '' && <p>{parser.error}</p>} */}
      {/* <Mermaid key={code} chart={'flowchart TD;\n' + code} /> */}
      {/* <Mermaid key={code} chart={parsed} /> */}
      <Mermaid key={text} chart={text} />

    </div>
  );
}