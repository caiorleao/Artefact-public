# Tarefas

Lista de tarefas que fica na memória do processo do Next. Não tem banco. Ao parar o servidor, a lista volta ao estado inicial.

## Como rodar

```
npm install
npm run dev
```

Abre em http://localhost:3000.

## Rotas

- `/` — lista
- `/tarefas/nova` — criar
- `/tarefas/[id]` — editar

O browser fala com o tRPC em `/api/trpc`.
