export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: number;
};

export const PAGE_SIZE = 10;

type Memory = {
  byId: Map<string, Task>;
  order: string[];
  indexById: Map<string, number>;
};

const SEEDS: Array<[string, string | undefined]> = [
  ["Revisar o contrato da oficina", "O prazo da renovação cai na sexta."],
  ["Ligar para o fornecedor de tinta", "Pedir o branco fosco que faltou."],
  ["Separar as notas da semana", undefined],
  ["Atualizar a planilha de estoque", "Bater com o que saiu no depósito."],
  ["Agendar a visita técnica", "Preferência pela manhã."],
  ["Conferir o fechamento de março", undefined],
  ["Mandar o orçamento da pintura", "Incluir a parede do corredor."],
  ["Trocar o filtro do ar-condicionado", undefined],
  ["Organizar as pastas do arquivo", "As de 2023 ainda estão na caixa."],
  ["Responder o e-mail da contabilidade", "Eles pediram o extrato de abril."],
  ["Ajustar o texto da proposta", undefined],
  ["Comprar resma e grampos", "Acabou no armário do segundo andar."],
  ["Marcar a reunião com o time", "Cabeça de terça, depois das 14h."],
  ["Revisar as fotos do catálogo", "A da capa ficou escura."],
  ["Passar os pedidos para o depósito", undefined],
  ["Conferir a chave reserva", "A da sala 2 sumiu de novo."],
  ["Imprimir a lista de presença", undefined],
  ["Devolver a furadeira", "Combinado com o João até sexta."],
  ["Fechar o pedido de café", "O pacote grande, o de sempre."],
  ["Atualizar o mural da entrada", "Tirar o aviso de março."],
];

function seed(memory: Memory) {
  const now = Date.now();

  for (let i = 0; i < 40; i += 1) {
    const [base, descricao] = SEEDS[i % SEEDS.length];
    const volta = Math.floor(i / SEEDS.length);
    const titulo = volta === 0 ? base : `${base} (${volta + 1})`;
    const task: Task = {
      id: crypto.randomUUID(),
      titulo,
      descricao,
      dataCriacao: now - (40 - i) * 60 * 60 * 1000,
    };

    memory.byId.set(task.id, task);
    memory.indexById.set(task.id, memory.order.length);
    memory.order.push(task.id);
  }
}

// O Next carrega este arquivo mais de uma vez (rota HTTP e caller do servidor).
// Sem o global, cada cópia teria a sua lista e o SSR divergiria da API.
function getMemory(): Memory {
  const g = globalThis as typeof globalThis & { __taskMemory?: Memory };

  if (!g.__taskMemory) {
    g.__taskMemory = {
      byId: new Map(),
      order: [],
      indexById: new Map(),
    };
    seed(g.__taskMemory);
  }

  return g.__taskMemory;
}

function cleanDescricao(value?: string) {
  const text = value?.trim();
  return text ? text : undefined;
}

function reindexFrom(memory: Memory, start: number) {
  for (let i = start; i < memory.order.length; i += 1) {
    memory.indexById.set(memory.order[i], i);
  }
}

export const store = {
  create(titulo: string, descricao?: string): Task {
    const memory = getMemory();
    const task: Task = {
      id: crypto.randomUUID(),
      titulo: titulo.trim(),
      descricao: cleanDescricao(descricao),
      dataCriacao: Date.now(),
    };

    memory.byId.set(task.id, task);
    memory.indexById.set(task.id, memory.order.length);
    memory.order.push(task.id);
    return task;
  },

  list(cursor: string | undefined, limit: number) {
    const memory = getMemory();
    let end = memory.order.length;

    if (cursor) {
      const index = memory.indexById.get(cursor);
      if (index === undefined) {
        return { items: [] as Task[], nextCursor: undefined };
      }
      end = index;
    }

    const start = Math.max(0, end - limit);
    const items: Task[] = [];

    for (let i = end - 1; i >= start; i -= 1) {
      const task = memory.byId.get(memory.order[i]);
      if (task) items.push(task);
    }

    // nextCursor é o id mais antigo desta página; a próxima começa antes dele.
    const nextCursor = start > 0 ? items[items.length - 1]?.id : undefined;
    return { items, nextCursor };
  },

  getById(id: string) {
    return getMemory().byId.get(id);
  },

  update(id: string, titulo: string, descricao?: string) {
    const memory = getMemory();
    const current = memory.byId.get(id);
    if (!current) return undefined;

    const next: Task = {
      ...current,
      titulo: titulo.trim(),
      descricao: cleanDescricao(descricao),
    };
    memory.byId.set(id, next);
    return next;
  },

  remove(id: string) {
    const memory = getMemory();
    const index = memory.indexById.get(id);
    if (index === undefined) return false;

    memory.byId.delete(id);
    memory.indexById.delete(id);
    memory.order.splice(index, 1);
    reindexFrom(memory, index);
    return true;
  },
};
