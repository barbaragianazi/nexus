# Nexus — Landing Page

Landing page estática (HTML5 + CSS3 + JavaScript vanilla), implementada a partir do Figma.

## Estrutura

- `index.html` — marcação semântica; sprite SVG de ícones lineares no início do `<body>`
- `css/style.css` — 1 Tokens (primitives, semantics DS, papéis `--t-*` por tema) · 2 Base · 3 Componentes · 4 Seções · 5 Responsivo
- `js/script.js` — menu mobile, alternância de tema (View Transitions), seção atual (menu + régua lateral) e validação do formulário
- `js/animations.js` — animações GSAP + ScrollTrigger (CDN, versão fixada 3.12.5 com SRI no `index.html`)
- `assets/img`, `assets/icons` — assets originais do Figma (não redesenhar)
- `docs/design.md` — Design System Nexus (**não editar automaticamente**; propor mudanças e pedir aprovação)

## Convenções

- Stack fixa: sem frameworks, Tailwind, Bootstrap, jQuery ou bibliotecas de UI.
- **Temas:** claro (padrão) e escuro, via `<html data-theme>`; preferência em `localStorage` (`nexus-theme`). Componentes consomem papéis `--t-*`, nunca cores fixas; novos valores entram nos **dois** blocos de tema.
- Tokens: nomes do DS em CSS (`color/blue/500` → `--color-blue-500`). Preferir semantics; primitives só sem semantic adequado. Valores fora do DS ficam em `--lp-*` e documentados. Espaçamento vertical das seções: `--lp-section-pt`/`--lp-section-pb`/`--lp-section-pb-tight`; quanto da faixa azul aparece na primeira dobra do desktop: `--lp-hero-peek`.
- **Tipografia:** fonte única, **Nunito Sans**. Títulos em 800 com tracking tight. Escala mobile (<768px): título 24/32 · título de card e da faixa 18/24 · corpo, subtítulos e texto de card 16/24 · apoio 14/20; exceção: botões do hero em 14px. Divergências do Figma em `docs/decisoes.md`.
- Texto azul sobre fundo claro usa `blue/600` (AA); botão primário único (`.btn--primary`) em header, hero e formulário.
- **Ícones:** lineares (Lucide, ISC) pelo sprite `<symbol id="i-…">` + `<svg class="icon"><use href="#i-…"/></svg>`, herdando `currentColor`. Máscara CSS com `url()` não funciona em `file://`. Ícones do Figma ficam como `<img>`.
- **Animações:** corporativas e discretas — só `opacity`/`transform`, deslocamento 12–20px, `power2.out`, stagger 0,08–0,12s. Dois momentos de destaque (entrada do hero e conexões das Funcionalidades); pulsos de luz contínuos (cometa de 3 camadas via `strokeDashoffset`, pausam fora da tela) correm pelos cabos do diagrama da Proposta (`.diagram__flow`, cards → hub e hub → resultados) e pelas pernas do X das Funcionalidades (`.func__flow`, do X para os cards; direita em cinza, `--t-flow-gray`); o resto é reveal simples que **reinicia ao rolar de volta para cima e roda de novo ao descer** (`toggleActions: 'play none none reset'`; em `ScrollTrigger.batch`, `onLeaveBack` esconde de novo). O hero anima ao carregar e de novo ao voltar ao topo (`onLeave` esconde, `onEnterBack` reproduz). Há um parallax de rolagem no painel do hero (≥1280px) via `translate`/`--par`. Elementos a animar levam `data-anim="…"` no HTML (`hero`, `hero-visual`, `hero-features`, `header`, `group`, `diagram`, `func`, `contact`); o estado inicial oculto fica no CSS sob `html.motion` e a classe `motion` só existe com JS e **sem** `prefers-reduced-motion`. Sem GSAP, o conteúdo continua visível. Novos elementos animados: seguir esse padrão; não animar `y` em elementos que já têm `transform` no CSS (animar o wrapper ou só a opacidade).
- **Mobile (<768px), ver Revisão 7 em `docs/decisoes.md`:** reveals e hero rodam **uma vez** (sem reset); faixa de públicos e Jornada são carrosséis com scroll snap; Proposta usa listas em tópicos, sem cards; botão de tema fica dentro do menu; selo e destaques do hero saem; o dashboard fica entre o texto e os botões (82% da largura), com os dois botões lado a lado. Novos blocos no mobile devem justificar a altura que ocupam.
- **Seção atual:** `aria-current="true"` no menu do topo e na régua lateral (`.section-rail`, visível ≥1440px), definido por `IntersectionObserver` em `main section[id]`. Nova seção navegável = `id` na `<section>` + item no menu/régua.
- **Navegação de retorno:** o logo do header aponta para `#inicio` (não para o próprio header sticky, que já está visível e não rola nada); `.back-to-top` aparece depois de ~60% da altura da janela, é ativado por `is-armed` (sem JS fica visível) e sobe com `--lift` para não cobrir o rodapé.
- Prioridade de conflitos: requisitos explícitos > Figma (composição/conteúdo) > `docs/design.md`. Divergências de valor são registradas, não "corrigidas" em silêncio.
- Desktop ≥1280px reproduz o Figma (posições absolutas nos diagramas de proposta e funcionalidades); o hero acompanha a altura da janela (`--hero-h` = `100svh` − `--lp-hero-peek`, entre 680 e 1080px) para deixar a faixa azul à mostra; a folga dos destaques (`--hero-features-bottom`) e o limite do painel são derivados disso. Breakpoints: `<1280`, `<1024`, `<768`. Dashboard do hero: no tema claro usa `--t-dashboard-filter`/`--t-dashboard-veil`.
- Acessibilidade: WCAG 2.2 AA, foco visível, `prefers-reduced-motion`, ícones decorativos com `aria-hidden`/`alt=""`.
- Conteúdo em pt-BR; textos marcados como "aguardam aprovação" em `docs/decisoes.md` não são definitivos.

## Fluxo para alterações

1. Analisar a implementação atual e identificar a seção/componente afetado.
2. Alterar só o necessário, preservando o que já foi aprovado; sem refatorações paralelas.
3. Conferir regressões nos três breakpoints **e nos dois temas**.
4. Atualizar este arquivo se uma convenção permanente mudar.

## Git

Não executar operações que alterem o repositório (init, add, commit, push, reset, revert, checkout, switch, merge, rebase, clean) sem autorização explícita. Inspeção somente leitura é permitida.
