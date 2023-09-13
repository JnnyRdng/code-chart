import React from 'react';
import Editor from "react-simple-code-editor";
import { Highlight, themes } from "prism-react-renderer";
// import darkTheme from "prism-react-renderer/themes/nightOwl";
// import lightTheme from "prism-react-renderer/themes/nightOwlLight";
import { useCodeContext } from '../store/code-context.store';
import './CodeEditor.css';

export const CodeEditor = () => {

  const { code, setCode } = useCodeContext();

  const highlight = (code: string) => (
    <Highlight
      // {...defaultProps}
      theme={themes.jettwaveDark}
      code={code}
      language='javascript'
    >
      {({ tokens, getLineProps, getTokenProps }) => (
        <>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })} className='code-line' data-ln={i + 1}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </>
      )}
    </Highlight>
  );

  const darkThemeStyle = {
    root: {
      fontFamily: '"Fira code", "Fira Mono", monospace',
      fontSize: 16,
      ...themes.dracula,
      backgroundColor: 'rgb(19, 24, 37)',
      borderColor: 'black',
      borderWidth: '1em',
      minHeight: '100%'
    },
    backgroundColor: "linear-gradient(to left bottom, rgb(55, 65, 81), rgb(17, 24, 39), rgb(0, 0, 0)",
  }


  return (
    <div className='wrapper'>
      <Editor
        className='code-window'
        value={code}
        onValueChange={setCode}
        highlight={(code) => highlight(code)}
        padding={10}
        style={darkThemeStyle.root}
        aria-rowcount={50}
      />
    </div>
  );
}