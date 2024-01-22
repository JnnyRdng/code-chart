import React from 'react';
import { useResetBoolean } from '../../hooks/useResetBoolean';

interface Props {
  textToCopy: string;
  buttonText?: string;
}

export const CopyToClipboard = ({ textToCopy, buttonText }: Props) => {

  const [copied, setCopied] = useResetBoolean({ delay: 2000 });

  const copy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
  }

  return (
    <div>
      {copied ? 'copied' : 'not copied'} <br />
      <button onClick={copy}>
        {buttonText ?? 'Copy'}
      </button>
    </div>
  )
}
