# TUCA — Protótipos do portal

Três propostas navegáveis para avaliação do dirigente do Templo de Umbanda Caminhos de Aruanda. Este material é um protótipo local, não o site definitivo.

Repositório: https://github.com/orgdev9-byte/TemploTuca. As três propostas são organizadas na branch `prototipos/portal-conteudo-navegacao`, para revisão antes da incorporação à branch principal.

## Abrir os protótipos

Abra `dist/index.html` diretamente no navegador. Todos os arquivos são locais, inclusive as imagens; não é necessário instalar dependências ou acessar serviços externos.

Para desenvolver, use Node.js 22 ou superior:

```sh
npm test
npm run build
npm run dev
```

O servidor local fica em http://127.0.0.1:4173. Após editar conteúdo ou código, execute `npm run build` e recarregue a página. O servidor serve somente a pasta `dist`, não expõe os arquivos de trabalho e escuta somente na interface local.

## Propostas visuais

| Arquivo | Proposta | Composição |
| --- | --- | --- |
| `proposta-1.html` | Moderno e acolhedor | Creme, verde discreto, tipografia serifada, fotografia em arco |
| `proposta-2.html` | Tradicional e marcante | Preto, vermelho, tons de prata, fotografia de fundo e contraste forte |
| `proposta-3.html` | Contemporâneo e institucional | Azul profundo, branco, linhas precisas, painel editorial com fotografia |

Cada proposta tem um arquivo CSS próprio. Conteúdo, navegação e componentes são compartilhados, para manter a mesma arquitetura entre as três versões. A seleção de propostas é uma tela separada.

## Estrutura de conteúdo

O catálogo tem 47 páginas por proposta, divididas em oito áreas principais:

- Início.
- O TUCA: nossa história, missão, casa e congá, funcionamento das giras, dirigentes.
- Umbanda: introdução, história, fundamentos, mediunidade, pontos cantados e glossário.
- Orixás: introdução, Oxalá, Ogum, Oxóssi, Xangô, Oxum, Iemanjá, Iansã e outros temas.
- Linhas de Trabalho: introdução, Caboclos, Pretos-Velhos, Erês, Baianos, Marinheiros, Ciganos, Boiadeiros, Exus e Pombagiras, outras linhas.
- Calendário: próximos encontros, calendário completo e eventos especiais.
- Conteúdos: comunicados, artigos, galeria e eventos realizados.
- Visite o TUCA: como chegar, primeira visita, dúvidas frequentes e contatos.

Os nomes religiosos são sugestões de organização retiradas do planejamento anterior; não constituem uma lista oficial dos fundamentos da casa. Todos os textos são demonstrações explícitas. Não há história institucional, doutrina, biografias, datas de gira, horários ou contatos inventados.

## Navegação orientada por dados

`content/portal.json` é a fonte de conteúdo. Cada página tem `id`, `slug`, `parentId`, `title`, `template`, `order`, `showInNavigation`, `status`, `summary` e `blocks`.

- `parentId: null`: item do menu principal.
- `parentId: "orixas"`: submenu/página da área Orixás.
- `order`: ordem entre páginas do mesmo nível.
- `showInNavigation`: controla a presença nos menus; a página continua acessível por seu endereço.
- `template`: `home`, `collection`, `article`, `calendar`, `gallery` ou `visit`.
- `blocks`: blocos de texto estruturados (`heading`, `paragraph`, `list`). Texto é escapado; não se injeta HTML do catálogo.

Exemplo de um futuro tópico de demonstração, adicionado somente aos dados:

```json
{
  "id": "umbanda-novo-tema",
  "slug": "novo-tema",
  "title": "Novo tema",
  "parentId": "umbanda",
  "template": "article",
  "order": 10,
  "showInNavigation": true,
  "status": "demo",
  "summary": "Demonstração de novo assunto, sujeito à aprovação.",
  "blocks": [
    { "type": "paragraph", "text": "Texto provisório de demonstração." }
  ]
}
```

Depois da inclusão e da geração com `npm run build`, a página, seu endereço e o submenu são criados automaticamente. Há suporte a hierarquias aninhadas, sem uma lista de rotas escrita manualmente. O build valida IDs/caminhos duplicados, pais inexistentes e ciclos na árvore.

