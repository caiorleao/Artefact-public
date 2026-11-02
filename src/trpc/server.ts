import { cache } from "react";
import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory } from "@/server/trpc";
import { makeQueryClient } from "./query-client";

const getQueryClient = cache(makeQueryClient);
const caller = createCallerFactory(appRouter)({});

export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient,
);
