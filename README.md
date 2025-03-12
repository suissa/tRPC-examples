![Logo tRPC](https://trpc.io/img/logo-text-black.svg)

# Por que usar tRPC? 🚀

**tRPC (TypeScript Remote Procedure Call)** é uma ferramenta revolucionária para construir APIs **totalmente tipadas** com TypeScript. Eis por que você deveria considerar usá-la:

---

## Principais Vantagens

### 1. **Segurança de Tipos End-to-End**
   - Tipos compartilhados entre cliente/servidor
   - Erros detectados em tempo de compilação
   - Autocomplete inteligente em ambas as extremidades

### 2. **Produtividade Extrema**
   - Zero boilerplate de tipos
   - Atualizações de API em tempo real
   - Documentação automática via tipos

### 3. **Experiência do Desenvolvedor**
   - Não precisa de:
     - Geração de código
     - Schemas externos (GraphQL)
     - DTOs manuais
   - Integração perfeita com seu stack existente

### 4. **Performance**
   - Comunicação ultra-leve via HTTP/RPC
   - Sem overhead de serialização
   - Cache automático no cliente

---

## Comparação com Abordagens Tradicionais

|                          | REST         | GraphQL      | tRPC          |
|--------------------------|--------------|--------------|---------------|
| **Tipagem**              | Manual       | Parcial       | Automática    |
| **Boilerplate**           | Alto         | Moderado      | Zero          |
| **Curva de Aprendizado**  | Baixa        | Alta          | Baixa         |
| **Flexibilidade**         | Limitada     | Alta          | Controlada    |
| **Ferram. Externas**      | Swagger/OpenAPI | Playground | TypeScript   |

---

## Quando **NÃO** Usar?
- Projetos sem TypeScript
- APIs públicas para clientes desconhecidos
- Sistemas com múltiplas linguagens

---

## Casos de Uso Ideais
1. Aplicações full-stack TypeScript
2. Microserviços internos
3. Prototipagem rápida
4. Aplicações real-time
5. Projetos com equipes full-stack

---

## Exemplos

Este código mostra uma implementação completa de:

- API totalmente tipada
- Sistema de autenticação robusto
- Integração com banco de dados
- Client-side seguro e tipado
- Validação de dados em tempo real

A estrutura permite fácil expansão para novas funcionalidades mantendo a segurança e qualidade do código.

###  Estrutura de Arquivos

```
src/
├── client/
│   ├── trpc.ts          // Cliente tRPC
│   └── providers.tsx    // Provedor React
├── server/
│   ├── middleware/
│   │   └── auth.ts      // Autenticação
│   ├── routers/
│   │   └── user.ts      // Rotas de usuário
│   ├── trpc.ts          // Configuração tRPC
│   └── server.ts        // Servidor principal
prisma/
└── schema.prisma        // Esquema do banco
```

### Exemplo de Uso das Rotas

Cliente React (chamando a API)

```ts
// Componente React
import { trpc } from './client/trpc';

function UserComponent() {
  // Consulta GET
  const { data: users } = trpc.user.getAll.useQuery();
  
  // Mutação POST
  const createUser = () => {
    trpc.user.create.mutate({
      name: 'João Silva',
      email: 'joao@exemplo.com'
    });
  };

  return (
    <div>
      <button onClick={createUser}>Criar Usuário</button>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```


```ts
// Server
const appRouter = router({
  getUser: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return db.user.find(input.id);
    })
});

// Cliente (React)
const { data } = trpc.getUser.useQuery({ id: '123' });
```



Servidor (implementação das rotas):`

```ts
// user.ts (Exemplo de rota protegida)
update: protectedProcedure
  .input(z.object({ id: z.number(), name: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user contém dados do usuário logado
    return prisma.user.update({
      where: { id: input.id },
      data: { name: input.name }
    });
  });
```

### Fluxo de Autenticação

Middleware de Autenticação:

```ts
// auth.ts
export const authMiddleware = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      user: ctx.session.user // Injeta usuário no contexto
    }
  });
});
```

Uso em Componente Protegido:

```ts
// Componente protegido
const Profile = () => {
  const { data } = trpc.user.getById.useQuery({ id: 123 });

  return (
    <div>
      <h1>Bem-vindo, {data?.name}</h1>
    </div>
  );
};

// Envolva sua aplicação no provider
<TRPCProvider>
  <Profile />
</TRPCProvider>
```

### Tipagem Segura

TypeSafe em Ação:

```ts
// Erro detectado em tempo de compilação:
trpc.user.update.mutate({
  id: "123", // ERRO: Tipo string não é atribuível a number
  name: 456   // ERRO: Tipo number não é atribuível a string
});
```

Criptografia de senha antes do armazenamento:

```ts

export const userRouter = router({
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string().min(6),
    }))
    .mutation(async ({ input }) => {
      try {
        return await prisma.user.create({
          data: {
            name: input.name,
            email: input.email,
            password: await hash(input.password, 12), // Hash da senha
          },
          select: { // Seleção explícita de campos
            id: true,
            name: true,
            email: true,
            createdAt: true,
          }
        });
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Falha na criação do usuário',
        });
      }
    }),
```

### Configuração do Cliente

Conexão com Servidor:

```ts
// client/trpc.ts
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: () => ({
        Authorization: `Bearer ${localStorage.getItem('token')}`
      })
    })
  ]
});
```

Principais Vantagens

- autocomplete inteligente
- validação automática
- erros personalizados
- tipagem entre servidor e cliente