import './App.css'
import { CodeEditor } from './components/CodeEditor';
import { useCodeContext } from './store/code-context.store';
import { Viewer } from './components/Viewer';

function App() {
  const { code } = useCodeContext();

  return (
    <div className="">
      <div className='codeWrapper'>
        <CodeEditor />
        <Viewer />
      </div>
    </div>
  )
}

export default App
