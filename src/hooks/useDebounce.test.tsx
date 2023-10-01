import React, { useState } from 'react';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce tests', () => {

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('returns the initial value', () => {
    const { result } = getHook('initial');
    const actual = result.current;
    expect(actual).toStrictEqual('initial');
  });

  it('is a generic type, boolean', () => {
    const { result: booleanResult } = getHook(true);
    expect(typeof booleanResult.current).toStrictEqual('boolean');
  });

  it('is a generic type, string', () => {
    const { result: stringResult } = getHook('true');
    expect(typeof stringResult.current).toStrictEqual('string');
  });

  it('is a generic type, number', () => {
    const { result: numberResult } = getHook(15);
    expect(typeof numberResult.current).toStrictEqual('number');
  });

  it('by default it should update after 500 ms', () => {
    const { result, rerender } = getHook('initial');
    rerender({ value: 'newValue', delay: undefined });
    expect(result.current).toStrictEqual('initial');
    act(() => jest.advanceTimersByTime(499));
    expect(result.current).toStrictEqual('initial');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toStrictEqual('newValue');
  });

  it('updates immediately if the delay is set to 0', () => {
    const { result, rerender } = getHook('initial', 0);
    rerender({ value: 'newValue', delay: 0 });
    // progress time by 0 to allow for state update
    act(() => jest.advanceTimersByTime(0));
    expect(result.current).toStrictEqual('newValue');
  });

  it('if delay is set it takes that long to update', () => {
    const { result, rerender } = getHook('initial', 50);
    rerender({ value: 'newValue', delay: 50 });
    expect(result.current).toStrictEqual('initial');
    act(() => jest.advanceTimersByTime(49));
    expect(result.current).toStrictEqual('initial');
    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toStrictEqual('newValue');
  });

  it('it keeps debouncing the value if the value is repeatedly updated', () => {
    const { result, rerender } = getHook('first', 500);
    expect(result.current).toStrictEqual('first');
    act(() => jest.advanceTimersByTime(400));
    expect(result.current).toStrictEqual('first');
    // update value before delay time is up. The delay will be restarted.
    rerender({ value: 'second', delay: 500 });
    expect(result.current).toStrictEqual('first');
    act(() => jest.advanceTimersByTime(400));
    expect(result.current).toStrictEqual('first');
    // update value again before delay time is up.
    rerender({ value: 'third', delay: 500 });
    expect(result.current).toStrictEqual('first');
    act(() => jest.advanceTimersByTime(400));
    expect(result.current).toStrictEqual('first');
    act(() => jest.advanceTimersByTime(99));
    // With 1ms to go, it's still on the first value
    expect(result.current).toStrictEqual('first');
    act(() => jest.advanceTimersByTime(1));
    // Now on the third value, it never updated to the second.
    expect(result.current).toStrictEqual('third');
  });
});

const getHook = <T,>(value: T, delay?: number) => {
  return renderHook(({ value, delay }: { value: T, delay?: number }) => useDebounce(value, delay), { initialProps: { value, delay } });
}
