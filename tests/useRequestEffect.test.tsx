import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { RequestStatus, useRequestEffect } from '../src';

describe('useRequestEffect', () => {
  it('fires the request immediately on mount', async () => {
    const queryFn = vi.fn().mockResolvedValue('auto');

    const { result } = renderHook(() =>
      useRequestEffect({ queryFn }, [])
    );

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Success));

    expect(queryFn).toHaveBeenCalledOnce();
    expect(result.current.data).toBe('auto');
  });

  it('re-fires when a dependency changes', async () => {
    let dep = 1;
    const queryFn = vi.fn().mockResolvedValue('result');

    const { result, rerender } = renderHook(() =>
      useRequestEffect({ queryFn }, [dep])
    );

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Success));
    expect(queryFn).toHaveBeenCalledTimes(1);

    dep = 2;
    rerender();

    await waitFor(() => expect(queryFn).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Success));
  });

  it('handles errors from the auto-fired request', async () => {
    const error = new Error('effect-error');
    const onError = vi.fn();
    const queryFn = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() =>
      useRequestEffect({ queryFn, onError }, [])
    );

    await waitFor(() => expect(result.current.status).toBe(RequestStatus.Error));

    expect(onError).toHaveBeenCalledWith(error);
  });
});
