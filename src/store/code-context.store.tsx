import React, { createContext, ReactNode, useContext, useReducer, useState } from 'react';

export interface CodeState {
  code: string;
  setCode: (code: string) => void;
}

const initialValue: CodeState = {
  code: `'this is my string';\n`,
  setCode: (s) => { },
}

export const CodeContext = createContext<CodeState>(initialValue);


interface CodeProviderProps { children: React.ReactNode; }
export const CodeProvider = ({ children }: CodeProviderProps) => {

  const [code, setCode] = useState<string>(initialValue.code);

  return (
    <CodeContext.Provider value={{ code, setCode }}>
      {children}
    </CodeContext.Provider>
  );
}

export const useCodeContext = () => useContext(CodeContext);