import Link from "next/link";
import { TaskList } from "@/components/task-list";
import { PAGE_SIZE } from "@/server/store";
import { HydrateClient, trpc } from "@/trpc/server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Primeira página no servidor para o HTML já sair com as tarefas.
  await trpc.task.list.prefetchInfinite({ limit: PAGE_SIZE });

  return (
    <main className="wrap">
      <div className="top">
        <h1>Tarefas</h1>
        <Link href="/tarefas/nova">Nova tarefa</Link>
      </div>
      <HydrateClient>
        <TaskList />
      </HydrateClient>
    </main>
  );
}
