import './App.css'
import { CodeEditor } from './components/CodeEditor';
import { useCodeContext } from './store/code-context.store';
import { Viewer } from './components/Viewer';
import { IDE } from './components/IDE';

function App() {
  const { code } = useCodeContext();

  return (
    <div className="">
      <div className='codeWrapper'>
        {/* <CodeEditor /> */}
        <IDE />
        <Viewer />
      </div>
    </div>
  )
}

export default App
