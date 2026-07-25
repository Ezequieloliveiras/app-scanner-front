# 1. Visão geral do produto

## Nome do sistema

BipaAí. O nome nativo Android também aparece como "App Scanner".

## Objetivo principal

Permitir que uma empresa leia notas fiscais NF-e/NFC-e, confira os produtos recebidos, registre entradas no estoque, acompanhe movimentações, gerencie solicitações de retirada, transfira produtos entre filiais e administre usuários, planos e certificado digital.

## Público-alvo

- Operadores de recebimento e estoque.
- Gestores de estoque.
- Administradores de loja, unidade ou filial.
- Usuários principais e masters responsáveis por acessos, planos e certificado digital.
- Empresas que precisam transformar notas fiscais em registros de estoque com menor retrabalho.

## Problema que resolve

- Evita digitação manual de produtos recebidos por nota fiscal.
- Ajuda a conferir divergências entre quantidade da nota e contagem real.
- Mantém histórico de entradas, ajustes, retiradas e divergências.
- Centraliza solicitações de retirada com aprovação.
- Ajuda a acompanhar produtos parados, sem movimento ou sem estoque.
- Organiza transferências entre estoque central e filiais.
- Permite administrar permissões de acesso por módulo.

## Contexto de uso

O uso principal é mobile, em orientação retrato, durante rotinas de recebimento, conferência de mercadorias, consulta de estoque e gestão operacional. O app usa câmera, notificações, upload de arquivos/imagens e checkout externo.

## Resultados buscados pelo usuário

- Ler uma nota fiscal rapidamente.
- Conferir e corrigir quantidades antes de enviar ao estoque.
- Registrar produtos no estoque.
- Localizar produto e histórico.
- Solicitar ou aprovar retirada.
- Reservar produto para filial.
- Identificar produtos parados.
- Configurar certificado digital para consultas fiscais.
- Controlar usuários, planos e módulos.

# 2. Arquitetura de navegação

## Estrutura geral

O projeto não usa rotas web tradicionais. A navegação é feita por estados internos de tela em um aplicativo mobile. As rotas abaixo são nomes conceituais para design.

## Menu principal

Existe um menu lateral aberto pelo ícone de menu no header. Ele lista itens de acordo com permissões do usuário:

- Início.
- Dashboard.
- Perfil.
- Planos.
- Escanear.
- Ver produtos.
- Filial.
- Solicitações.
- Gerenciar acessos.
- Certificado.
- Sair.

Existe um item comentado para XML/simulação, mas ele não aparece como item ativo de menu.

## Navbar/header

O header autenticado exibe:

- Botão de menu.
- Título da tela atual.
- Subtítulo fixo: "Scanner de notas e estoque".
- Indicador de carregamento quando há ação em andamento.
- Botão de notificações.
- Ponto visual quando há notificações.

## Bottom navigation

A navegação inferior mostra atalhos principais, condicionados por permissão:

- Início.
- Dash.
- Câmera.
- Produtos.

## Agrupamento das funcionalidades

- **Operação de estoque:** Scanner, revisão de nota, produtos, detalhe do produto, entrega faltante.
- **Análise e gestão:** Dashboard, solicitações, notificações.
- **Filiais:** reserva e movimentações.
- **Administração:** acessos, perfil, planos, certificado.
- **Autenticação:** login, cadastro, redefinição e logout.

## Páginas públicas

- Login.
- Cadastro.
- Redefinição de senha.

## Páginas autenticadas

- Início.
- Dashboard.
- Escanear nota.
- Produtos.
- Detalhe do produto.
- Filial.
- Solicitações.
- Notificações.
- Perfil.
- Planos.
- Certificado.
- Acessos.

## Páginas condicionadas por perfil/permissão

- Dashboard: depende do módulo Dashboard.
- Escanear nota: depende do módulo Scanner.
- Produtos: depende do módulo Produtos.
- Filial: depende do módulo Filial.
- Solicitações: depende do módulo Análise de solicitações.
- Acessos: usuário principal ou master com módulo Acessos.
- Certificado: usuário principal ou master habilitado.
- Funções administrativas em Acessos: variam entre principal e master.

## Mapa textual da navegação

```text
Autenticação
├── Login
├── Cadastro
└── Redefinição de senha
    └── Área autenticada
        ├── Início
        │   ├── Dashboard
        │   ├── Câmera / Escanear nota
        │   │   └── Produtos lidos / Revisão da nota
        │   ├── Produtos
        │   │   └── Detalhe do produto
        │   │       ├── Incluir faltante
        │   │       ├── Solicitar retirada
        │   │       └── Histórico com filtros
        │   ├── Filial
        │   │   ├── Reservar estoque para filial
        │   │   └── Movimentações entre filiais
        │   ├── Solicitações
        │   ├── Acessos
        │   │   └── Cadastrar usuário
        │   ├── Certificado
        │   └── Planos
        │       └── Dados de cobrança / Checkout externo
        ├── Perfil
        ├── Notificações
        └── Sair
```

# 3. Inventário completo de telas

## Tela 1 - Login

- **Rota ou URL:** `/auth/login` conceitual.
- **Objetivo:** permitir entrada no app.
- **Perfil que acessa:** visitante/não autenticado.
- **Origem:** abertura do app sem sessão.
- **Componentes principais:** marca BipaAí, ícone de código de barras, tabs de autenticação, formulário.
- **Informações exibidas:** "BipaAí", "Da nota ao estoque em segundos", erro quando houver.
- **Campos:** e-mail, senha.
- **Botões:** Entrar, Redefinir senha, Registre-se.
- **Ações:** autenticar usuário; mudar para cadastro; mudar para redefinição.
- **Cards:** painel de autenticação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Entrar, Registre-se.
- **Menus:** Não identificado.
- **Modais:** Não identificado.
- **Confirmações:** Não identificado.
- **Carregamento:** botão fica desabilitado e header/formulário indicam loading.
- **Estado vazio:** Não identificado.
- **Erro:** mensagem textual no painel.
- **Destino:** sucesso leva para Início; erro permanece no login.

## Tela 2 - Cadastro público

- **Rota ou URL:** `/auth/register` conceitual.
- **Objetivo:** criar novo acesso.
- **Perfil que acessa:** visitante/não autenticado.
- **Origem:** aba Registre-se na autenticação.
- **Componentes principais:** painel de autenticação e formulário.
- **Informações exibidas:** marca, tagline e erro.
- **Campos:** nome, e-mail, senha.
- **Botões:** Criar acesso, Voltar para login.
- **Ações:** criar conta; voltar para login.
- **Cards:** painel de autenticação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Entrar, Registre-se.
- **Menus:** Não identificado.
- **Modais:** Não identificado.
- **Confirmações:** Não identificado.
- **Carregamento:** botão desabilitado durante envio.
- **Estado vazio:** Não identificado.
- **Erro:** mensagem textual no painel.
- **Destino:** sucesso leva para Início; voltar retorna ao login.

## Tela 3 - Redefinição de senha

- **Rota ou URL:** `/auth/reset` conceitual.
- **Objetivo:** solicitar recuperação de acesso.
- **Perfil que acessa:** visitante/não autenticado.
- **Origem:** botão Redefinir senha na tela de login.
- **Componentes principais:** painel de autenticação.
- **Informações exibidas:** erro ou alerta de confirmação.
- **Campos:** e-mail.
- **Botões:** Enviar e-mail de redefinição, Voltar para login.
- **Ações:** solicitar redefinição.
- **Cards:** painel de autenticação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** modo de redefinição substitui tabs.
- **Menus:** Não identificado.
- **Modais:** alerta nativo de sucesso/erro.
- **Confirmações:** "Redefinição solicitada".
- **Carregamento:** botão desabilitado durante envio.
- **Estado vazio:** Não identificado.
- **Erro:** "Redefinição não solicitada" ou erro de API.
- **Destino:** permanece na autenticação.

## Tela 4 - Início

- **Rota ou URL:** `/home` conceitual.
- **Objetivo:** central operacional e atalhos.
- **Perfil que acessa:** usuário autenticado.
- **Origem:** login/cadastro, bottom nav, menu lateral.
- **Componentes principais:** header, hero, métricas, grid de atalhos, bottom nav.
- **Informações exibidas:** "BipaAí", "NF-e direto no estoque", texto de apoio, produtos em estoque, itens para conferir, plano atual nos atalhos.
- **Campos:** Não identificado.
- **Botões:** Dashboard, Câmera, Produtos, Filial, Solicitações, Acessos, Certificado, Planos.
- **Ações:** abrir módulo; atualizar por pull-to-refresh.
- **Cards:** hero, caixas de métricas, cards de ação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** header, menu lateral, bottom nav.
- **Modais:** menu lateral.
- **Confirmações:** Não identificado.
- **Carregamento:** refresh control e indicador no header.
- **Estado vazio:** Não identificado.
- **Erro:** "Não consegui atualizar a tela inicial.".
- **Destino:** abre a tela selecionada.

## Tela 5 - Dashboard

- **Rota ou URL:** `/dashboard` conceitual.
- **Objetivo:** analisar saúde do estoque.
- **Perfil que acessa:** usuário autenticado com módulo Dashboard.
- **Origem:** Início, menu lateral, bottom nav.
- **Componentes principais:** busca, filtros, cards de métricas, lista de produtos, cards expansíveis.
- **Informações exibidas:** total de produtos, produtos parados, média parada, unidades, produtos analisados, data de geração, status do produto, EAN, quantidades e sugestão de gestão.
- **Campos:** busca por produto.
- **Botões:** limpar busca, Filtros, Aplicar filtros, expandir produto.
- **Ações:** buscar, filtrar, atualizar, expandir card.
- **Cards:** métricas e produto analisado.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** status, filial, datas, ordenação, produtos parados, produtos em estoque.
- **Abas:** Não identificado.
- **Menus:** header, menu lateral, bottom nav.
- **Modais:** bottom sheet de filtros.
- **Confirmações:** Não identificado.
- **Carregamento:** ActivityIndicator inicial e refresh control.
- **Estado vazio:** "Nenhum produto encontrado".
- **Erro:** "Não consegui carregar o dashboard." ou mensagem da API.
- **Destino:** permanece no Dashboard.

## Tela 6 - Filtros do Dashboard

- **Rota ou URL:** `/dashboard/filters` conceitual.
- **Objetivo:** refinar dados do dashboard.
- **Perfil que acessa:** usuário com Dashboard.
- **Origem:** botão Filtros no Dashboard.
- **Componentes principais:** modal tipo bottom sheet, chips, botão Aplicar filtros.
- **Informações exibidas:** grupos Status, Filial, Datas, Outros filtros.
- **Campos:** Não identificado.
- **Botões:** fechar, Todos, Parados, Em estoque, Todas, filiais disponíveis, Todo o período, Últimos 7 dias, Últimos 30 dias, Últimos 90 dias, ordenações, Aplicar filtros.
- **Ações:** alterar filtros e fechar sheet.
- **Cards:** Não identificado.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** todos os filtros do dashboard.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** esta tela é um modal.
- **Confirmações:** Não identificado.
- **Carregamento:** Não identificado.
- **Estado vazio:** Não identificado.
- **Erro:** Não identificado.
- **Destino:** retorna ao Dashboard.

