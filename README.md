# 🚀 Stock-Bit: Sistema de Gestão de Estoque e Catálogo

Bem-vindo ao Stock-Bit! Um sistema completo e moderno para gerenciamento de estoque, clientes, fornecedores e vendas, construído com as tecnologias mais recentes para oferecer uma experiência de usuário rápida e reativa.

O objetivo inicial deste projeto é ajudar parentes e conhecidos a saírem das planilhas e cadernos. A ideia é fornecer uma ferramenta moderna e fácil de usar para que eles possam gerenciar seus pequenos estoques, controlar as vendas e ter uma visão clara do seu negócio.

## ✨ Funcionalidades Implementadas

O sistema atualmente conta com um robusto conjunto de funcionalidades, incluindo:

#### 📦 Gestão de Estoque e Produtos
- **CRUD completo de Produtos**: Crie, leia, atualize e delete produtos.
- **Upload de Imagens**: Suporte para upload, compressão e exibição de fotos de produtos via Firebase Storage.
- **Controle de Estoque**: Definição de estoque inicial e mínimo para cada produto.
- **Histórico de Movimentações**: Cada alteração no estoque (entrada por compra, saída por venda, cadastro inicial) é registrada, criando uma trilha de auditoria completa e confiável.

#### 💰 Gestão Financeira
- **Gestão de Devedores**: Uma lista completa de clientes com dívidas, mostrando totais devidos e valores em atraso.
- **Controle de Pagamentos**: Funcionalidade para registrar pagamentos de dívidas, seja à vista (`cashPayment`) ou por parcela (`installments`).
- **Cálculos Automatizados**: O sistema calcula automaticamente os valores em atraso e o total devido de cada cliente.

#### 👥 Gestão de Contatos
- **CRUD de Fornecedores**: Formulário completo e responsivo para gerenciar fornecedores, com busca de endereço automática via API ViaCEP.
- **Criação e Atualização de Clientes**: A cada novo pedido, o sistema verifica se o cliente já existe (pelo telefone) e atualiza seus dados, ou cria um novo cadastro, garantindo uma base de clientes sempre atualizada.

#### 🛍️ Catálogo Online e Vendas
- **Catálogo de Produtos Interativo**: Exibição dos produtos ativos em layout de grade ou lista.
- **Filtros e Ordenação**: Ferramentas para que os clientes encontrem produtos por nome/SKU ou ordenem por preço e novidades.
- **Badge de "Novidade"**: Produtos cadastrados recentemente são destacados automaticamente.
- **Carrinho de Compras**: Um carrinho de compras persistente (usando `localStorage` e React Context) que permite adicionar, remover e alterar a quantidade de produtos.
- **Checkout Multi-Passos**: Um fluxo de checkout moderno dentro de um `FormSheet` com etapas para revisão do carrinho, preenchimento de endereço (com opção de retirada na loja) e seleção de método de pagamento.
- **Validação Inteligente**: Validação robusta em cada passo do checkout, garantindo a integridade dos dados antes de finalizar o pedido.

#### 📲 Integrações
- **WhatsApp**: Ferramenta para enviar notificações e resumos de pedidos detalhados para os clientes diretamente do painel, com templates para diferentes estágios do pedido (recebido, saiu para entrega, pronto para retirada).

---

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com um conjunto de tecnologias modernas e escaláveis:

- **Framework**: [Next.js](https://nextjs.org/) (com App Router)
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Shadcn/ui](https://ui.shadcn.com/)
- **Backend e Banco de Dados**: [Firebase](https://firebase.google.com/)
  - **Firestore**: Para o banco de dados NoSQL.
  - **Firebase Storage**: Para armazenamento de imagens.
  - **Firebase Authentication**: Para gerenciamento de usuários.
  - **Server Actions**: Com o SDK Admin do Firebase para operações seguras no backend.
- **Estado do Servidor (Cache)**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
- **Estado do Cliente**: [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- **Formulários**: [React Hook Form](https://react-hook-form.com/)
- **Validação de Schema**: [Zod](https://zod.dev/)
- **Gráficos**: [Recharts](https://recharts.org/) (através dos componentes do Shadcn)
- **Deployment**: [Vercel](https://vercel.com/)

---

## 🗺️ Roadmap (Próximos Passos)

O projeto tem uma base sólida, mas ainda há funcionalidades importantes em desenvolvimento e planejadas para o futuro.

- **[Em desenvolvimento] 👨‍💼 Gestão de Funcionários**:
  - Criar um sistema de roles e permissões (Administrador vs. Vendedor).
  - Limitar o acesso a certas áreas do sistema com base na permissão do usuário.

- **[Em desenvolvimento] 📊 Módulo de Relatórios**:
  - Criar uma página dedicada para relatórios visuais e detalhados.
  - Relatório de Vendas por período, produto e cliente.
  - Relatório de Lucratividade (requer salvar o preço de custo na venda).
  - Relatório de Contas a Receber por data de vencimento.

- **[Planejado] 🛒 Gestão de Compras (Contas a Pagar)**:
  - Implementar o fluxo de registro de compras de fornecedores.
  - Criar uma nova coleção para "Contas a Pagar".

- **[Planejado] 🔔 Sistema de Notificações**:
  - Um painel de notificações dentro do app (ex: "3 produtos com estoque baixo", "5 parcelas vencem hoje").
