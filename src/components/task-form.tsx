"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Task } from "@/server/store";
import { trpc } from "@/trpc/client";

type Props = {
  task?: Task;
};

export function TaskForm({ task }: Props) {
  const router = useRouter();
  const [titulo, setTitulo] = useState(task?.titulo ?? "");
  const [descricao, setDescricao] = useState(task?.descricao ?? "");
  const [erro, setErro] = useState("");

  const create = trpc.task.create.useMutation({
    onSuccess: () => router.push("/"),
    onError: (error) => setErro(error.message),
  });

  const update = trpc.task.update.useMutation({
    onSuccess: () => router.push("/"),
    onError: (error) => setErro(error.message),
  });

  const pending = create.isPending || update.isPending;

  function onSubmit(event: FormEvent) {
    event.preventDefault();

    const tituloLimpo = titulo.trim();
    if (!tituloLimpo) {
      setErro("Título é obrigatório");
      return;
    }

    setErro("");

    if (task) {
      update.mutate({
        id: task.id,
        titulo: tituloLimpo,
        descricao,
      });
      return;
    }

    create.mutate({
      titulo: tituloLimpo,
      descricao,
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {erro ? (
        <div className="banner err" role="alert">
          {erro}
        </div>
      ) : null}

      <label>
        <span>Título</span>
        <input
          name="titulo"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          disabled={pending}
        />
      </label>

      <label>
        <span>Descrição</span>
        <textarea
          name="descricao"
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          disabled={pending}
        />
      </label>

      <button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
