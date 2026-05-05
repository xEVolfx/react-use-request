# react-use-request

Lightweight React hooks for managing async requests with built-in abort, loading, and status state — written in TypeScript, zero runtime dependencies.

## Installation

```bash
npm install react-use-request
```

> **Peer dependency:** React ≥ 16.8.0 must already be installed in your project.

## Hooks

| Hook | Purpose |
|---|---|
| `useRequest` | Manual trigger — call `request(vars)` whenever you like |
| `useRequestEffect` | Auto-fires on mount and whenever deps change |
| `useStatelessRequest` | Like `useRequest` but does not track response data |

---

## `useRequest`

Gives you full control over when the request fires. Cancels any in-flight request automatically on unmount or when re-triggered.

```tsx
import { useRequest, RequestStatus } from 'react-use-request';

interface User {
  id: number;
  name: string;
}

function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading, status, request, setData } = useRequest<User, Error, number>({
    queryFn: async (signal, id) => {
      const res = await fetch(`/api/users/${id}`, { signal });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json() as Promise<User>;
    },
    onError: (err) => console.error('Request failed:', err.message),
  });

  return (
    <div>
      <button onClick={() => request(userId)} disabled={isLoading}>
        {isLoading ? 'Loading…' : 'Fetch User'}
      </button>

      {status === RequestStatus.Success && data && <p>{data.name}</p>}
      {status === RequestStatus.Error && <p>Something went wrong.</p>}
    </div>
  );
}
```

### Options

| Property | Type | Required | Description |
|---|---|---|---|
| `queryFn` | `(signal: AbortSignal, vars: Var) => Promise<Data>` | Yes | The async function to call. Pass `signal` to `fetch` for automatic cancellation. |
| `onError` | `(err: Err) => void` | No | Called when the request throws. Defaults to `console.error`. |

### Return value

| Property | Type | Description |
|---|---|---|
| `data` | `Data \| undefined` | Result of the last successful request |
| `isLoading` | `boolean` | `true` while a request is in-flight |
| `status` | `RequestStatus` | `'idle' \| 'loading' \| 'success' \| 'error'` |
| `request` | `(vars: Var) => Promise<void>` | Call this to trigger the request |
| `setData` | `(value: Data) => void` | Manually override the data (e.g. optimistic updates) |

---

## `useRequestEffect`

Fires the request automatically on mount and re-fires whenever the dependencies array changes — the effect-driven counterpart to `useRequest`.

```tsx
import { useRequestEffect, RequestStatus } from 'react-use-request';

function PostList({ categoryId }: { categoryId: string }) {
  const { data: posts, isLoading, status } = useRequestEffect<Post[]>(
    {
      queryFn: async (signal) => {
        const res = await fetch(`/api/posts?category=${categoryId}`, { signal });
        return res.json() as Promise<Post[]>;
      },
    },
    [categoryId] // re-fetch whenever categoryId changes
  );

  if (isLoading) return <p>Loading posts…</p>;
  if (status === RequestStatus.Error) return <p>Failed to load posts.</p>;

  return (
    <ul>
      {posts?.map((post) => <li key={post.id}>{post.title}</li>)}
    </ul>
  );
}
```

### Signature

```ts
useRequestEffect<Data, Err>(
  options: UseRequestOptions<Data, Err, void>,
  deps: ReadonlyArray<unknown>
): UseRequestResult<Data, void>
```

Returns the same shape as `useRequest`.

---

## `useStatelessRequest`

Identical to `useRequest` but omits `data` and `setData` — ideal for mutations, form submissions, or any side-effectful call where you don't need the response payload.

```tsx
import { useStatelessRequest, RequestStatus } from 'react-use-request';

interface DeletePayload {
  id: number;
}

function DeleteButton({ postId }: { postId: number }) {
  const { request, isLoading, status } = useStatelessRequest<Error, DeletePayload>({
    queryFn: async (signal, { id }) => {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE', signal });
      if (!res.ok) throw new Error('Delete failed');
    },
    onError: (err) => alert(err.message),
  });

  return (
    <button onClick={() => request({ id: postId })} disabled={isLoading}>
      {isLoading ? 'Deleting…' : 'Delete'}
    </button>
  );
}
```

### Return value

| Property | Type | Description |
|---|---|---|
| `isLoading` | `boolean` | `true` while the request is in-flight |
| `status` | `RequestStatus` | `'idle' \| 'loading' \| 'success' \| 'error'` |
| `request` | `(vars: Var) => Promise<void>` | Trigger the request |

---

## `RequestStatus` enum

```ts
enum RequestStatus {
  Idle    = 'idle',
  Loading = 'loading',
  Success = 'success',
  Error   = 'error',
}
```

---

## Type parameters

All three hooks accept generic type parameters:

```ts
useRequest<Data, Err, Var>()
useRequestEffect<Data, Err>()
useStatelessRequest<Err, Var>()
```

| Parameter | Default | Description |
|---|---|---|
| `Data` | `unknown` | Shape of the successful response |
| `Err` | `Error` | Error type passed to `onError` |
| `Var` | `void` | Argument type for `request()` |

---

## Development

```bash
npm run dev         # watch mode (tsup)
npm run build       # produce dist/
npm run typecheck   # type-check without emitting
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix
npm run format      # Prettier
npm test            # run tests once (Vitest)
npm run test:watch  # run tests in watch mode
```

---

## Publishing

1. Bump the version in `package.json` following [semver](https://semver.org/).
2. Verify what gets published:
   ```bash
   npm publish --dry-run
   ```
3. Publish:
   ```bash
   npm publish
   ```

The `prepublishOnly` script runs `npm run build` automatically before every publish.

---

## License

MIT
