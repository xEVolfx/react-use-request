import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RequestStatus, useRequest } from '../src';

const makeQueryFn = (data: string, delay = 0) =>
  vi.fn(
    () => new Promise<string>((resolve) => setTimeout(() => resolve(data), delay))
  );

describe('useRequest', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() =>
      useRequest({ queryFn: makeQueryFn('data') })
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.status).toBe(RequestStatus.Idle);
  });

  it('sets data and status on successful request', async () => {
    const queryFn = makeQueryFn('hello');
    const { result } = renderHook(() => useRequest({ queryFn }));

    act(() => {
      void result.current.request();
    });

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Success));

    expect(result.current.data).toBe('hello');
    expect(result.current.isLoading).toBe(false);
    expect(queryFn).toHaveBeenCalledOnce();
  });

  it('calls onError and sets Error status on failure', async () => {
    const error = new Error('boom');
    const onError = vi.fn();
    const queryFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useRequest<never, Error, void>({ queryFn, onError }));

    act(() => {
      void result.current.request();
    });

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Error));

    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not update state after unmount (abort on cleanup)', async () => {
    const queryFn = makeQueryFn('late', 100);
    const { result, unmount } = renderHook(() => useRequest({ queryFn }));

    act(() => {
      void result.current.request();
    });

    // Unmount while the request is still in-flight
    unmount();

    // State should remain in the loading snapshot captured before unmount;
    // no state-update warnings should be thrown.
    await act(() => new Promise((r) => setTimeout(r, 200)));

    expect(result.current.status).toBe(RequestStatus.Loading);
  });

  it('allows manually setting data via setData', async () => {
    const { result } = renderHook(() =>
      useRequest({ queryFn: makeQueryFn('original') })
    );

    act(() => {
      void result.current.request();
    });

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Success));

    act(() => {
      result.current.setData('overridden');
    });

    expect(result.current.data).toBe('overridden');
  });
});