## Tela 7 - Permissão de câmera

- **Rota ou URL:** `/scan/permission` conceitual.
- **Objetivo:** solicitar acesso à câmera.
- **Perfil que acessa:** usuário com módulo Scanner sem permissão concedida.
- **Origem:** Câmera.
- **Componentes principais:** painel central de permissão.
- **Informações exibidas:** "Permitir camera" e explicação.
- **Campos:** Não identificado.
- **Botões:** Liberar camera.
- **Ações:** solicitar permissão.
- **Cards:** painel de permissão.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** header.
- **Modais:** permissão nativa do sistema.
- **Confirmações:** permissão do sistema operacional.
- **Carregamento:** Não identificado.
- **Estado vazio:** Não identificado.
- **Erro:** se permissão não for concedida, permanece no painel.
- **Destino:** com permissão, abre Scanner.

## Tela 8 - Scanner por código de barras

- **Rota ou URL:** `/scan/barcode` conceitual.
- **Objetivo:** ler código de barras da DANFE.
- **Perfil que acessa:** usuário com módulo Scanner.
- **Origem:** Início, menu lateral, bottom nav.
- **Componentes principais:** câmera, overlay, guia de leitura, linha animada, seletor de modo, botão flash.
- **Informações exibidas:** "Barras", "Manual", "Lendo código de barras da DANFE" ou "Toque em Ler NF e posicione o código".
- **Campos:** Não identificado.
- **Botões:** Barras, Manual, Flash/Ligado, Ler NF/Parar.
- **Ações:** armar/desarmar leitura; ligar/desligar flash; capturar código.
- **Cards:** Não identificado.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** seletor de modo Barras/Manual.
- **Menus:** header.
- **Modais:** abre revisão de nota após leitura.
- **Confirmações:** Não identificado.
- **Carregamento:** header e botões desabilitados durante processamento.
- **Estado vazio:** Não identificado.
- **Erro:** alerta "Leitura não concluída".
- **Destino:** Produtos lidos.

## Tela 9 - Entrada manual da chave

- **Rota ou URL:** `/scan/manual` conceitual.
- **Objetivo:** buscar nota por chave de acesso.
- **Perfil que acessa:** usuário com módulo Scanner.
- **Origem:** modo Manual no Scanner.
- **Componentes principais:** painel manual com input.
- **Informações exibidas:** "Digitar chave de acesso".
- **Campos:** "44 digitos da chave da NF-e/NFC-e".
- **Botões:** Buscar nota.
- **Ações:** validar chave, buscar nota.
- **Cards:** painel manual.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** seletor de modo.
- **Menus:** header.
- **Modais:** abre revisão de nota após sucesso.
- **Confirmações:** Não identificado.
- **Carregamento:** botão desabilitado durante busca.
- **Estado vazio:** campo vazio gera alerta.
- **Erro:** "Chave obrigatoria" e "Chave invalida".
- **Destino:** Produtos lidos.

## Tela 10 - Produtos lidos / Revisão da nota

- **Rota ou URL:** `/invoice-review` conceitual.
- **Objetivo:** conferir produtos antes de enviar ao estoque.
- **Perfil que acessa:** usuário com módulo Scanner.
- **Origem:** leitura da nota por câmera ou chave manual.
- **Componentes principais:** modal full screen, header, lista de cards, editor de quantidade, footer fixo.
- **Informações exibidas:** chave de acesso, nome do produto, EAN, quantidade da NF, contagem, divergências, observações.
- **Campos:** contagem, observação.
- **Botões:** voltar, abrir observação, fechar observação, menos, mais, Enviar ao estoque.
- **Ações:** ajustar quantidade, registrar observação, voltar ao scanner, enviar ao estoque.
- **Cards:** card de produto lido.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** a própria tela é modal full screen.
- **Confirmações:** "Enviar para o estoque?".
- **Carregamento:** CTA desabilitado durante envio.
- **Estado vazio:** Não identificado.
- **Erro:** "Quantidade inválida", "Entrada não concluída".
- **Destino:** sucesso limpa revisão e atualiza Produtos; voltar retorna ao Scanner.

## Tela 11 - Produtos

- **Rota ou URL:** `/products` conceitual.
- **Objetivo:** listar produtos em estoque.
- **Perfil que acessa:** usuário com módulo Produtos.
- **Origem:** Início, menu lateral, bottom nav.
- **Componentes principais:** busca, lista, cards de produto.
- **Informações exibidas:** nome do produto.
- **Campos:** "Buscar por produto, EAN ou código".
- **Botões:** limpar busca, card de produto.
- **Ações:** buscar e abrir detalhe.
- **Cards:** produto.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** busca textual.
- **Abas:** Não identificado.
- **Menus:** header, menu lateral, bottom nav.
- **Modais:** Não identificado.
- **Confirmações:** Não identificado.
- **Carregamento:** header global quando recarrega produtos.
- **Estado vazio:** "Nenhum produto no estoque" e "Nenhum produto encontrado.".
- **Erro:** "Não consegui atualizar os produtos.".
- **Destino:** detalhe do produto.

## Tela 12 - Detalhe do produto

- **Rota ou URL:** `/products/:id` conceitual.
- **Objetivo:** consultar estoque, histórico e ações do produto.
- **Perfil que acessa:** usuário com módulo Produtos.
- **Origem:** lista de Produtos.
- **Componentes principais:** cabeçalho de detalhe, métricas, ações expansíveis, histórico.
- **Informações exibidas:** nome, EAN, quantidade em estoque, número de entradas, histórico.
- **Campos:** busca de movimentações.
- **Botões:** voltar, Incluir faltante, Solicitar retirada de estoque, Filtros do histórico, ordenar.
- **Ações:** consultar histórico, filtrar, ordenar, abrir ações.
- **Cards:** métricas, resumo de histórico, movimentações.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** período, tipo, busca e ordenação.
- **Abas:** Não identificado.
- **Menus:** header e navegação global.
- **Modais:** seletor de período.
- **Confirmações:** ações específicas têm feedbacks nativos.
- **Carregamento:** Não identificado no detalhe; ações usam estado saving.
- **Estado vazio:** "Nenhuma movimentação registrada para este produto." e "Nenhum registro encontrado com os filtros atuais.".
- **Erro:** alertas de ações quando falham.
- **Destino:** permanece no detalhe; voltar retorna à lista.

## Tela 13 - Incluir faltante

- **Rota ou URL:** `/products/:id/missing-delivered` conceitual.
- **Objetivo:** registrar quantidade entregue depois.
- **Perfil que acessa:** usuário com módulo Produtos.
- **Origem:** detalhe do produto.
- **Componentes principais:** acordeão de ação.
- **Informações exibidas:** título "Incluir faltante".
- **Campos:** "Quantidade entregue", "Observação da entrega faltante".
- **Botões:** Adicionar ao estoque.
- **Ações:** adicionar entrada faltante.
- **Cards:** área expansível.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** alerta de sucesso/erro.
- **Confirmações:** Não identificado.
- **Carregamento:** botão desabilitado durante salvamento.
- **Estado vazio:** Não identificado.
- **Erro:** "Quantidade inválida", "Não foi possível registrar".
- **Destino:** detalhe do produto atualizado.

## Tela 14 - Solicitar retirada de estoque

- **Rota ou URL:** `/products/:id/withdraw-request` conceitual.
- **Objetivo:** solicitar baixa de estoque para análise.
- **Perfil que acessa:** usuário com módulo Produtos.
- **Origem:** detalhe do produto.
- **Componentes principais:** acordeão de ação.
- **Informações exibidas:** título "Solicitar retirada de estoque".
- **Campos:** "Quantidade para retirada", "Observação da solicitação".
- **Botões:** Enviar solicitação.
- **Ações:** criar solicitação de retirada.
- **Cards:** área expansível.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** alerta de sucesso/erro.
- **Confirmações:** Não identificado.
- **Carregamento:** botão desabilitado durante salvamento.
- **Estado vazio:** Não identificado.
- **Erro:** "Quantidade inválida", "Não foi possível solicitar".
- **Destino:** detalhe do produto atualizado; solicitação aparece em Solicitações/Notificações.

## Tela 15 - Seletor de período do histórico

- **Rota ou URL:** `/products/:id/history/date-range` conceitual.
- **Objetivo:** escolher período personalizado para histórico.
- **Perfil que acessa:** usuário com módulo Produtos.
- **Origem:** filtros do histórico.
- **Componentes principais:** modal, shortcuts, calendário mensal, footer.
- **Informações exibidas:** "Selecionar período", mês/ano, dias da semana.
- **Campos:** seleção de início e fim.
- **Botões:** Hoje, Ontem, Últimos 7 dias, Últimos 30 dias, Este mês, Mês passado, Personalizado, anterior, próximo, Cancelar, Aplicar.
- **Ações:** escolher intervalo.
- **Cards:** Não identificado.
- **Tabelas:** grade de calendário visual, não tabela de dados.
- **Colunas:** dias da semana no calendário.
- **Filtros:** período.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** esta tela é modal.
- **Confirmações:** Não identificado.
- **Carregamento:** Não identificado.
- **Estado vazio:** Não identificado.
- **Erro:** Não identificado.
- **Destino:** detalhe do produto com filtro aplicado.

## Tela 16 - Filial / Reservar estoque

- **Rota ou URL:** `/branches/reserve` conceitual.
- **Objetivo:** reservar produto para filial.
- **Perfil que acessa:** usuário com módulo Filial.
- **Origem:** Início ou menu lateral.
- **Componentes principais:** acordeão, campos de busca/seleção, lista curta de resultados.
- **Informações exibidas:** produto selecionado, EAN, estoque central, filial origem e destino.
- **Campos:** produto, filial origem, filial destino, quantidade, lote, observação.
- **Botões:** abrir seletor, Reservar para filial.
- **Ações:** escolher dados e criar reserva.
- **Cards:** painel/acordeão; opções de produto.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** busca por produto e filiais.
- **Abas:** Não identificado.
- **Menus:** header e menu lateral.
- **Modais:** seletores de produto, origem e destino.
- **Confirmações:** alerta de sucesso "Estoque reservado".
- **Carregamento:** botão desabilitado durante reserva.
- **Estado vazio:** "Nenhum produto encontrado.".
- **Erro:** "Dados incompletos", "Reserva não concluída".
- **Destino:** permanece em Filial e limpa formulário.

## Tela 17 - Filial / Movimentações

