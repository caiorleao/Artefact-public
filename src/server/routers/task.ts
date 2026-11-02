import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { PAGE_SIZE, store } from "../store";
import { publicProcedure, router } from "../trpc";

const tituloSchema = z
  .string({ required_error: "Título é obrigatório" })
  .trim()
  .min(1, "Título é obrigatório");

const descricaoSchema = z.string().optional();

function requireTask(id: string) {
  const task = store.getById(id);
  if (!task) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Tarefa não encontrada",
    });
  }
  return task;
}

export const taskRouter = router({
  create: publicProcedure
    .input(
      z.object({
        titulo: tituloSchema,
        descricao: descricaoSchema,
      }),
    )
    .mutation(({ input }) => store.create(input.titulo, input.descricao)),

  list: publicProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().min(1).max(20).default(PAGE_SIZE),
      }),
    )
    .query(({ input }) => store.list(input.cursor, input.limit)),

  getById: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(({ input }) => requireTask(input.id)),

  update: publicProcedure
    .input(
      z.object({
        id: z.string().min(1),
        titulo: tituloSchema,
        descricao: descricaoSchema,
      }),
    )
    .mutation(({ input }) => {
      requireTask(input.id);
      return store.update(input.id, input.titulo, input.descricao);
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ input }) => {
      requireTask(input.id);
      store.remove(input.id);
      return { ok: true };
    }),
});
