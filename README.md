# Nexus — Landing Page

Landing page institucional do Nexus, implementada a partir do Figma. Página única, estática, sem etapa de build.

🔗 **Demo:** https://lpnexus.vercel.app/

## Seções

Hero · Cenário · Proposta · Jornada · Funcionalidades · Fale conosco

## Stack

- HTML5 semântico, CSS3 e JavaScript vanilla
- [GSAP](https://gsap.com) 3.12.5 + ScrollTrigger (via CDN, com SRI)
- [Lucide](https://lucide.dev) (ISC) para ícones lineares, em sprite SVG inline
- Fonte Nunito Sans (Google Fonts)
- Sem frameworks, Tailwind, Bootstrap, jQuery ou bibliotecas de UI

## Destaques técnicos

- **Design tokens** do Design System Nexus em CSS custom properties (primitives, semantics e papéis por tema)
- **Temas claro e escuro** via `data-theme`, com preferência salva em `localStorage` e transição com View Transitions
- **Responsivo** nos breakpoints `<1280px`, `<1024px` e `<768px` (carrosséis com scroll snap no mobile)
- **Animações** só com `opacity` e `transform`, respeitando `prefers-reduced-motion`; sem GSAP o conteúdo continua visível
- **Navegação** com indicação da seção atual (`IntersectionObserver`), régua lateral em telas largas e botão de voltar ao topo
- **Formulário** de contato com validação no cliente
- **Acessibilidade** WCAG 2.2 AA: foco visível, semântica, ícones decorativos ocultos para leitores de tela

## Estrutura

```
index.html        marcação semântica e sprite de ícones
css/style.css     tokens, base, componentes, seções e responsivo
js/script.js      menu, tema, seção atual e formulário
js/animations.js  animações GSAP + ScrollTrigger
assets/           imagens e ícones originais do Figma
docs/design.md    Design System Nexus
```

## Como rodar

Não há instalação nem build. Abra o `index.html` no navegador (funciona via `file://`) ou sirva a pasta com qualquer servidor estático.

## Status

Versão 1. Pendente: validação do time envolvido.