- **Rota ou URL:** `/branches/transfers` conceitual.
- **Objetivo:** acompanhar transferências.
- **Perfil que acessa:** usuário com módulo Filial.
- **Origem:** tela Filial.
- **Componentes principais:** acordeão, busca, filtros de origem/destino, cards de transferência.
- **Informações exibidas:** produto, status, quantidade, origem, destino, ID, EAN, lote, histórico.
- **Campos:** pesquisar por produto/ID/EAN; filtros de origem/destino.
- **Botões:** Limpar filtros, expandir, Produto a caminho, Dar entrada na filial, Cancelar movimentação.
- **Ações:** filtrar, expandir, avançar status, cancelar.
- **Cards:** transferência.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** busca textual, origem e destino.
- **Abas:** Não identificado.
- **Menus:** header e menu lateral.
- **Modais:** seletores de filtro por filial.
- **Confirmações:** cancelar movimentação exige confirmação.
- **Carregamento:** botões globais desabilitados durante ação.
- **Estado vazio:** "Nenhuma movimentação de filial ainda.".
- **Erro:** "Movimentação não concluída", "Cancelamento não concluído".
- **Destino:** permanece em Filial com lista atualizada.

## Tela 18 - Solicitações

- **Rota ou URL:** `/stock-requests` conceitual.
- **Objetivo:** analisar solicitações de retirada.
- **Perfil que acessa:** usuário com módulo Análise de solicitações.
- **Origem:** Início, menu lateral, notificações.
- **Componentes principais:** busca, chips de período, seções Pendentes e Histórico, cards expansíveis.
- **Informações exibidas:** solicitante, produto, quantidade, status, EAN, ID, observação, revisor e data.
- **Campos:** "Buscar produto, EAN ou ID".
- **Botões:** limpar busca, Todos, Hoje, 7 dias, 30 dias, Mes, expandir, Aceitar, Recusar.
- **Ações:** buscar, filtrar, expandir, aceitar ou recusar.
- **Cards:** solicitação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** busca e período.
- **Abas:** seções Pendentes e Histórico.
- **Menus:** header e menu lateral.
- **Modais:** confirmações nativas de aceitar/recusar.
- **Confirmações:** "Aceitar retirada?", "Recusar retirada?".
- **Carregamento:** botões desabilitados durante análise.
- **Estado vazio:** "Nenhuma solicitacao de estoque encontrada.", "Nenhuma solicitacao encontrada com os filtros atuais.", "Nenhuma solicitacao pendente.".
- **Erro:** "Solicitação não atualizada".
- **Destino:** permanece em Solicitações com status atualizado.

## Tela 19 - Acessos

- **Rota ou URL:** `/access` conceitual.
- **Objetivo:** gerenciar usuários, permissões e módulos.
- **Perfil que acessa:** usuário principal ou master com permissão.
- **Origem:** Início ou menu lateral.
- **Componentes principais:** resumo de limite, botão de criação, busca, cards expansíveis.
- **Informações exibidas:** limite de usuários, nome, e-mail, função, plano, status, módulos.
- **Campos:** busca por nome/e-mail, nova senha.
- **Botões:** Novo usuário, limpar busca, Habilitado/Cortado, câmera automática, função, plano, módulo, Aplicar nova senha, Excluir usuário.
- **Ações:** criar usuário, editar status, câmera, função, plano, módulos, senha, excluir.
- **Cards:** usuário.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** busca textual.
- **Abas:** Não identificado.
- **Menus:** header e menu lateral.
- **Modais:** Cadastrar usuário.
- **Confirmações:** alterar função e excluir usuário exigem confirmação.
- **Carregamento:** botões desabilitados durante ação.
- **Estado vazio:** "Nenhum usuário encontrado.".
- **Erro:** "Acesso não atualizado", "Usuário não excluído", "Senha não atualizada".
- **Destino:** permanece em Acessos.

## Tela 20 - Cadastrar usuário

- **Rota ou URL:** `/access/new` conceitual.
- **Objetivo:** criar usuário gerenciado.
- **Perfil que acessa:** principal ou master com permissão.
- **Origem:** botão Novo usuário em Acessos.
- **Componentes principais:** modal de formulário, chips de função e plano.
- **Informações exibidas:** "Cadastrar usuário", "Crie o acesso e depois habilite os módulos no card do usuário.".
- **Campos:** nome, e-mail, senha inicial.
- **Botões:** fechar, Master, Padrão, planos, Cadastrar acesso.
- **Ações:** criar acesso.
- **Cards:** modal/sheet.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** esta tela é modal.
- **Confirmações:** "Acesso cadastrado".
- **Carregamento:** botão desabilitado durante cadastro.
- **Estado vazio:** Não identificado.
- **Erro:** "Cadastro não concluído".
- **Destino:** fecha modal e usuário aparece em Acessos.

## Tela 21 - Certificado

- **Rota ou URL:** `/certificate` conceitual.
- **Objetivo:** adicionar, editar ou remover certificado digital da organização.
- **Perfil que acessa:** principal ou master habilitado.
- **Origem:** Início ou menu lateral.
- **Componentes principais:** card de status, info tiles, formulário, seletor de arquivo.
- **Informações exibidas:** status Ativo/Pendente, arquivo, documento, ambiente, validade.
- **Campos:** documento, UF autorizadora, senha do certificado.
- **Botões:** CNPJ, CPF, Produção, Homologação, Selecionar arquivo, Trocar arquivo, Salvar certificado, Adicionar certificado, Remover certificado.
- **Ações:** carregar status, selecionar arquivo, salvar, remover.
- **Cards:** status, formulário, tiles de informação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** header e menu lateral.
- **Modais:** seletor de arquivo do sistema e confirmação de remoção.
- **Confirmações:** "Remover certificado?".
- **Carregamento:** botões desabilitados durante ação.
- **Estado vazio:** "Nenhum certificado configurado.".
- **Erro:** "CNPJ inválido", "CPF inválido", "Certificado incompleto", "Formato inválid(o)", "Certificado não salvo", "Certificado não removido".
- **Destino:** permanece em Certificado.

## Tela 22 - Planos

- **Rota ou URL:** `/billing` conceitual.
- **Objetivo:** visualizar plano atual e solicitar upgrade/checkout.
- **Perfil que acessa:** usuário autenticado.
- **Origem:** Início, menu lateral, Perfil.
- **Componentes principais:** cards de plano, lista de módulos, recursos, CTA.
- **Informações exibidas:** plano atual, nome, descrição, preço, módulos, recursos, selo "Mais indicado".
- **Campos:** Não identificado na lista.
- **Botões:** Plano atual, Mudar para Free, Fazer upgrade para [plano], Solicitar contato.
- **Ações:** selecionar plano, abrir modal de cobrança ou solicitar contato.
- **Cards:** plano.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** header e menu lateral.
- **Modais:** Dados de cobrança para planos pagos.
- **Confirmações:** alertas "Upgrade iniciado" e "Planos".
- **Carregamento:** botões desabilitados durante solicitação.
- **Estado vazio:** se API não retornar planos, estado visual específico não identificado.
- **Erro:** "Upgrade nao iniciado".
- **Destino:** pode abrir checkout externo; retorna para Planos.

## Tela 23 - Dados de cobrança

- **Rota ou URL:** `/billing/checkout-data` conceitual.
- **Objetivo:** coletar dados antes de abrir checkout.
- **Perfil que acessa:** usuário autenticado escolhendo plano pago.
- **Origem:** botão de upgrade em Planos.
- **Componentes principais:** modal, formulário de cobrança, CTA.
- **Informações exibidas:** "Dados de cobranca", plano selecionado.
- **Campos:** CPF ou CNPJ, telefone com DDD, CEP, endereço, número, bairro.
- **Botões:** fechar, Abrir checkout.
- **Ações:** validar dados e pedir checkout.
- **Cards:** modal/sheet.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** Não identificado.
- **Modais:** esta tela é modal.
- **Confirmações:** alertas de resultado do checkout.
- **Carregamento:** botão desabilitado durante envio.
- **Estado vazio:** Não identificado.
- **Erro:** CPF/CNPJ inválido, telefone inválido, CEP inválido, endereço incompleto, "Upgrade nao iniciado".
- **Destino:** checkout externo ou retorno para Planos.

## Tela 24 - Perfil

- **Rota ou URL:** `/profile` conceitual.
- **Objetivo:** editar dados pessoais e preferências.
- **Perfil que acessa:** usuário autenticado.
- **Origem:** menu lateral.
- **Componentes principais:** avatar, card de perfil, card Minha conta, switch de câmera.
- **Informações exibidas:** nome, e-mail, função, plano.
- **Campos:** nome, e-mail, senha atual, nova senha.
- **Botões:** avatar/selecionar foto, Ver planos e upgrades, Remover foto, câmera automática, Salvar perfil.
- **Ações:** alterar foto, remover foto, abrir planos, alternar câmera, salvar perfil.
- **Cards:** perfil e conta.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** header e menu lateral.
- **Modais:** seletor de imagem do sistema.
- **Confirmações:** "Perfil atualizado".
- **Carregamento:** botões desabilitados durante salvamento.
- **Estado vazio:** avatar mostra ícone quando não há foto.
- **Erro:** "Permissão necessária", "Formato inválido", "Perfil não atualizado".
- **Destino:** permanece em Perfil ou abre Planos.

## Tela 25 - Notificações

- **Rota ou URL:** `/notifications` conceitual.
- **Objetivo:** mostrar avisos e pendências acionáveis.
- **Perfil que acessa:** usuário autenticado.
- **Origem:** sino do header.
- **Componentes principais:** contador, lista de notificações, cards de solicitação.
- **Informações exibidas:** total de avisos, solicitações pendentes, retiradas aprovadas/reprovadas, erros.
- **Campos:** Não identificado.
- **Botões:** Aceitar, Recusar.
- **Ações:** analisar solicitação ou visualizar aviso.
- **Cards:** notificação.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** header.
- **Modais:** confirmações de aceite/recusa.
- **Confirmações:** mesmas confirmações das solicitações.
- **Carregamento:** botões desabilitados durante ação.
- **Estado vazio:** "Nenhuma notificacao agora.".
- **Erro:** notificações de tom erro exibem mensagem.
- **Destino:** permanece em Notificações.

## Tela 26 - Menu lateral

- **Rota ou URL:** `/menu` conceitual.
- **Objetivo:** navegar entre módulos e sair.
- **Perfil que acessa:** usuário autenticado.
- **Origem:** botão de menu no header.
- **Componentes principais:** drawer/modal lateral, lista de itens, botão fechar.
- **Informações exibidas:** "Menu".
- **Campos:** Não identificado.
- **Botões:** Início, Dashboard, Perfil, Planos, Escanear, Ver produtos, Filial, Solicitações, Gerenciar acessos, Certificado, Sair.
- **Ações:** navegar; logout.
- **Cards:** Não identificado.
- **Tabelas:** Não identificado.
- **Colunas:** Não identificado.
- **Filtros:** Não identificado.
- **Abas:** Não identificado.
- **Menus:** esta tela é o menu.
- **Modais:** drawer em modal fade.
- **Confirmações:** logout não tem confirmação identificada.
- **Carregamento:** Não identificado.
- **Estado vazio:** Não identificado.
- **Erro:** Não identificado.
- **Destino:** item escolhido ou autenticação no logout.

