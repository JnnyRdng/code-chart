import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useResetBoolean } from './useResetBoolean';

describe('useResetBoolean tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('returns the initial value', () => {
    const { result, } = getHook(true);
    expect(result.current[0]).toStrictEqual(true);
  });

  it('has a default value of false', () => {
    const { result } = getHook();
    expect(result.current[0]).toStrictEqual(false);
  });

  it('can change value', () => {
    const { result, } = getHook();
    const [, update] = result.current;
    expect(result.current[0]).toStrictEqual(false);
    act(() => { update(true); });
    expect(result.current[0]).toStrictEqual(true);
  });

  it('can change value back', () => {
    const { result, } = getHook();
    const [, update] = result.current;
    expect(result.current[0]).toStrictEqual(false);
    act(() => { update(true); });
    expect(result.current[0]).toStrictEqual(true);
    act(() => { update(false); });
    expect(result.current[0]).toStrictEqual(false);
  });

  it('value will reset to initial after default 1000ms', () => {
    const { result, } = getHook();
    const [, update] = result.current;
    expect(result.current[0]).toStrictEqual(false);
    act(() => { update(true); });
    act(() => { jest.advanceTimersByTime(999); });
    expect(result.current[0]).toStrictEqual(true);
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current[0]).toStrictEqual(false);
  });

  it('value will reset to initial after custom delay', () => {
    const delay = 100;
    const { result, } = getHook(false, delay);
    const [, update] = result.current;
    expect(result.current[0]).toStrictEqual(false);
    act(() => { update(true); });
    const first = 99;
    const second = 1;
    expect(first + second).toStrictEqual(delay);
    act(() => { jest.advanceTimersByTime(first); });
    expect(result.current[0]).toStrictEqual(true);
    act(() => { jest.advanceTimersByTime(second); });
    expect(result.current[0]).toStrictEqual(false);
  });

  it('resets immediately if the delay is set to 0', () => {
    const { result, } = getHook(true, 0);
    const [, update] = result.current;
    expect(result.current[0]).toStrictEqual(true);
    act(() => { update(false); });
    // progress time by 0, allows for state update
    act(() => { jest.advanceTimersByTime(0); });
    expect(result.current[0]).toStrictEqual(true);
  });

  it('keeps resetting the delay if the value is changed repeatedly', () => {
    const { result, } = getHook();
    const [, update] = result.current;
    expect(result.current[0]).toStrictEqual(false);
    act(() => { jest.advanceTimersByTime(900); });
    act(() => { update(true); });
    act(() => { jest.advanceTimersByTime(900); });
    act(() => { update(false); });
    act(() => { jest.advanceTimersByTime(900); });
    act(() => { update(true); });
    act(() => { jest.advanceTimersByTime(999); });
    expect(result.current[0]).toStrictEqual(true);
    act(() => { jest.advanceTimersByTime(1); });
    expect(result.current[0]).toStrictEqual(false);
  });
});

const getHook = (initial?: boolean, delay?: number) => {
  return renderHook(({ initial, delay }: { initial?: boolean, delay?: number }) => useResetBoolean({ initial, delay }), { initialProps: { initial, delay } });
}
