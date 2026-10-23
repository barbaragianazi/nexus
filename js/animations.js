'use strict';

/* ==========================================================================
   Nexus — Animações (GSAP + ScrollTrigger, via CDN)

   Princípios: corporativo, discreto e funcional.
   - Só opacity e transform (nada que dispare layout); deslocamento de 12–20px; power2.out.
   - Dois momentos de destaque: entrada do hero e conexões das Funcionalidades.
   - Reveals por seção rodam de novo: ao rolar de volta para cima o bloco reinicia e anima outra vez ao descer.
   - O estado inicial oculto vem do CSS (html.motion [data-anim…]). A classe "motion" só existe
     com JS e sem prefers-reduced-motion; se o GSAP falhar, ela é removida e tudo fica visível.
   - Ao terminar, o transform inline é limpo para não conflitar com transforms do CSS.
   ========================================================================== */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('motion')) return; // movimento reduzido ou sem JS: nada a fazer

  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('motion');
    return;
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Se o usuário ativar "reduzir movimento" com a página aberta: encerra tudo e mostra o conteúdo
  const stopAll = () => {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    gsap.globalTimeline.clear();
    root.classList.remove('motion');
    gsap.set('[data-anim], [data-anim] *', { clearProps: 'opacity,transform,strokeDasharray,strokeDashoffset' });
    root.style.removeProperty('--rail');
    document.querySelectorAll('.hero__dashboard').forEach((el) => el.style.removeProperty('--par'));
    document.querySelectorAll('.journey').forEach((el) => el.style.removeProperty('--rail'));
  };
  reduceMotion.addEventListener('change', (event) => { if (event.matches) stopAll(); });

  try {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power2.out' });

    const q = (selector, scope = document) => gsap.utils.toArray(selector, scope);

    /* ---- Hero: entrada em sequência ao carregar e de novo ao voltar ao topo ---- */
    const heroItems = q('[data-anim="hero"]');
    const heroVisual = q('[data-anim="hero-visual"]');
    const heroFeatures = q('[data-anim="hero-features"] > *');
    let heroTimeline;

    const playHero = () => {
      const dy = window.innerWidth >= 1280 ? 20 : 14;
      if (heroTimeline) heroTimeline.kill();

      heroTimeline = gsap.timeline({ defaults: { clearProps: 'transform' } })
        .fromTo(heroItems, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 })
        .fromTo(heroVisual, { opacity: 0, y: dy + 4 }, { opacity: 1, y: 0, duration: 0.9 }, 0.35)
        .fromTo(heroFeatures, { opacity: 0, y: dy * 0.6 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.9);
    };

    const hideHero = () => {
      if (heroTimeline) heroTimeline.kill();
      gsap.set([heroItems, heroVisual, heroFeatures], { opacity: 0 });
    };

    // Replay por estado, não por evento: a cada rolagem compara a posição com o limite do hero.
    // Quando ele sai quase todo da janela volta ao estado inicial; ao voltar, entra de novo.
    // Como só olha a posição atual, um evento perdido (salto de rolagem, refresh) se corrige no próximo.
    const hero = document.querySelector('.hero');
    let heroShown = false;
    let heroReady = false;
    const heroOut = () => window.scrollY > hero.offsetHeight - window.innerHeight * 0.3 - 1;

    const syncHero = () => {
      if (!heroReady) return;
      if (heroOut()) {
        // no mobile (< 768px) o hero não reinicia ao sair da tela
        if (heroShown && window.innerWidth >= 768) { hideHero(); heroShown = false; }
      } else if (!heroShown) {
        playHero();
        heroShown = true;
      }
    };
    window.addEventListener('scroll', syncHero, { passive: true });
    window.addEventListener('pageshow', syncHero);
    window.addEventListener('resize', syncHero);

    // Espera as fontes (no máximo 500 ms) para o texto não "pular" durante a entrada
    const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise((resolve) => setTimeout(resolve, 500))]).then(() => {
      heroReady = true;
      syncHero(); // carregou no topo: entrada; carregou já rolado (ex.: F5 no meio da página): espera o retorno
      ScrollTrigger.refresh();
    });

    /* ---- Reveals por seção (variam por breakpoint) ---- */
    const mm = gsap.matchMedia();

    mm.add({ desktop: '(min-width: 1280px)', compact: '(max-width: 1279px)', mobile: '(max-width: 767px)' }, (context) => {
      const { desktop, mobile } = context.conditions;
      const dy = desktop ? 16 : 12;
      const start = desktop ? 'top 85%' : 'top 92%';

      // Replay: ao rolar de volta para cima (a seção sai pela base da janela) o bloco volta ao estado
      // inicial; ao descer de novo, a animação roda outra vez.
      // No mobile (< 768px) os reveals rodam uma única vez: com a página em coluna, repetir a cada vai-e-volta incomoda.
      const REPLAY = mobile ? 'play none none none' : 'play none none reset';

      // Hero (desktop): o painel sobe mais devagar que a página — profundidade sutil, atrelada à rolagem
      if (desktop) {
        gsap.fromTo('.hero__dashboard', { '--par': '0px' }, {
          '--par': '64px', ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
      }
      const hideAgain = (offset) => (mobile ? undefined : (batch) => gsap.set(batch, { opacity: 0, y: offset, overwrite: true }));

      // Cabeçalhos de seção: eyebrow, título e lead
      q('[data-anim="header"]').forEach((header) => {
        gsap.fromTo(
          header.children,
          { opacity: 0, y: dy },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.1, clearProps: 'transform',
            scrollTrigger: { trigger: header, start, toggleActions: REPLAY },
          }
        );
      });

      // Grupos de cards: entram juntos por linha, com stagger curto
      ScrollTrigger.batch(q('[data-anim="group"] > *'), {
        start: desktop ? 'top 90%' : 'top 94%',
        onLeaveBack: hideAgain(dy + 4),
        onEnter: (batch) => gsap.fromTo(
          batch,
          { opacity: 0, y: dy + 4 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, clearProps: 'transform', overwrite: true }
        ),
      });

      // Trilho da jornada: desenha-se da esquerda para a direita (progressão das etapas)
      q('.journey').forEach((journey) => {
        gsap.to(journey, {
          '--rail': 1, duration: 1.1, ease: 'power2.inOut',
          scrollTrigger: { trigger: journey, start: 'top 80%', toggleActions: REPLAY },
        });
      });

      // Proposta: hub primeiro, depois as colunas laterais e os conectores
      q('[data-anim="diagram"]').forEach((diagram) => {
        const hub = q('.hub', diagram);
        const columns = q('.diagram__col', diagram);
        const connectors = q('.diagram__connector', diagram);
        gsap.timeline({
          defaults: { clearProps: 'transform' },
          scrollTrigger: { trigger: diagram, start: desktop ? 'top 78%' : 'top 88%', toggleActions: REPLAY },
        })
          .fromTo(hub, { opacity: 0, y: dy + 4 }, { opacity: 1, y: 0, duration: 0.7 })
          .fromTo(columns, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12 }, 0.25)
          .fromTo(connectors, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.12 }, 0.5);

        // Fluxo contínuo: "energia" correndo pelos cabos (esquerda → Nexus, Nexus → direita).
        // Cada curva ganha 3 camadas com a mesma cabeça e caudas de tamanhos diferentes (cometa com rastro
        // que se dissipa). Só strokeDashoffset; pausa quando o diagrama sai da tela.
        const TRAIL = [{ len: 0.36, width: 5, opacity: 0.16 }, { len: 0.22, width: 3, opacity: 0.45 }, { len: 0.1, width: 2, opacity: 1 }];
        const pulses = [];
        q('.diagram__flow', diagram).forEach((flow, side) => {
          q('path', flow).forEach((base, i) => {
            const layers = TRAIL.map((layer, n) => {
              const path = n === 0 ? base : base.cloneNode();
              if (n > 0) base.parentNode.appendChild(path);
              path.style.strokeWidth = layer.width;
              path.style.strokeOpacity = layer.opacity;
              path.style.strokeDasharray = `${layer.len} 2`;
              return { path, len: layer.len };
            });
            const head = { p: 0 };
            const place = () => layers.forEach(({ path, len }) => { path.style.strokeDashoffset = len - head.p; });
            place();
            pulses.push(gsap.to(head, {
              p: 1 + TRAIL[0].len, duration: 2.2, ease: 'sine.inOut', onUpdate: place,
              repeat: -1, repeatDelay: 0.8, delay: side * 1.1 + i * 0.5, paused: true,
            }));
          });
        });
        ScrollTrigger.create({
          trigger: diagram, start: 'top bottom', end: 'bottom top',
          onToggle: (self) => pulses.forEach((pulse) => (self.isActive ? pulse.play() : pulse.pause())),
        });
      });

      // Contato: card em duas colunas
      q('[data-anim="contact"]').forEach((contact) => {
        gsap.fromTo(
          contact.children,
          { opacity: 0, y: dy + 4 },
          {
            opacity: 1, y: 0, duration: 0.7, stagger: 0.12, clearProps: 'transform',
            scrollTrigger: { trigger: contact, start: desktop ? 'top 80%' : 'top 90%', toggleActions: REPLAY },
          }
        );
      });

      // Funcionalidades
      q('[data-anim="func"]').forEach((func) => {
        const cards = q('.func-card', func);

        if (!desktop) {
          // Sem conectores no tablet/mobile: só os cards, em grupo
          ScrollTrigger.batch(cards, {
            start: 'top 94%',
            onLeaveBack: hideAgain(dy + 4),
            onEnter: (batch) => gsap.fromTo(
              batch,
              { opacity: 0, y: dy + 4 },
              { opacity: 1, y: 0, duration: 0.6, stagger: 0.09, clearProps: 'transform', overwrite: true }
            ),
          });
          return;
        }

        // Momento de destaque: as pernas do X se prolongam até os cards (revelação por clip-path)
        const lines = q('.func__lines', func);
        const reveals = q('.func__reveal', func);
        const marks = q('.func__mark', func);
        const dots = q('.func__dot', func);

        // [x inicial (na ponta da perna), x final, largura final] por perna, na ordem do HTML
        const spans = [[556, 370, 190], [538, 370, 170], [640, 640, 190], [615, 615, 215]];
        reveals.forEach((rect, i) => gsap.set(rect, { attr: { x: spans[i][0], width: 0 } }));
        gsap.set(lines, { opacity: 1 });

        const tl = gsap.timeline({
          defaults: { clearProps: 'transform' },
          scrollTrigger: { trigger: func, start: 'top 72%', toggleActions: REPLAY },
        })
          .fromTo(cards, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 })
          .fromTo(marks, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.7 }, 0.3);

        reveals.forEach((rect, i) => {
          tl.to(rect, {
            attr: { x: spans[i][1], width: spans[i][2] },
            duration: 1.1, ease: 'power2.inOut',
          }, 0.7 + i * 0.12);
        });

        // Os pontos nos cards aparecem quando as pernas chegam
        tl.fromTo(dots, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08 }, 1.6);

        // Fluxo: pulsos brotam do X e correm pelo meio de cada perna até o card. Mesmo cometa de 3 camadas do
        // diagrama da Proposta, mais longo e mais largo (as pernas têm ~220px). O grupo só aparece quando as
        // pernas terminam de se revelar (faz parte da linha do tempo, então reinicia junto) e pausa fora da tela.
        const flows = q('.func__flow', func);
        if (flows.length) {
          const TRAIL = [{ len: 0.4, width: 11, opacity: 0.14 }, { len: 0.24, width: 7, opacity: 0.4 }, { len: 0.1, width: 4, opacity: 1 }];
          const pulses = q('.func__flow path', func).map((base, i) => {
            const layers = TRAIL.map((layer, n) => {
              const path = n === 0 ? base : base.cloneNode();
              if (n > 0) base.parentNode.appendChild(path);
              path.style.strokeWidth = layer.width;
              path.style.strokeOpacity = layer.opacity;
              path.style.strokeDasharray = `${layer.len} 2`;
              return { path, len: layer.len };
            });
            const head = { p: 0 };
            const place = () => layers.forEach(({ path, len }) => { path.style.strokeDashoffset = len - head.p; });
            place();
            return gsap.to(head, {
              p: 1 + TRAIL[0].len, duration: 2.4, ease: 'sine.inOut', onUpdate: place,
              repeat: -1, repeatDelay: 1.2, delay: i * 0.4, paused: true,
            });
          });
          tl.fromTo(flows, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.4);
          ScrollTrigger.create({
            trigger: func, start: 'top bottom', end: 'bottom top',
            onToggle: (self) => pulses.forEach((pulse) => (self.isActive ? pulse.play() : pulse.pause())),
          });
        }
      });
    });

    // Fontes e imagens mudam alturas: recalcula as posições dos gatilhos
    window.addEventListener('load', () => ScrollTrigger.refresh());
  } catch (error) {
    // Qualquer falha: mostra o conteúdo sem animação
    root.classList.remove('motion');
    console.error('Animações desativadas:', error);
  }
})();