# 4. Funcionalidades

## 1. Login

- **Objetivo:** autenticar usuário.
- **Onde aparece:** Login.
- **Início:** botão Entrar.
- **Etapas:** informar e-mail e senha; enviar; aguardar API; entrar ou ver erro.
- **Dados necessários:** e-mail, senha.
- **Dados apresentados:** erro ou usuário autenticado.
- **Resultado esperado:** acesso à área autenticada.
- **Validações:** Não identificado no front além do envio dos campos.
- **Erros:** "Erro ao entrar." ou mensagem da API.
- **Feedbacks:** loading, erro textual.

## 2. Cadastro público

- **Objetivo:** criar conta.
- **Onde aparece:** Cadastro público.
- **Início:** aba Registre-se e botão Criar acesso.
- **Etapas:** preencher nome, e-mail e senha; enviar; entrar ou ver erro.
- **Dados necessários:** nome, e-mail, senha.
- **Dados apresentados:** erro ou área autenticada.
- **Resultado esperado:** sessão criada.
- **Validações:** senha mínima aparece como placeholder; validação efetiva não identificada no front.
- **Erros:** "Erro ao criar acesso.".
- **Feedbacks:** loading e erro textual.

## 3. Redefinição de senha

- **Objetivo:** solicitar recuperação de acesso.
- **Onde aparece:** tela de autenticação.
- **Início:** botão Redefinir senha.
- **Etapas:** informar e-mail; enviar; receber alerta.
- **Dados necessários:** e-mail.
- **Dados apresentados:** mensagem de sucesso ou erro; token dev pode aparecer se retornado pela API.
- **Resultado esperado:** pedido de redefinição enviado.
- **Validações:** Não identificado.
- **Erros:** "Redefinição não solicitada".
- **Feedbacks:** alerta nativo.

## 4. Navegação por módulos

- **Objetivo:** acessar áreas do app conforme permissão.
- **Onde aparece:** Home, menu lateral, bottom nav.
- **Início:** toque em card ou item de menu.
- **Etapas:** verificar permissão; abrir tela ou exibir bloqueio.
- **Dados necessários:** usuário e módulos liberados.
- **Dados apresentados:** alerta "Acesso bloqueado" quando sem permissão.
- **Resultado esperado:** tela correspondente aberta.
- **Validações:** módulo deve estar liberado e usuário habilitado.
- **Erros:** "Seu usuário não tem acesso a este módulo.".
- **Feedbacks:** alerta nativo.

## 5. Atualizar dados da Home

- **Objetivo:** recarregar dados operacionais.
- **Onde aparece:** Início.
- **Início:** pull-to-refresh.
- **Etapas:** recarregar produtos, solicitações, planos, transferências, usuários e certificado conforme perfil.
- **Dados necessários:** sessão ativa.
- **Dados apresentados:** métricas atualizadas.
- **Resultado esperado:** home atualizada.
- **Validações:** usuário autenticado.
- **Erros:** "Nao consegui atualizar a tela inicial.".
- **Feedbacks:** refresh indicator.

## 6. Consultar Dashboard

- **Objetivo:** analisar estoque.
- **Onde aparece:** Dashboard.
- **Início:** acesso ao módulo.
- **Etapas:** carregar métricas; pesquisar; filtrar; expandir produto.
- **Dados necessários:** token e filtros.
- **Dados apresentados:** métricas, produtos, status e sugestões.
- **Resultado esperado:** visão de estoque filtrada.
- **Validações:** permissão de módulo.
- **Erros:** "Nao consegui carregar o dashboard.".
- **Feedbacks:** loading, estado vazio, erro.

## 7. Ler nota com câmera

- **Objetivo:** capturar chave da nota.
- **Onde aparece:** Scanner.
- **Início:** botão Ler NF ou leitura armada.
- **Etapas:** conceder permissão; apontar câmera; ler código; processar nota.
- **Dados necessários:** permissão de câmera e código de barras.
- **Dados apresentados:** guia de leitura e produtos lidos.
- **Resultado esperado:** abrir revisão.
- **Validações:** scanner habilitado e não carregando.
- **Erros:** "Leitura não concluída".
- **Feedbacks:** flash, botão Ler/Parar, alerta.

## 8. Buscar nota por chave manual

- **Objetivo:** processar nota sem câmera.
- **Onde aparece:** Scanner manual.
- **Início:** modo Manual e botão Buscar nota.
- **Etapas:** digitar chave; validar 44 dígitos; processar.
- **Dados necessários:** chave da NF-e/NFC-e.
- **Dados apresentados:** produtos lidos ou erro.
- **Resultado esperado:** abrir revisão.
- **Validações:** chave obrigatória e 44 dígitos.
- **Erros:** "Chave obrigatoria", "Chave invalida".
- **Feedbacks:** alerta nativo.

## 9. Captura com IA

- **Objetivo:** preparar foto para futura leitura por OCR/IA.
- **Onde aparece:** código do Scanner possui modo IA, mas o botão para ativar o modo está comentado.
- **Início:** Não identificado na interface ativa.
- **Etapas:** captura de foto se modo IA estivesse ativo.
- **Dados necessários:** imagem capturada.
- **Dados apresentados:** alerta "Captura com IA".
- **Resultado esperado:** Não identificado; backend de OCR/IA não conectado.
- **Validações:** câmera disponível.
- **Erros:** "Captura nao concluida".
- **Feedbacks:** alerta informativo.

## 10. Revisar e enviar produtos ao estoque

- **Objetivo:** conferir produtos antes de registrar.
- **Onde aparece:** Produtos lidos.
- **Início:** leitura de nota bem-sucedida.
- **Etapas:** revisar itens; ajustar contagem; observar divergência; confirmar envio.
- **Dados necessários:** produtos da nota, contagem.
- **Dados apresentados:** produto, EAN, quantidade da NF, contagem, divergência, observação.
- **Resultado esperado:** estoque atualizado.
- **Validações:** quantidade maior que zero.
- **Erros:** "Quantidade inválida", "Entrada não concluída".
- **Feedbacks:** alerta de divergência, confirmação, sucesso "Entrada registrada".

## 11. Buscar produtos

- **Objetivo:** localizar produto em estoque.
- **Onde aparece:** Produtos e Filial.
- **Início:** campo de busca.
- **Etapas:** digitar; lista filtra; abrir produto.
- **Dados necessários:** termo de busca.
- **Dados apresentados:** produtos encontrados.
- **Resultado esperado:** produto localizado.
- **Validações:** busca vazia mostra lista completa em Produtos; em Filial resultados aparecem quando há termo.
- **Erros:** Não identificado.
- **Feedbacks:** estado vazio.

## 12. Consultar detalhe e histórico do produto

- **Objetivo:** entender movimentações de um produto.
- **Onde aparece:** Detalhe do produto.
- **Início:** toque em produto.
- **Etapas:** abrir detalhe; pesquisar histórico; aplicar filtros; ordenar.
- **Dados necessários:** produto selecionado.
- **Dados apresentados:** estoque, entradas, histórico, chave, observações, quantidades.
- **Resultado esperado:** consulta concluída.
- **Validações:** Não identificado.
- **Erros:** Não identificado.
- **Feedbacks:** estados vazios de histórico.

## 13. Registrar entrega faltante

- **Objetivo:** adicionar ao estoque item entregue depois.
- **Onde aparece:** Detalhe do produto.
- **Início:** acordeão Incluir faltante.
- **Etapas:** informar quantidade; observação opcional; salvar.
- **Dados necessários:** produto, quantidade, observação opcional.
- **Dados apresentados:** sucesso/erro.
- **Resultado esperado:** estoque e histórico atualizados.
- **Validações:** quantidade maior que zero.
- **Erros:** "Quantidade inválida", "Não foi possível registrar".
- **Feedbacks:** "Entrada registrada".

## 14. Solicitar retirada

- **Objetivo:** pedir baixa de estoque.
- **Onde aparece:** Detalhe do produto.
- **Início:** acordeão Solicitar retirada de estoque.
- **Etapas:** informar quantidade; observação opcional; enviar.
- **Dados necessários:** produto, quantidade, observação opcional.
- **Dados apresentados:** sucesso/erro.
- **Resultado esperado:** solicitação pendente.
- **Validações:** quantidade maior que zero.
- **Erros:** "Quantidade inválida", "Não foi possível solicitar".
- **Feedbacks:** "Solicitação enviada".

## 15. Analisar solicitação

- **Objetivo:** aprovar ou recusar retirada.
- **Onde aparece:** Solicitações e Notificações.
- **Início:** botões Aceitar/Recusar.
- **Etapas:** expandir solicitação; escolher ação; confirmar; atualizar dados.
- **Dados necessários:** solicitação e decisão.
- **Dados apresentados:** status, revisor, produto, quantidade.
- **Resultado esperado:** status atualizado; se aprovado, estoque baixado.
- **Validações:** permissão do módulo.
- **Erros:** "Solicitação não atualizada".
- **Feedbacks:** confirmações nativas.

## 16. Reservar estoque para filial

- **Objetivo:** iniciar transferência.
- **Onde aparece:** Filial.
- **Início:** acordeão Reservar estoque para filial.
- **Etapas:** escolher produto; origem; destino; quantidade; lote/observação; salvar.
- **Dados necessários:** produto, origem, destino, quantidade.
- **Dados apresentados:** reserva criada.
- **Resultado esperado:** transferência com status reservado.
- **Validações:** produto, destino e quantidade obrigatórios; origem e destino diferentes.
- **Erros:** "Dados incompletos", "Reserva não concluída".
- **Feedbacks:** "Estoque reservado".

## 17. Atualizar movimentação de filial

- **Objetivo:** avançar ou cancelar transferência.
- **Onde aparece:** Filial / Movimentações.
- **Início:** botões Produto a caminho, Dar entrada na filial ou Cancelar movimentação.
- **Etapas:** expandir card; escolher ação; confirmar se cancelamento; atualizar.
- **Dados necessários:** transferência e novo status.
- **Dados apresentados:** status e histórico.
- **Resultado esperado:** transferência atualizada.
- **Validações:** status atual determina ações disponíveis.
- **Erros:** "Movimentação não concluída", "Cancelamento não concluído".
- **Feedbacks:** status visual e alertas.

## 18. Criar usuário gerenciado

