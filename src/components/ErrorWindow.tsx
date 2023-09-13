import React from 'react';

interface Props {
  error: string | null;
}

export const ErrorWindow = ({ error }: Props) => {

  if (error === null) return null;
  return (
    <div className='error-window'>
      <pre>{error}</pre>
    </div>
  );
}