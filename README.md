# T.U.C.A — Portal institucional e educativo

Site do Templo de Umbanda Caminhos de Aruanda. A identidade escolhida usa areia, palha e marrom, com Lora nos títulos e Manrope nos textos e interfaces.

O portal abre em `dist/index.html`. A comparação visual e as três páginas antigas de propostas não fazem mais parte da publicação. Seus arquivos em `src` e o histórico Git foram preservados; o build os exclui de `dist`. Na hospedagem, os endereços antigos redirecionam para a página inicial por meio de `_redirects`.

## Desenvolvimento local

Use Node.js 22:

```sh
npm test
npm run build
npm run dev
```

A prévia fica em http://127.0.0.1:4173 e funciona enquanto o servidor estiver ligado. Não há dependências de instalação. Se `npm` não estiver disponível, os comandos equivalentes são `node --test scripts/content.test.mjs`, `node scripts/build.mjs` e `node scripts/serve.mjs`.

Após alterar os arquivos em `src` ou `content`, gere novamente `dist`. A pasta `dist` é a publicação estática, também versionada no repositório.

## Estrutura

- `content/portal.json`: menus, páginas, textos, imagens, calendário e informações da casa.
- `src/index.html`: entrada única do site escolhido.
- `src/app.js`: navegação, conteúdo, calendário e componentes compartilhados.
- `src/styles/`: apresentação responsiva e identidade visual.
- `src/assets/`: logotipo original, fotografia do congá e ilustrações.
- `src/_redirects`: redirecionamento dos endereços antigos de propostas para o início.
- `scripts/model.mjs`: validação dos dados.
- `scripts/content.test.mjs`: testes do catálogo.
- `scripts/build.mjs`: gera o portal e exclui os estudos visuais da publicação.
- `scripts/serve.mjs`: prévia local.
- `docs/`: registros das ilustrações.
- `netlify.toml`: configuração anterior, preservada durante a migração.

Os arquivos `src/propostas.html` e `src/proposta-1.html`, `src/proposta-2.html`, `src/proposta-3.html` são estudos históricos. Não são copiados para o site público. Não é necessário apagá-los para retirar a área de protótipos.

## Conteúdo e navegação

O catálogo atual contém 51 páginas, organizadas em Início, O T.U.C.A, Umbanda, Orixás, Linhas de Trabalho, Atendimento e Conteúdos.

As páginas usam `id`, `slug`, `parentId`, `title`, `template`, `order`, `showInNavigation`, `status`, `summary` e `blocks`. Novos assuntos podem ser adicionados aos dados sem programar rotas manualmente. O build impede IDs e caminhos duplicados, pais inexistentes e ciclos. As rotas por fragmento (`#/umbanda/fundamentos`) dispensam configuração de rotas no servidor.

Orixás e Guias Espirituais possuem introduções e páginas individuais. Os textos recebidos da casa são diferenciados de conteúdos demonstrativos ainda não aprovados. A retirada dos protótipos não aprova automaticamente conteúdos provisórios. Não há painel administrativo, CMS ou banco de dados nesta fase.

O calendário utiliza eventos confirmados, com data e horários. A página inicial apresenta os próximos três encontros, com horários compartilhados quando forem iguais. O calendário completo permite navegar entre meses e filtrar as atividades.

## Publicação e aprovação

Repositório: https://github.com/orgdev9-byte/TemploTuca.

- `main`: produção, somente versões aprovadas.
- `hml`: homologação; a branch existe, mas a prévia online separada ainda precisa ser publicada.
- `prototipos/portal-conteudo-navegacao`: histórico do desenvolvimento inicial, preservado.

Produção atual: https://templotuca.pages.dev/. O Netlify permanece preservado. A configuração estática usa `npm test && npm run build`, saída `dist` e `NODE_VERSION=22`.

As publicações automáticas da Cloudflare foram desligadas pelo usuário. Não executar push, merge ou deploy sem autorização. Priorizar testes locais e publicar somente versões aprovadas.

Uma versão presente no GitHub só deve ser declarada publicada depois da confirmação do deploy e da conferência do endereço público.

## Contato e indexação

O formulário tem nome, e-mail e mensagem, mas o envio continua desativado por decisão do usuário. A implementação anterior depende de Netlify Forms e precisa ser adaptada antes de ser ativada na Cloudflare. O contato direto por e-mail continua disponível.

O portal mantém `noindex,nofollow` enquanto está em preparação. A indexação de produção será revisada antes do lançamento definitivo.

## Acessibilidade e validação

Navegação responsiva, submenus com botões, suporte a teclado, Escape, foco de navegação, link para pular conteúdo, nomes acessíveis e textos alternativos. Executar os testes existentes e conferir visualmente no computador e no celular após alterações de apresentação.