- **Objetivo:** adicionar usuário.
- **Onde aparece:** Acessos.
- **Início:** Novo usuário.
- **Etapas:** preencher dados; escolher função/plano se aplicável; cadastrar.
- **Dados necessários:** nome, e-mail, senha, função/plano.
- **Dados apresentados:** usuário na lista.
- **Resultado esperado:** acesso criado.
- **Validações:** limite do plano; outras validações não identificadas no front.
- **Erros:** "Cadastro não concluído".
- **Feedbacks:** "Acesso cadastrado".

## 19. Gerenciar usuário

- **Objetivo:** controlar acesso e permissões.
- **Onde aparece:** Acessos.
- **Início:** expandir card de usuário.
- **Etapas:** alterar status, câmera, função, plano, módulos, senha ou excluir.
- **Dados necessários:** usuário selecionado.
- **Dados apresentados:** estado atualizado.
- **Resultado esperado:** permissões alteradas.
- **Validações:** perfil principal/master; limite de plano; confirmação para função e exclusão.
- **Erros:** "Acesso não atualizado", "Senha não atualizada", "Usuário não excluído".
- **Feedbacks:** alertas e chips/badges.

## 20. Editar perfil

- **Objetivo:** atualizar dados pessoais.
- **Onde aparece:** Perfil.
- **Início:** campos e botão Salvar perfil.
- **Etapas:** alterar foto/dados/senha/câmera; salvar.
- **Dados necessários:** nome, e-mail, senha atual se alterar dados sensíveis, nova senha opcional.
- **Dados apresentados:** perfil atualizado.
- **Resultado esperado:** usuário atualizado.
- **Validações:** formato de imagem; permissão de fotos.
- **Erros:** "Permissão necessária", "Formato inválido", "Perfil não atualizado".
- **Feedbacks:** "Perfil atualizado".

## 21. Gerenciar planos

- **Objetivo:** escolher plano e iniciar pagamento.
- **Onde aparece:** Planos.
- **Início:** CTA no card de plano.
- **Etapas:** escolher plano; se pago, preencher cobrança; abrir checkout; retornar ao app.
- **Dados necessários:** plano e dados de cobrança para plano pago.
- **Dados apresentados:** preço, módulos, recursos, status de checkout.
- **Resultado esperado:** plano atualizado ou checkout iniciado.
- **Validações:** CPF/CNPJ, telefone, CEP, endereço, número e bairro.
- **Erros:** "Upgrade nao iniciado" e erros de formulário.
- **Feedbacks:** "Upgrade iniciado", "Planos".

## 22. Gerenciar certificado

- **Objetivo:** configurar certificado A1.
- **Onde aparece:** Certificado.
- **Início:** formulário de certificado.
- **Etapas:** escolher documento; informar número, ambiente, UF; selecionar arquivo; informar senha; salvar ou remover.
- **Dados necessários:** documento, ambiente, arquivo/senha quando novo.
- **Dados apresentados:** status, arquivo, documento, ambiente, validade.
- **Resultado esperado:** certificado ativo ou removido.
- **Validações:** CNPJ 14 dígitos, CPF 11 dígitos, arquivo .pfx/.p12, senha quando necessário.
- **Erros:** "Certificado não salvo", "Certificado não removido".
- **Feedbacks:** "Certificado salvo", "Certificado removido".

## 23. Notificações operacionais

- **Objetivo:** alertar pendências e permitir ação rápida.
- **Onde aparece:** sino do header e tela Notificações.
- **Início:** tocar no sino.
- **Etapas:** visualizar aviso; aceitar/recusar solicitação quando permitido.
- **Dados necessários:** notificações, solicitações e erros.
- **Dados apresentados:** título, texto, tom e ações.
- **Resultado esperado:** usuário informado ou solicitação analisada.
- **Validações:** permissão para analisar solicitações.
- **Erros:** erros aparecem como notificação de atenção.
- **Feedbacks:** cards e badge no sino.

## 24. Registro de push token

- **Objetivo:** habilitar notificações push.
- **Onde aparece:** fluxo invisível após login.
- **Início:** usuário autenticado em dispositivo físico.
- **Etapas:** obter token e registrar na API.
- **Dados necessários:** token push e dispositivo.
- **Dados apresentados:** Não identificado.
- **Resultado esperado:** dispositivo apto a receber push.
- **Validações:** dispositivo físico e permissão/configuração de notificação.
- **Erros:** silenciosos; não há feedback visual identificado.
- **Feedbacks:** Não identificado.

# 5. Fluxos principais do usuário

## Login

- **Ponto de entrada:** abertura do app sem sessão.
- **Sequência:** Login -> Início.
- **Ações:** preencher e-mail/senha; tocar Entrar.
- **Decisões:** sucesso ou erro.
- **Resultado final:** usuário autenticado.
- **Sucesso:** abre Início.
- **Erro:** mensagem no painel.
- **Caminho alternativo:** Cadastro ou Redefinição.

## Recuperação de acesso

- **Ponto de entrada:** Redefinir senha.
- **Sequência:** Login -> Redefinição -> alerta.
- **Ações:** informar e-mail; enviar.
- **Decisões:** API retorna sucesso ou erro.
- **Resultado final:** pedido de redefinição solicitado.
- **Sucesso:** "Redefinição solicitada".
- **Erro:** "Redefinição não solicitada".
- **Caminho alternativo:** voltar para login.

## Dashboard

- **Ponto de entrada:** Home, menu lateral ou bottom nav.
- **Sequência:** Dashboard -> filtros -> produto expandido.
- **Ações:** pesquisar, filtrar, atualizar e expandir card.
- **Decisões:** usar filtros rápidos ou bottom sheet.
- **Resultado final:** usuário identifica produtos prioritários.
- **Sucesso:** lista filtrada e detalhes visíveis.
- **Erro:** mensagem de falha no carregamento.
- **Caminho alternativo:** limpar busca ou alterar filtros.

## Consulta e busca de produto

- **Ponto de entrada:** Produtos.
- **Sequência:** Produtos -> Detalhe -> Histórico.
- **Ações:** buscar; abrir produto; filtrar histórico.
- **Decisões:** ajustar período/tipo/ordenação ou voltar.
- **Resultado final:** produto e movimentações consultados.
- **Sucesso:** detalhe exibido.
- **Erro:** erros específicos não identificados para abrir detalhe.
- **Caminho alternativo:** limpar busca.

## Entrada por nota fiscal

- **Ponto de entrada:** Câmera.
- **Sequência:** Scanner -> Produtos lidos -> confirmação -> estoque.
- **Ações:** ler código ou digitar chave; revisar produtos; enviar.
- **Decisões:** ajustar contagem; adicionar observação; voltar para scanner; confirmar envio.
- **Resultado final:** estoque atualizado.
- **Sucesso:** "Entrada registrada".
- **Erro:** "Leitura não concluída", "Quantidade inválida", "Entrada não concluída".
- **Caminho alternativo:** usar chave manual quando câmera não for ideal.

## Entrega faltante

- **Ponto de entrada:** Detalhe do produto.
- **Sequência:** Detalhe -> Incluir faltante -> salvar.
- **Ações:** informar quantidade e observação.
- **Decisões:** cancelar fechando acordeão ou salvar.
- **Resultado final:** estoque incrementado.
- **Sucesso:** "Entrada registrada".
- **Erro:** quantidade inválida ou erro de API.
- **Caminho alternativo:** Não identificado.

## Solicitação e aprovação de retirada

- **Ponto de entrada:** Detalhe do produto.
- **Sequência:** Detalhe -> Solicitar retirada -> Solicitações/Notificações -> Aceitar/Recusar.
- **Ações:** criar solicitação; analista aprova ou recusa.
- **Decisões:** aceitar ou recusar.
- **Resultado final:** solicitação analisada; estoque baixado se aprovada.
- **Sucesso:** solicitação enviada e status atualizado.
- **Erro:** falha ao solicitar ou atualizar.
- **Caminho alternativo:** acompanhar resposta nas notificações.

## Transferência entre filiais

- **Ponto de entrada:** Filial.
- **Sequência:** Reservar -> Movimentações -> A caminho -> Entrada ou Cancelada.
- **Ações:** selecionar produto/origem/destino; reservar; avançar status.
- **Decisões:** cancelar ou concluir entrada.
- **Resultado final:** produto transferido ou reserva devolvida.
- **Sucesso:** status atualizado.
- **Erro:** reserva, movimentação ou cancelamento não concluídos.
- **Caminho alternativo:** filtrar movimentações por origem/destino.

## Gestão de usuários

- **Ponto de entrada:** Acessos.
- **Sequência:** Acessos -> Cadastrar usuário ou card expandido.
- **Ações:** criar usuário; habilitar/cortar; alterar função/plano/módulos; redefinir senha; excluir.
- **Decisões:** confirmar alteração de função ou exclusão.
- **Resultado final:** acesso atualizado.
- **Sucesso:** alertas de cadastro, senha ou exclusão.
- **Erro:** erro de cadastro, atualização, senha ou exclusão.
- **Caminho alternativo:** buscar usuário por nome/e-mail.

## Perfil e configurações pessoais

- **Ponto de entrada:** menu lateral.
- **Sequência:** Perfil -> editar dados -> salvar.
- **Ações:** alterar foto, nome, e-mail, senha e câmera automática.
- **Decisões:** remover foto; abrir planos.
- **Resultado final:** perfil atualizado.
- **Sucesso:** "Perfil atualizado".
- **Erro:** permissão de foto, formato inválido ou falha ao atualizar.
- **Caminho alternativo:** ir para Planos.

## Plano e checkout

- **Ponto de entrada:** Planos ou Perfil.
- **Sequência:** Planos -> Dados de cobrança -> checkout externo -> retorno.
- **Ações:** escolher plano; preencher dados; abrir checkout.
- **Decisões:** plano gratuito/personalizado ou plano pago.
- **Resultado final:** checkout iniciado ou plano atualizado.
- **Sucesso:** "Upgrade iniciado" ou mensagem de Planos.
- **Erro:** validações de formulário ou "Upgrade nao iniciado".
- **Caminho alternativo:** fechar modal.

## Certificado digital

- **Ponto de entrada:** Certificado.
- **Sequência:** Certificado -> formulário -> salvar/remover.
- **Ações:** preencher documento, ambiente, UF, arquivo e senha.
- **Decisões:** adicionar/editar ou remover.
- **Resultado final:** certificado configurado ou removido.
- **Sucesso:** "Certificado salvo" ou "Certificado removido".
- **Erro:** validações de documento/arquivo/senha.
- **Caminho alternativo:** Não identificado.

## Exportação

- **Ponto de entrada:** Não identificado.
- **Sequência:** Não identificado.
- **Ações:** Não identificado.
- **Decisões:** Não identificado.
- **Resultado final:** Não identificado.
- **Sucesso:** Não identificado.
- **Erro:** Não identificado.
- **Caminho alternativo:** Não identificado.

