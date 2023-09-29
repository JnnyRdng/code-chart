import './App.css'
import { CodeEditor } from './components/CodeEditor';
import { Viewer } from './components/Viewer';

function App() {

  return (
    <div className="">
      <div className='codeWrapper'>
        <CodeEditor />
        <Viewer />
      </div>
    </div>
  )
}

export default App;
