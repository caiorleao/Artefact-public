"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PAGE_SIZE } from "@/server/store";
import { trpc } from "@/trpc/client";

function formatDate(value: number) {
  return new Date(value).toLocaleString("pt-BR");
}

export function TaskList() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);
  const utils = trpc.useUtils();

  const list = trpc.task.list.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      getNextPageParam: (last) => last.nextCursor,
    },
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = list;

  const remove = trpc.task.delete.useMutation({
    onSuccess: async () => {
      setBanner({ kind: "ok", text: "Tarefa excluída" });
      await utils.task.list.invalidate();
    },
    onError: (error) => {
      setBanner({ kind: "err", text: error.message });
    },
  });

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { rootMargin: "160px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const tasks = list.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <>
      {banner ? (
        <div className={`banner ${banner.kind}`} role="status">
          {banner.text}
        </div>
      ) : null}

      {list.isError ? (
        <div className="banner err" role="alert">
          {list.error.message}
        </div>
      ) : null}

      {tasks.length === 0 && !list.isLoading ? (
        <p className="muted">Nenhuma tarefa.</p>
      ) : null}

      {tasks.map((task) => (
        <article className="card" key={task.id}>
          <h2>{task.titulo}</h2>
          {task.descricao ? <p>{task.descricao}</p> : null}
          <p className="muted">{formatDate(task.dataCriacao)}</p>
          <div className="actions">
            <Link href={`/tarefas/${task.id}`}>Editar</Link>
            <button
              type="button"
              className="danger"
              disabled={remove.isPending && remove.variables?.id === task.id}
              onClick={() => remove.mutate({ id: task.id })}
            >
              {remove.isPending && remove.variables?.id === task.id
                ? "Excluindo..."
                : "Excluir"}
            </button>
          </div>
        </article>
      ))}

      <div ref={sentinel} className="more">
        {isFetchingNextPage
          ? "Carregando mais tarefas..."
          : hasNextPage
            ? ""
            : tasks.length > 0
              ? "Fim da lista"
              : null}
      </div>
    </>
  );
}
