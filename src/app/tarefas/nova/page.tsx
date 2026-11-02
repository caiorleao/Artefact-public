import Link from "next/link";
import { TaskForm } from "@/components/task-form";

export default function NovaTarefaPage() {
  return (
    <main className="wrap">
      <div className="top">
        <h1>Nova tarefa</h1>
        <Link href="/">Voltar</Link>
      </div>
      <div className="card">
        <TaskForm />
      </div>
    </main>
  );
}