## Geração de documentos

- **Ponto de entrada:** Não identificado.
- **Sequência:** Não identificado.
- **Ações:** Não identificado.
- **Decisões:** Não identificado.
- **Resultado final:** Não identificado.
- **Sucesso:** Não identificado.
- **Erro:** Não identificado.
- **Caminho alternativo:** Não identificado.

# 6. Entidades e informações do produto

## Usuário

- **Significado:** pessoa que acessa o app.
- **Informações:** nome, e-mail, foto, função, plano, status, módulos, câmera automática, datas.
- **Relacionamentos:** pode criar solicitações; pode gerenciar outros usuários; tem plano e módulos.
- **Onde aparece:** Login, Perfil, Acessos, Solicitações, Notificações.
- **Ações:** criar, atualizar perfil, alterar permissão, redefinir senha, excluir, habilitar/cortar.

## Plano

- **Significado:** assinatura que controla acesso e limite.
- **Informações:** nome, descrição, preço, módulos, recursos, limite de usuários, destaque.
- **Relacionamentos:** associado a usuário; define limite de usuários gerenciados.
- **Onde aparece:** Home, Perfil, Acessos, Planos.
- **Ações:** selecionar, fazer upgrade, solicitar contato, abrir checkout.

## Produto

- **Significado:** item de estoque.
- **Informações:** nome, EAN, quantidade, estoque por filial, histórico.
- **Relacionamentos:** vem de nota fiscal; tem movimentações; pode ter solicitações e transferências.
- **Onde aparece:** Produtos, Detalhe, Dashboard, Filial, Solicitações, Notificações.
- **Ações:** consultar, buscar, incluir faltante, solicitar retirada, reservar para filial.

## Nota fiscal

- **Significado:** origem de entrada de produtos.
- **Informações:** chave de acesso, origem, produtos lidos.
- **Relacionamentos:** gera entradas de estoque.
- **Onde aparece:** Scanner e Produtos lidos.
- **Ações:** ler, buscar por chave, revisar, enviar ao estoque.

## Produto lido da nota

- **Significado:** item retornado da nota antes de entrar no estoque.
- **Informações:** nome, EAN, quantidade da NF, contagem, observação.
- **Relacionamentos:** pertence à nota fiscal.
- **Onde aparece:** Produtos lidos.
- **Ações:** ajustar contagem, adicionar observação, enviar ao estoque.

## Movimentação de estoque

- **Significado:** registro de entrada, retirada, ajuste ou divergência.
- **Informações:** tipo, quantidade, fonte, chave da nota, observação, data, quantidade da NF, quantidade contada.
- **Relacionamentos:** pertence a um produto.
- **Onde aparece:** Histórico do produto.
- **Ações:** consultar, buscar, filtrar e ordenar.

## Dashboard de inventário

- **Significado:** visão consolidada da saúde do estoque.
- **Informações:** métricas, filtros, faixas de envelhecimento, produtos analisados.
- **Relacionamentos:** usa produtos e movimentações.
- **Onde aparece:** Dashboard.
- **Ações:** filtrar, atualizar, expandir produto.

## Filial

- **Significado:** local de estoque ou destino/origem de transferência.
- **Informações:** código e nome.
- **Relacionamentos:** origem/destino de transferências; associada a estoque de produto.
- **Onde aparece:** Filial e Dashboard.
- **Ações:** selecionar, filtrar.

## Transferência entre filiais

- **Significado:** movimentação entre estoque central/filiais.
- **Informações:** produto, EAN, quantidade, origem, destino, lote, status, histórico, ID.
- **Relacionamentos:** produto e filiais.
- **Onde aparece:** Filial.
- **Ações:** criar reserva, marcar a caminho, dar entrada, cancelar.

## Solicitação de estoque

- **Significado:** pedido de retirada de produto.
- **Informações:** produto, EAN, quantidade, observação, status, solicitante, revisor, datas.
- **Relacionamentos:** produto, solicitante e revisor.
- **Onde aparece:** Detalhe do produto, Solicitações, Notificações.
- **Ações:** criar, aprovar, recusar, consultar.

## Certificado digital

- **Significado:** certificado A1 da organização para uso fiscal.
- **Informações:** documento, ambiente, UF autorizadora, arquivo, validade, status.
- **Relacionamentos:** pertence à organização/owner.
- **Onde aparece:** Certificado.
- **Ações:** adicionar, editar, remover.

## Cobrança

- **Significado:** dados necessários para checkout de plano pago.
- **Informações:** CPF/CNPJ, telefone, CEP, endereço, número, bairro, plano.
- **Relacionamentos:** plano selecionado.
- **Onde aparece:** Dados de cobrança.
- **Ações:** preencher e abrir checkout.

## Notificação

- **Significado:** aviso ou pendência exibida ao usuário.
- **Informações:** título, texto, tom.
- **Relacionamentos:** pode estar ligada a solicitação de estoque ou erro global.
- **Onde aparece:** Header e Notificações.
- **Ações:** visualizar, aprovar ou recusar solicitação.

# 7. Componentes e padrões reutilizáveis

## Header global

- **Onde é utilizado:** área autenticada.
- **Função:** navegação, título da tela, loading e notificações.
- **Variações:** título muda por tela; status bar muda no Scanner.
- **Comportamentos:** abre menu lateral; abre Notificações; mostra ponto de notificação.
- **Inconsistências:** subtítulo é fixo mesmo em telas administrativas.

## Menu lateral

- **Onde é utilizado:** área autenticada.
- **Função:** navegação completa.
- **Variações:** itens condicionados por módulo/perfil.
- **Comportamentos:** fecha ao tocar no backdrop ou item.
- **Inconsistências:** item XML está comentado e não aparece.

## Bottom navigation

- **Onde é utilizado:** área autenticada.
- **Função:** atalhos principais.
- **Variações:** itens condicionados por permissão.
- **Comportamentos:** item ativo vira pill azul.
- **Inconsistências:** cobre também telas administrativas, onde pode competir com fluxo de formulário.

## Cards

- **Onde é utilizado:** Home, Dashboard, Produtos, Histórico, Filial, Solicitações, Acessos, Planos, Certificado.
- **Função:** agrupar informações e ações.
- **Variações:** cards de métrica, produto, usuário, plano, transferência, notificação.
- **Comportamentos:** muitos são expansíveis.
- **Inconsistências:** densidade e quantidade de informações variam bastante.

## Formulários

- **Onde é utilizado:** Auth, Scanner manual, revisão, produto, filial, acessos, perfil, planos, certificado.
- **Função:** coletar dados.
- **Variações:** inputs simples, textareas, secure text, numeric/decimal pad, upload.
- **Comportamentos:** validações por alerta ou mensagem inline.
- **Inconsistências:** alguns erros são inline, outros são alertas nativos.

## Chips e badges

- **Onde é utilizado:** Dashboard, Solicitações, Histórico, Planos, Acessos, Certificado.
- **Função:** status, filtro e seleção.
- **Variações:** filtros, plano ativo, status, módulos, tipo de documento.
- **Comportamentos:** chips selecionados ficam azuis.
- **Inconsistências:** tamanho e peso visual variam por tela.

## Modais e drawers

- **Onde é utilizado:** menu lateral, filtros, seletores, revisão, cadastro, cobrança, calendário.
- **Função:** tarefas secundárias ou fluxos temporários.
- **Variações:** fade, slide, full screen, bottom sheet.
- **Comportamentos:** fechar por botão/backdrop quando aplicável.
- **Inconsistências:** modais longos podem ficar carregados em telas pequenas.

## Seletores

- **Onde é utilizado:** Filial, Certificado, Acessos, Planos.
- **Função:** escolher opções.
- **Variações:** modal selector, chips, listas inline.
- **Comportamentos:** filtra opções por texto em Filial.
- **Inconsistências:** padrão de seleção muda entre módulos.

## Estados vazios

- **Onde é utilizado:** Produtos, Dashboard, Histórico, Solicitações, Notificações, Filial, Acessos.
- **Função:** informar ausência de dados.
- **Variações:** texto simples ou card.
- **Comportamentos:** alguns sugerem ajuste de filtro; outros apenas informam.
- **Inconsistências:** nem todos têm CTA de próximo passo.

## Feedback de carregamento

- **Onde é utilizado:** header, Dashboard, botões de ações, pull-to-refresh.
- **Função:** indicar operação em andamento.
- **Variações:** ActivityIndicator, disabled button, refresh control.
- **Comportamentos:** bloqueia repetição de ações.
- **Inconsistências:** algumas ações usam loading global, outras saving local.

## Alertas e confirmações

- **Onde é utilizado:** envio ao estoque, solicitações, filial, acessos, certificado, perfil, planos.
- **Função:** avisar erro, sucesso ou pedir confirmação.
- **Variações:** alertas nativos e mensagens inline.
- **Comportamentos:** ações destrutivas pedem confirmação.
- **Inconsistências:** textos têm acentuação inconsistente em alguns pontos.

## Tabelas e paginação

- **Onde é utilizado:** Não identificado.
- **Função:** Não identificado.
- **Variações:** Não identificado.
- **Comportamentos:** Não identificado.
- **Inconsistências:** listas longas usam rolagem/FlatList sem paginação visual.

# 8. Design atual

## Cores

- Azul principal: `#3b82f6`.
- Azul suave: `#eaf4ff`.
- Azul escuro: `#17263a`.
- Branco: `#ffffff`.
- Fundo: `#f6f8fb`.
- Superfície: `#ffffff`.
- Superfície suave: `#f8fafc`.
- Borda: `#edf2f7`.
- Borda forte: `#dbe4f0`.
- Texto: `#1f2937`.
- Texto secundário: `#64748b`.
- Perigo: `#991b1b`.
- Alerta: `#B45309`, `#FFF4D6`, `#F59E0B`.
- Sucesso: `#15803d`, `#dcfce7`.

## Tipografia

- Fonte do sistema do React Native.
- Títulos geralmente em 18 a 26 px.
- Labels, metadados e chips usam tamanhos menores, em torno de 8 a 14 px.
- Peso visual alto em títulos, botões, valores e labels.
- Letter spacing específico não identificado.

## Hierarquia visual

- A hierarquia depende de cards, pesos altos, ícones, badges e cor azul.
- A tela Home tem hero e métricas claras.
- Dashboard e histórico são mais densos.
- Modais de cadastro/cobrança/certificado têm forte carga de campos.

## Espaçamentos

- Padding frequente de 16 px em telas.
- Gaps recorrentes de 8 a 16 px.
- Cards geralmente têm padding entre 12 e 18 px.
- Scanner usa layout full screen com overlay.

## Bordas e sombras

- Bordas claras em cards e inputs.
- Raios definidos: 10, 14, 18, 22 e pill.
- Sombras suaves em cards principais.
- Sombra azul em botões/elementos primários.