## Evolução para o painel administrativo

O painel **não foi implementado**. Nesta fase, os dados ficam em um JSON e o build gera `dist/portal-data.js`, para permitir até a abertura direta por arquivo. Futuramente, um painel poderá editar registros com esse contrato, e a função `repository.load()` em `src/app.js` poderá receber o catálogo de uma API ou exportação do CMS. Assim, novos assuntos usando os modelos existentes não precisarão de alterações nos componentes ou de rotas programadas individualmente.

Autenticação, permissões de edição, persistência, aprovação editorial, upload de arquivos e a publicação deverão ser implementados e validados na fase definitiva. O calendário atual demonstra meses, filtros e estado vazio; não é uma agenda conectada a um serviço nem um cadastro de eventos.

## Acessibilidade e responsividade

- Links de seção separados dos botões de expansão dos submenus.
- Botões nativos com `aria-expanded`, `aria-controls` e nomes descritivos.
- Desktop: submenus suspensos acionados por clique, Enter ou Espaço; Seta para baixo abre e posiciona o foco no primeiro link.
- Celular: menu principal expansível e submenus em acordeão.
- Escape fecha o submenu e devolve o foco ao botão; Escape também fecha o menu móvel.
- Clique fora fecha o menu; troca de página fecha as expansões e coloca o foco no conteúdo.
- Link para pular navegação, trilhas de navegação, página atual indicada, textos alternativos e redução de movimento.
- Rotas por fragmento (`#/orixas/oxala`), compatíveis com abertura local e com histórico Voltar/Avançar, sem configuração de servidor.

## Arquivos

```text
content/portal.json       Catálogo compartilhado de páginas
src/app.js               Componentes, navegação e adaptador de dados
src/index.html           Seleção das propostas
src/proposta-*.html       Entradas independentes
src/styles/base.css      Componentes e regras responsivas
src/styles/warm.css      Proposta 01
src/styles/dark.css      Proposta 02
src/styles/blue.css      Proposta 03
src/styles/branding.css  Logotipo original nas miniaturas e cabeçalhos
src/assets/              Logotipo e fotografia originais
scripts/model.mjs        Validação do catálogo
scripts/content.test.mjs Testes da árvore de conteúdo
scripts/build.mjs        Geração estática sem dependências
scripts/serve.mjs        Servidor local
dist/                    Protótipos prontos para abrir
```

O logotipo e a fotografia foram copiados dos anexos originais sem edição dos arquivos. O enquadramento visual é feito por CSS; a galeria exibe a fotografia completa. Não foram usadas imagens geradas ou copiadas de terceiros.

A referência https://www.machadodaluzdourada.com.br/index.php foi consultada exclusivamente para compreender a organização por menus, submenus e páginas. Código, textos, fotografias e identidade visual não foram reproduzidos.

Não há painel, banco de dados, analytics, mapas incorporados, fontes remotas, chamadas a APIs externas, configuração de domínio ou publicação automática.

## Verificação desta entrega

Os quatro testes automatizados do catálogo passaram. A geração estática, a verificação de sintaxe JavaScript e a resposta HTTP da seleção também passaram. Foram exercitados em navegador os menus, abertura por teclado, Escape, página introdutória de Orixás, páginas individuais de Oxalá e Caboclos, calendário com mudança de mês e filtro, e retorno à seleção. As três propostas foram inspecionadas visualmente. Amostras em 320 e 390 pixels de largura não apresentaram rolagem horizontal. Os arquivos originais e as cópias usadas no projeto têm os mesmos hashes SHA-256.

O repositório foi iniciado com uma apresentação na branch principal. Os protótipos são entregues por uma branch de revisão. Não há implantação do site ou conexão de domínio.

Correção do logo (arquivos fornecidos em 05/11/2026): versão com fundo claro nos temas claros e no seletor, e transparente na proposta escura. Os arquivos são preservados sem edição. Foi removida a máscara circular, a borda e o preenchimento artificial. A largura é responsiva e a altura segue a proporção natural de cada arquivo (759 × 702 e 1006 × 1024).
