import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RequestStatus, useStatelessRequest } from '../src';

describe('useStatelessRequest', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() =>
      useStatelessRequest({ queryFn: vi.fn().mockResolvedValue(undefined) })
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.status).toBe(RequestStatus.Idle);
    // No data property on the result
    expect('data' in result.current).toBe(false);
  });

  it('completes successfully without returning data', async () => {
    const queryFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useStatelessRequest<Error, void>({ queryFn }));

    act(() => {
      void result.current.request();
    });

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Success));

    expect(result.current.isLoading).toBe(false);
    expect(queryFn).toHaveBeenCalledOnce();
  });

  it('calls onError and sets Error status on failure', async () => {
    const error = new Error('stateless-error');
    const onError = vi.fn();
    const queryFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useStatelessRequest<Error, void>({ queryFn, onError })
    );

    act(() => {
      void result.current.request();
    });

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Error));

    expect(onError).toHaveBeenCalledWith(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets isLoading true while request is in-flight', async () => {
    const queryFn = vi.fn(
      () => new Promise<void>((resolve) => setTimeout(resolve, 50))
    );
    const { result } = renderHook(() => useStatelessRequest({ queryFn }));

    act(() => {
      void result.current.request();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.status).toBe(RequestStatus.Success);
  });
});
