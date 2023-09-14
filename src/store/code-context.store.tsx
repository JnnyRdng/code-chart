import React, { createContext, useContext, useState } from 'react';
import { FlowchartDirection } from '../lib/domain/Parser';

export interface CodeState {
  code: string;
  setCode: (code: string) => void;
  trueLabel: string;
  setTrueLabel: (label: string) => void;
  falseLabel: string;
  setFalseLabel: (label: string) => void;
  direction: FlowchartDirection;
  setDirection: (direction: FlowchartDirection) => void;
}

const initialValue: CodeState = {
  code: `flowchart;\nin mermaid;\nbut not written\nin mermaid;\nwritten in something\na bit like javascript\nbut not entirely like it;\nif (hungry?) {\n  cook some food;\n  eat some food;\n  do the dishes;\n} else {\n  ok;\n  if (thirsty?) {\n    beer;\n  } else {\n    no beer;\n  }\n}\n\go to bed;`,
  setCode: (s) => { },
  trueLabel: 'True',
  setTrueLabel: (s) => { },
  falseLabel: 'False',
  setFalseLabel: (s) => { },
  direction: 'TD',
  setDirection: (s) => { },
}

export const CodeContext = createContext<CodeState>(initialValue);


interface CodeProviderProps { children: React.ReactNode; }
export const CodeProvider = ({ children }: CodeProviderProps) => {

  const [code, setCode] = useState<string>(initialValue.code);
  const [trueLabel, setTrueLabel] = useState<string>(initialValue.trueLabel);
  const [falseLabel, setFalseLabel] = useState<string>(initialValue.falseLabel);
  const [direction, setDirection] = useState<FlowchartDirection>(initialValue.direction);

  return (
    <CodeContext.Provider value={{ code, setCode, trueLabel, setTrueLabel, falseLabel, setFalseLabel, direction, setDirection }}>
      {children}
    </CodeContext.Provider>
  );
}

export const useCodeContext = () => useContext(CodeContext);