import React, { useEffect, useState } from 'react';
import { useCodeContext } from '../store/code-context.store';
import { useLocalStorage } from 'usehooks-ts';

interface Props {

}

interface Map {
  [key: string]: string;
}

export const Storage = ({ }: Props) => {

  const [storage, setStorage] = useLocalStorage<string>('map', '{}');
  const [name, setName] = useState<string>('');
  const [chosen, setChosen] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);

  const { code, setCode } = useCodeContext();

  const obj = JSON.parse(storage);
  const keys = Object.keys(obj);
  const allowSave = name.length > 0;

  useEffect(() => {
    const keys = Object.keys(JSON.parse(storage));
    setOptions(keys);
    if (keys.length === 0 || chosen !== '') return;
    setCode(obj[keys[0]]);
    setChosen(keys[0]);
    setName(keys[0]);
  }, [storage]);

  const save = () => {
    if (!allowSave) return;
    const newObj = {
      ...obj,
      [name]: code,
    }
    setChosen(name)
    setStorage(JSON.stringify(newObj));
  }

  const handleChoice = (choice: string) => {
    setChosen(choice);
    setCode(obj[choice]);
    setName(choice);
  }


  return (
    <>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={save} disabled={!allowSave}>Save</button>

      <select value={chosen} onChange={e => handleChoice(e.target.value)}>
        <option value={''} disabled >Select saved</option>
        {options.map(o => (<option value={o} key={o}>{o}</option>))}
      </select>
    </>
  );
}
