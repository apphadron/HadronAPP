## 📦 API

### `useSupabaseTable<T>(tableName: string, options?: FetchOptions)`

### 🔁 Tipagem Genérica
`T` representa o tipo dos dados da tabela que você deseja consultar.

---

## 🧾 Parâmetros

### `tableName: string`
Nome da tabela no Supabase.

### `options?: FetchOptions`

```ts
interface FetchOptions {
  useCache?: boolean;
  cacheKey?: string;
  filters?: {
    column: string;
    operator?: '=' | '>' | '<' | '>=' | '<=' | '!=' | 'like' | 'ilike';
    value: any;
  }[];
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  limit?: number;
  columns?: string; // Ex: 'id, name, created_at'
}
```

---

## ✅ Retorno

```ts
{
  data: T[] | null;
  loading: boolean;
  error: any;
}
```

---

## 📘 Exemplos de Uso

### 1. Buscar todos os dados de uma tabela

```tsx
const { data, loading, error } = useSupabaseTable<User>('users');
```

---

### 2. Buscar com filtros

```tsx
const { data, loading, error } = useSupabaseTable<User>('users', {
  filters: [
    { column: 'active', operator: '=', value: true },
    { column: 'age', operator: '>=', value: 18 }
  ]
});
```

---

### 3. Buscar com ordenação

```tsx
const { data, loading } = useSupabaseTable<User>('users', {
  orderBy: { column: 'created_at', ascending: false }
});
```

---

### 4. Buscar com limite

```tsx
const { data } = useSupabaseTable<Post>('posts', {
  limit: 10
});
```

---

### 5. Buscar com colunas específicas

```tsx
const { data } = useSupabaseTable<User>('users', {
  columns: 'id, name, email'
});
```

---

### 6. Uso com cache

```tsx
const { data, loading } = useSupabaseTable<User>('users', {
  useCache: true,
  cacheKey: 'cached_users'
});
```

---

## 💡 Dica

Você pode usar `useMemo` ou `useCallback` para construir dinamicamente os `filters` ou `options` e evitar re-renderizações desnecessárias:

```tsx
const filters = useMemo(() => [
  { column: 'status', value: 'published' }
], []);

const { data } = useSupabaseTable<Post>('posts', { filters });
```

---

## 🧼 Limpar cache manualmente

```ts
await AsyncStorage.removeItem('cached_users');
```

---

## 🛠 Tipos de exemplo

```ts
type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};
```

---

## 📎 Arquivos Relacionados

- `database.service.ts`: Função `fetchFromTable<T>()`
- `useSupabaseTable.ts`: Hook que usa a função acima para facilitar o uso em componentes React

---