## Ícones

- Usa Ionicons.
- Ícones aparecem em botões, cards, status, menu, filtros e inputs.
- Ícones reforçam ações: câmera, barcode, cube, people, card, shield, notifications.

## Sidebar

- Drawer/modal lateral branco com backdrop escuro.
- Título "Menu" e botão de fechar.
- Lista vertical com ícones.

## Navbar/header

- Header superior com botão de menu à esquerda.
- Título e subtítulo no centro.
- Loading e sino à direita.
- Sino usa ponto de notificação.

## Tabelas

Não identificado. O app apresenta dados em listas, cards, grids e calendário.

## Formulários

- Inputs arredondados.
- Labels acima de campos em várias telas.
- Botões primários azuis.
- Botões secundários com fundo claro/borda.
- Botões destrutivos em vermelho suave.
- Alguns formulários usam teclado evitável.

## Cards

- Cards brancos, borda clara, sombra suave.
- Cards expansíveis para detalhe.
- Cards de plano e certificado têm mais estrutura.
- Cards de histórico usam ícones, badges e chips.

## Modais

- Menu lateral em modal fade.
- Seletores e formulários em modal slide.
- Revisão de nota em modal full screen.
- Calendário em modal fade.

## Responsividade

- Mobile retrato é o principal.
- iOS/Android têm ajustes de teclado e safe area.
- Desktop: Não identificado como experiência principal, apesar de existir script web.

## Comportamento mobile

- Conteúdos usam ScrollView/FlatList.
- Bottom nav fixa.
- Câmera em tela cheia.
- Modais adaptados ao teclado.
- Upload usa seletores nativos.

## Comportamento desktop

Não identificado.

## Padrões de feedback

- ActivityIndicator.
- Botões disabled.
- Pull-to-refresh.
- Alertas nativos.
- Mensagem de erro global.
- Badges de status.
- Estados vazios textuais.

## Consistência entre telas

- Cores e ícones são consistentes.
- Padrões de filtros variam entre Dashboard, Histórico, Solicitações e Filial.
- Alguns textos aparecem sem acento correto.
- Alguns elementos de interface têm funcionalidades comentadas ou não expostas.

# 9. Hierarquia das informações

## Login/Cadastro

- **Mais importante:** entrar ou criar acesso.
- **Ação principal:** Entrar / Criar acesso.
- **Ações secundárias:** redefinir senha, voltar ao login.
- **Maior destaque:** e-mail, senha e erro.
- **Segundo plano:** tagline.
- **Competição de atenção:** tabs e botão secundário.
- **Risco:** erro pode competir com campos se a mensagem for longa.

## Início

- **Mais importante:** atalhos operacionais.
- **Ação principal:** abrir Câmera ou módulo necessário.
- **Ações secundárias:** atualizar, abrir planos/certificado/acessos.
- **Maior destaque:** produtos em estoque e itens para conferir.
- **Segundo plano:** texto do hero.
- **Competição de atenção:** muitos atalhos no grid.
- **Risco:** usuários novos podem não saber qual ação iniciar.

## Dashboard

- **Mais importante:** produtos com problema de estoque.
- **Ação principal:** filtrar e expandir produto.
- **Ações secundárias:** atualizar, limpar busca.
- **Maior destaque:** status, dias parado e quantidades.
- **Segundo plano:** data de geração e metadados.
- **Competição de atenção:** busca, filtros e métricas no topo.
- **Risco:** indicadores ocultos/comentados podem reduzir visão analítica.

## Scanner

- **Mais importante:** área de leitura e botão Ler NF.
- **Ação principal:** ler código ou buscar chave.
- **Ações secundárias:** flash, trocar modo.
- **Maior destaque:** botão Ler NF/Parar.
- **Segundo plano:** instrução lateral.
- **Competição de atenção:** flash e modos.
- **Risco:** estado armado/desarmado pode confundir.

## Produtos lidos

- **Mais importante:** contagem real e divergência.
- **Ação principal:** Enviar ao estoque.
- **Ações secundárias:** ajustar quantidade, observação, voltar.
- **Maior destaque:** produtos divergentes.
- **Segundo plano:** chave de acesso.
- **Competição de atenção:** muitos cards de produto.
- **Risco:** usuário pode enviar sem revisar todos se lista for longa.

## Produtos

- **Mais importante:** busca e lista.
- **Ação principal:** abrir produto.
- **Ações secundárias:** limpar busca.
- **Maior destaque:** nome do produto.
- **Segundo plano:** dados pouco visíveis na lista atual.
- **Competição de atenção:** Não identificado.
- **Risco:** lista mostra pouco contexto além do nome.

## Detalhe do produto

- **Mais importante:** estoque e histórico.
- **Ação principal:** consultar histórico ou solicitar ação.
- **Ações secundárias:** filtros avançados.
- **Maior destaque:** quantidade em estoque e movimentações.
- **Segundo plano:** filtros complexos.
- **Competição de atenção:** ações operacionais e histórico na mesma tela.
- **Risco:** filtros do histórico podem ficar difíceis de encontrar.

## Filial

- **Mais importante:** reservar ou acompanhar movimentação.
- **Ação principal:** reservar para filial.
- **Ações secundárias:** filtrar movimentações, avançar status.
- **Maior destaque:** produto, origem, destino e status.
- **Segundo plano:** ID e histórico detalhado.
- **Competição de atenção:** dois acordeões principais.
- **Risco:** origem/destino podem causar erro se não estiverem claros.

## Solicitações

- **Mais importante:** pendentes.
- **Ação principal:** aceitar ou recusar.
- **Ações secundárias:** buscar, filtrar por período.
- **Maior destaque:** produto, solicitante e quantidade.
- **Segundo plano:** histórico.
- **Competição de atenção:** status e ações no card.
- **Risco:** botões de ação só aparecem após expandir.

## Acessos

- **Mais importante:** usuário e status de acesso.
- **Ação principal:** criar ou ajustar permissões.
- **Ações secundárias:** senha, excluir.
- **Maior destaque:** status habilitado/cortado e módulos.
- **Segundo plano:** plano e papel quando não editáveis.
- **Competição de atenção:** muitas ações dentro do card expandido.
- **Risco:** exclusão e senha ficam próximas de ações comuns.

## Certificado

- **Mais importante:** status Ativo/Pendente.
- **Ação principal:** salvar certificado.
- **Ações secundárias:** remover certificado.
- **Maior destaque:** validade e documento.
- **Segundo plano:** UF autorizadora.
- **Competição de atenção:** arquivo, senha e ambiente.
- **Risco:** senha opcional em edição pode ser mal interpretada.

## Planos

- **Mais importante:** plano atual e opção de upgrade.
- **Ação principal:** escolher plano.
- **Ações secundárias:** solicitar contato.
- **Maior destaque:** preço e recursos.
- **Segundo plano:** lista de módulos.
- **Competição de atenção:** muitos recursos em cards.
- **Risco:** comparação entre planos pode exigir rolagem excessiva.

## Perfil

- **Mais importante:** dados pessoais e câmera automática.
- **Ação principal:** salvar perfil.
- **Ações secundárias:** foto e planos.
- **Maior destaque:** nome/e-mail e plano.
- **Segundo plano:** senha atual/nova senha.
- **Competição de atenção:** card de identidade e formulário.
- **Risco:** alteração de e-mail/senha depende de senha atual, mas isso pode não estar claro.

## Notificações

- **Mais importante:** solicitações pendentes e erros.
- **Ação principal:** aceitar/recusar quando aplicável.
- **Ações secundárias:** apenas leitura.
- **Maior destaque:** avisos acionáveis.
- **Segundo plano:** notificações informativas.
- **Competição de atenção:** erros globais e solicitações no mesmo espaço.
- **Risco:** ações críticas aparecem dentro de lista de avisos.

# 10. Problemas atuais de UX

## Fatos observados

- Não há rotas web tradicionais; o design precisa considerar navegação mobile por estado.
- Não há tabelas de dados; listas e cards substituem tabelas.
- Alguns textos aparecem sem acentuação ou com acentuação inconsistente.
- A entrada ativa para simulação/XML não está visível, apesar de existir função/API.
- O modo QR e o modo IA aparecem parcialmente no código, mas botões estão comentados ou sem fluxo completo.
- O componente ObservationModal existe, mas não é usado no fluxo renderizado atual.
- Dashboard possui seções de indicadores comentadas/ocultas.
- A tela Produtos lista principalmente nome, com pouco contexto visual imediato.
- Ações de Detalhe do produto e Histórico competem na mesma tela.
- Acessos concentra muitas ações sensíveis dentro do card expandido.
- Planos dependem de cards longos para comparação.
- Alguns feedbacks são alertas nativos; outros são mensagens inline.
- Desktop não tem comportamento de produto claramente definido.

## Sugestões relacionadas aos problemas

- Padronizar linguagem e acentos.
- Transformar listas densas em hierarquias com estados claros.
- Separar ações destrutivas em áreas de perigo.
- Expor funcionalidades incompletas apenas se forem finalizadas.
- Criar comparação mais clara entre planos.
- Reforçar contexto dos produtos na listagem.

# 11. Recomendações para o novo design

- Reorganizar Home por papéis de uso: Operar, Consultar, Administrar.
- Destacar Câmera/Entrada de nota como ação primária para operadores.
- Usar uma barra de resumo na revisão da nota com total de itens, divergências e observações.
- Mostrar progresso visual em transferência: Reservado -> A caminho -> Entrada na filial / Cancelada.
- Padronizar chips e filtros em Dashboard, Histórico, Solicitações e Filial.
- Transformar histórico de produto em timeline agrupada por data.
- Melhorar lista de produtos com EAN, estoque e sinalizadores de movimentação.
- Separar no detalhe do produto: resumo, ações e histórico.
- Em Acessos, dividir card expandido em seções: Status, Permissões, Segurança e Zona de perigo.
- Em Certificado, criar bloco de status mais evidente com validade.
- Em Planos, incluir comparação visual dos recursos sem remover cards.
- Em Notificações, separar "Ações pendentes" de "Avisos".
- Criar estados vazios com CTA contextual quando existir ação clara.
- Melhorar acessibilidade de textos pequenos e badges.
- Manter botões com ícone, mas garantir rótulos claros.
- Considerar layout desktop apenas como adaptação sugerida, pois o produto atual é mobile.

# 12. Restrições obrigatórias para o Figma Make

