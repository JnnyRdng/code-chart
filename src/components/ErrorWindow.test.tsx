import React from 'react';
import { render } from '@testing-library/react';
import { ErrorWindow } from './ErrorWindow';

describe('ErrorWindow tests', () => {
  const renderComponent = (error: string | null) => {
    return render(<ErrorWindow error={error} />);
  }

  it('renders nothing when there is no error', () => {
    const { container, } = renderComponent(null);
    expect(container.innerHTML).toBe('');
    expect(container.innerHTML).not.toContain('class="error-window"')
  });

  it('renders an .error-window div when given an error', () => {
    const { container, } = renderComponent('error');
    expect(container.innerHTML).toContain('<div class="error-window"')
    const divs = container.getElementsByClassName('error-window');
    expect(divs).toHaveLength(1);
  });

  it('renders the error message in a pre tag', () => {
    const { container, } = renderComponent('there has been an error');
    expect(container.innerHTML).toContain('<pre>there has been an error</pre>');
  });
});
