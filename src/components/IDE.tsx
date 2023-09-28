import React from 'react';
import { useCodeContext } from '../store/code-context.store';
import AceEditor from "react-ace";

import './CodeEditor.css';
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-idle_fingers";
import "ace-builds/src-noconflict/ext-language_tools";


export const IDE = () => {
  const { code, setCode } = useCodeContext();

  return (
    <div className='wrapper'>
      <AceEditor
        mode='javascript'
        theme='idle_fingers'
        onChange={setCode}
        name='ace-code-editor'
        value={code}
        editorProps={{ $blockScrolling: true }}
        fontSize={14}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}