- Nenhuma funcionalidade existente pode ser removida.
- Nenhuma regra de negócio pode ser alterada.
- Nenhuma ação existente pode desaparecer.
- Todos os campos necessários devem permanecer.
- Todos os estados relevantes devem ser representados.
- O novo design pode reorganizar a interface, mas deve preservar o comportamento do produto.
- Não inventar funcionalidades sem identificá-las como sugestão.
- Diferenciar conteúdo existente de melhoria sugerida.
- Considerar desktop e mobile, mas reconhecer que o comportamento desktop atual não foi identificado.
- Manter clareza para usuários que usam o sistema diariamente.
- Preservar confirmação antes de envio ao estoque.
- Preservar confirmação para aceitar/recusar retirada.
- Preservar confirmação para excluir usuário.
- Preservar confirmação para remover certificado.
- Preservar confirmação para cancelar movimentação.
- Preservar permissões por módulo e perfil.
- Preservar telas públicas e autenticadas.
- Preservar upload de certificado .pfx/.p12.
- Preservar integração com checkout externo quando houver URL.

# 13. Conteúdo pronto para telas

## Marca e mensagens gerais

- BipaAí.
- Da nota ao estoque em segundos.
- Scanner de notas e estoque.
- NF-e direto no estoque.
- Escaneie a nota, confira os produtos e finalize a entrada sem retrabalho.

## Menu e navegação

- Início.
- Dashboard.
- Perfil.
- Planos.
- Escanear.
- Ver produtos.
- Filial.
- Solicitações.
- Gerenciar acessos.
- Certificado.
- Sair.
- Dash.
- Câmera.
- Produtos.

## Autenticação

- Entrar.
- Registre-se.
- Nome.
- Seu nome.
- E-mail.
- e-mail@empresa.com.
- Senha.
- Mínimo 6 caracteres.
- Criar acesso.
- Redefinir senha.
- Enviar e-mail de redefinição.
- Voltar para login.
- Redefinição solicitada.
- Redefinição não solicitada.

## Home

- produtos em estoque.
- itens para conferir.
- Dashboard.
- Câmera.
- Produtos.
- Filial.
- Solicitações.
- Acessos.
- Certificado.
- Planos.
- Atual: Free / Basic / Premium / Pro / Personalizado.

## Dashboard

- Produto.
- Filtros rápidos.
- Buscar produto...
- Filtros.
- Status.
- Todos.
- Parados.
- Em estoque.
- Aplicar filtros.
- Produtos.
- Parados.
- Média parada.
- Unidades.
- Maior tempo parado.
- Tempo parado.
- Produtos analisados.
- Nenhum produto encontrado.
- Ajuste a busca ou os filtros do dashboard.
- Sem estoque.
- Sem movimento.
- Parado.
- Atenção.
- Giro recente.

## Scanner

- Permitir camera.
- Libere a camera para ler codigo de barras e QRCode da NF-e/NFC-e.
- Liberar camera.
- Barras.
- Manual.
- Flash.
- Ligado.
- Ler NF.
- Parar.
- Lendo código de barras da DANFE.
- Toque em Ler NF e posicione o código.
- Digitar chave de acesso.
- 44 digitos da chave da NF-e/NFC-e.
- Buscar nota.
- Chave obrigatoria.
- Digite a chave de acesso da nota.
- Chave invalida.
- A chave de acesso da nota precisa ter 44 digitos.

## Revisão de nota

- Produtos lidos.
- Confira a contagem antes de enviar.
- Chave de acesso.
- Qtd. NF.
- Contagem.
- Observação da entrada.
- Ex: faltaram 2 unidades na entrega.
- Divergencia entre a NF e a contagem.
- Este produto tem observacao.
- Enviar ao estoque.
- Enviar para o estoque?
- Tem certeza que deseja enviar para o estoque? Após essa ação não poderá ser desfeita.
- Entrada registrada.
- Os produtos foram enviados para o estoque.
- Entrada não concluída.

## Produtos e histórico

- Nenhum produto no estoque.
- Leia uma nota ou simule um XML para registrar entradas.
- Buscar por produto, EAN ou código.
- Nenhum produto encontrado.
- Ajuste a busca ou limpe o filtro para ver a lista completa.
- Histórico completo.
- Nenhuma movimentação registrada para este produto.
- Pesquisar movimentações...
- Entradas.
- Divergências.
- Retiradas.
- Ajustes.
- Filtros do histórico.
- Período.
- Hoje.
- Esta semana.
- Este mês.
- Personalizado.
- Tipo.
- Entrada.
- Divergência.
- Retirada.
- Reprovada.
- Ajuste.
- Outros.
- Mais recentes.
- Mais antigas.
- Maior quantidade.
- Menor quantidade.
- Selecionar período.
- Ontem.
- Últimos 7 dias.
- Últimos 30 dias.
- Mês passado.
- Cancelar.
- Aplicar.
- Incluir faltante.
- Quantidade entregue.
- Observação da entrega faltante.
- Adicionar ao estoque.
- Solicitar retirada de estoque.
- Quantidade para retirada.
- Observação da solicitação.
- Enviar solicitação.
- Solicitação enviada.

## Filial

- Reservar estoque para filial.
- Busque produto e filiais por nome ou código antes de reservar.
- Produto.
- Buscar produto por nome ou EAN.
- Produto selecionado.
- Filial origem.
- Buscar filial origem por nome ou código.
- Filial destino.
- Buscar filial destino por nome ou código.
- Quantidade.
- Lote.
- Observação da reserva.
- Reservar para filial.
- Movimentações entre filiais.
- Acompanhe reservado, a caminho e entrada na filial.
- Pesquisar por produto ou ID.
- Digite produto, EAN ou ID da movimentação.
- Filtrar filial origem.
- Todas as origens.
- Filtrar filial destino.
- Todos os destinos.
- Limpar filtros.
- Nenhuma movimentação de filial ainda.
- Reservado.
- A caminho.
- Entrada na filial.
- Cancelada.
- Produto a caminho.
- Dar entrada na filial.
- Cancelar movimentação.
- Cancelar movimentação?
- O estoque reservado será devolvido para a filial de origem.

## Solicitações e notificações

- Buscar produto, EAN ou ID.
- Todos.
- Hoje.
- 7 dias.
- 30 dias.
- Mes.
- Pendentes.
- Historico.
- Nenhuma solicitacao de estoque encontrada.
- Nenhuma solicitacao encontrada com os filtros atuais.
- Nenhuma solicitacao pendente.
- Aceitar.
- Recusar.
- Aceitar retirada?
- O estoque será baixado do produto.
- Recusar retirada?
- A solicitação será marcada como recusada.
- Notificacoes.
- aviso(s) no momento.
- Nenhuma notificacao agora.
- Solicitação de estoque.
- Retirada aprovada.
- Retirada reprovada.
- Atenção.
- Entrada pendente.

## Acessos

- Novo usuário.
- Limite do plano atingido.
- Buscar por nome ou e-mail.
- Nenhum usuário encontrado.
- Habilitado.
- Cortado.
- Principal.
- Master.
- Padrão.
- Redefinir senha deste usuário.
- Nova senha.
- Aplicar nova senha.
- Excluir usuário.
- Cadastrar usuário.
- Crie o acesso e depois habilite os módulos no card do usuário.
- Nome.
- Senha inicial.
- Cadastrar acesso.
- Alterar função?
- Excluir usuário?
- Usuário excluído.
- Acesso cadastrado.

## Perfil

- Ver planos e upgrades.
- Remover foto.
- Minha conta.
- Senha atual para alterar e-mail ou senha.
- Nova senha.
- Salvar perfil.
- Perfil atualizado.
- Permissão necessária.
- Libere acesso as fotos para anexar uma imagem de perfil.
- Formato inválido.
- Escolha uma imagem PNG, JPG, JPEG ou WEBP.

## Planos e cobrança

- Seu plano atual e.
- Mais indicado.
- Plano atual.
- Mudar para Free.
- Fazer upgrade para.
- Solicitar contato.
- Dados de cobranca.
- CPF ou CNPJ.
- Telefone com DDD.
- CEP.
- Endereco.
- Numero.
- Bairro.
- Abrir checkout.
- Upgrade iniciado.
- Upgrade nao iniciado.
- Informe um CPF ou CNPJ valido.
- Informe um telefone com DDD.
- Informe um CEP valido.
- Informe endereco, numero e bairro.

## Certificado

- Certificado.
- Certificado configurado para esta organização.
- Nenhum certificado configurado.
- Ativo.
- Pendente.
- Arquivo.
- Documento.
- Ambiente.
- Validade.
- Editar certificado.
- Adicionar certificado.
- CNPJ.
- CPF.
- Produção.
- Homologação.
- UF autorizadora (ex.: 35).
- Selecionar arquivo.
- Trocar arquivo.
- Senha do certificado.
- Salvar certificado.
- Remover certificado.
- Remover certificado?
- As próximas consultas SEFAZ deixarão de usar este certificado.
- Certificado salvo.
- Certificado removido.

## Sugestões de texto

Sugestão: padronizar acentuação de "camera" para "câmera", "solicitacao" para "solicitação", "Historico" para "Histórico", "Mes" para "Mês", "cobranca" para "cobrança" e "Endereco" para "Endereço".

# 14. Pontos não identificados

- **Item:** Rotas web reais.
- **Motivo:** o app usa navegação interna por estado, sem arquivo de roteamento web encontrado.

- **Item:** Tabelas de dados.
- **Motivo:** a interface usa cards, listas, grids e calendário; tabela tradicional não foi encontrada.

- **Item:** Paginação visual.
- **Motivo:** listas usam rolagem/FlatList; paginação não foi encontrada.

- **Item:** Exportação de dados.
- **Motivo:** nenhuma tela, botão ou API de exportação foi encontrada.

- **Item:** Geração de documentos.
- **Motivo:** nenhuma funcionalidade ativa de geração de documentos foi encontrada.

- **Item:** Comportamento desktop.
- **Motivo:** existe script web, mas a interface e as regras visuais analisadas são mobile; adaptação desktop não está definida no produto.

- **Item:** Entrada ativa para simulação/XML.
- **Motivo:** existe função/API de simulação e referências comentadas, mas nenhum botão ativo visível foi confirmado.

- **Item:** Modo QR ativo no scanner.
- **Motivo:** modo existe no código, mas o botão de QRCode está comentado na interface.

- **Item:** Fluxo de OCR/IA completo.
- **Motivo:** há alerta informando que o próximo passo é conectar OCR/IA no backend; funcionalidade completa não foi confirmada.

- **Item:** Uso do componente ObservationModal.
- **Motivo:** o componente existe, mas o fluxo renderizado usa observação inline no modal de revisão; uso ativo não foi encontrado.

- **Item:** Organização real de filiais além das opções fixas.
- **Motivo:** opções de filial aparecem fixas no app; tela de cadastro/edição de filial não foi encontrada.

- **Item:** Tela de administração financeira além do checkout.
- **Motivo:** só foram identificados cards de planos e modal de cobrança; histórico financeiro não foi encontrado.

- **Item:** Permissões detalhadas fora dos módulos listados.
- **Motivo:** foram encontrados módulos principais e papéis, mas não permissões granulares além deles.
