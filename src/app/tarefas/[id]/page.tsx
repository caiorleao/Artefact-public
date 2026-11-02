import Link from "next/link";
import { TaskForm } from "@/components/task-form";
import { trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarTarefaPage({ params }: Props) {
  const { id } = await params;

  try {
    const task = await trpc.task.getById({ id });

    return (
      <main className="wrap">
        <div className="top">
          <h1>Editar tarefa</h1>
          <Link href="/">Voltar</Link>
        </div>
        <div className="card">
          <TaskForm task={task} />
        </div>
      </main>
    );
  } catch {
    return (
      <main className="wrap">
        <div className="top">
          <h1>Editar tarefa</h1>
          <Link href="/">Voltar</Link>
        </div>
        <div className="banner err" role="alert">
          Tarefa não encontrada
        </div>
      </main>
    );
  }
}
