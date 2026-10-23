'use strict';

/* ==========================================================================
   Nexus — Landing page
   1. Menu de navegação mobile
   2. Formulário "Solicite uma demonstração" (validação + feedback)
   ========================================================================== */

/* ---- 1. Menu mobile ---- */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const panel = document.getElementById('menu-principal');
  if (!toggle || !panel) return;

  const label = toggle.querySelector('.visually-hidden');
  const mq = window.matchMedia('(max-width: 1023px)');

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    if (label) label.textContent = open ? 'Fechar menu' : 'Abrir menu';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Fecha ao navegar por um link do menu
  panel.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });

  // Fecha com Esc devolvendo o foco ao botão
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Ao voltar para o layout desktop o menu volta ao estado padrão
  mq.addEventListener('change', (event) => {
    if (!event.matches) setOpen(false);
  });
})();

/* ---- 1b. Alternância de tema (claro/escuro) ----
   O tema inicial é aplicado por um script inline no <head>; aqui só tratamos o clique. */
(() => {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;

  const root = document.documentElement;
  const isDark = () => root.dataset.theme === 'dark';

  const toggleLabel = toggle.querySelector('.theme-toggle__label');

  const sync = () => {
    const text = isDark() ? 'Ativar tema claro' : 'Ativar tema escuro';
    toggle.setAttribute('aria-pressed', String(isDark()));
    toggle.setAttribute('aria-label', text);
    if (toggleLabel) toggleLabel.textContent = text;
  };

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  toggle.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    const apply = () => {
      root.dataset.theme = next;
      try { localStorage.setItem('nexus-theme', next); } catch (e) { /* storage indisponível: vale só nesta visita */ }
      sync();
    };
    // View Transitions API: crossfade na troca de tema (onde houver suporte e sem movimento reduzido)
    if (document.startViewTransition && !reduceMotion.matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  });

  sync();
})();

/* ---- 1b2. Mobile (< 768px): botão de tema dentro do menu ----
   É o mesmo elemento (o listener de clique vem junto); no tablet/desktop volta para o header. */
(() => {
  const toggle = document.querySelector('.theme-toggle');
  const panel = document.getElementById('menu-principal');
  const navToggle = document.querySelector('.nav-toggle');
  if (!toggle || !panel || !navToggle) return;

  const mq = window.matchMedia('(max-width: 767px)');
  const place = () => {
    if (mq.matches) panel.insertBefore(toggle, panel.querySelector('.btn'));
    else navToggle.before(toggle);
  };
  mq.addEventListener('change', place);
  place();
})();

/* ---- 1b3. Mobile (< 768px): carrosséis com scroll snap acessíveis por teclado ----
   Uma área rolável precisa receber foco para ser operada com as setas. */
(() => {
  const carousels = [
    [document.querySelector('.strip__list'), 'Públicos atendidos pelo Nexus'],
    [document.querySelector('.journey'), 'Etapas da jornada da campanha'],
  ].filter(([el]) => el);
  const mq = window.matchMedia('(max-width: 767px)');

  const sync = () => {
    carousels.forEach(([el, name]) => {
      if (mq.matches) {
        el.setAttribute('tabindex', '0');
        el.setAttribute('aria-label', name);
      } else {
        ['tabindex', 'aria-label'].forEach((attr) => el.removeAttribute(attr));
      }
    });
  };
  mq.addEventListener('change', sync);
  sync();
})();

/* ---- 1c. Seção atual: indicador no menu + régua lateral ---- */
(() => {
  const sections = [...document.querySelectorAll('main section[id]')];
  const links = [...document.querySelectorAll('.site-header .site-nav__link[href^="#"], .section-rail__link')];
  const rail = document.querySelector('.section-rail');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  // A seção ativa é a que cruza a faixa central da janela
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setActive(entry.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((section) => observer.observe(section));
  }

  // Progresso de rolagem na régua (só quando ela está visível)
  if (rail) {
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      rail.style.setProperty('--rail-progress', progress.toFixed(3));
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();

/* ---- 1d. Voltar ao topo ----
   Aparece depois de rolar ~1 tela e sobe junto com o rodapé para não cobrir os links dele. */
(() => {
  const button = document.querySelector('.back-to-top');
  const footer = document.querySelector('.site-footer');
  if (!button) return;

  button.classList.add('is-armed');

  let ticking = false;
  const update = () => {
    ticking = false;
    button.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    const overlap = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
    button.style.setProperty('--lift', overlap + 'px');
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---- 2. Formulário ---- */
(() => {
  const form = document.getElementById('form-demonstracao');
  if (!form) return;

  const status = document.getElementById('form-status');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const messages = {
    nome: 'Informe seu nome completo.',
    email: 'Informe um e-mail corporativo válido.',
    empresa: 'Informe o nome da empresa.',
    perfil: 'Selecione seu perfil de atuação.',
    consentimento: 'É necessário concordar para enviar a solicitação.',
  };

  const getError = (control) => {
    const value = control.type === 'checkbox' ? control.checked : control.value.trim();
    if (!value) return messages[control.name];
    if (control.type === 'email' && !emailPattern.test(value)) return messages.email;
    return '';
  };

  const wrapperOf = (control) => control.closest('.field') || control.closest('.consent');

  const showError = (control, message) => {
    const error = document.getElementById(`${control.id}-erro`);
    const wrapper = wrapperOf(control);
    if (!error || !wrapper) return;
    error.textContent = message;
    error.hidden = !message;
    wrapper.classList.toggle('is-invalid', Boolean(message));
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
  };

  const validate = (control) => {
    const message = getError(control);
    showError(control, message);
    return !message;
  };

  const required = [...form.querySelectorAll('[required]')];

  // Revalida o campo assim que o usuário sai dele; limpa o erro ao corrigir
  required.forEach((control) => {
    control.addEventListener('blur', () => { if (control.type !== 'checkbox') validate(control); });
    const revalidate = () => { if (control.getAttribute('aria-invalid') === 'true') validate(control); };
    control.addEventListener('input', revalidate);
    control.addEventListener('change', revalidate);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    status.hidden = true;

    const invalid = required.filter((control) => !validate(control));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    // Não há back-end definido no projeto: o envio é simulado no cliente.
    // Para integrar, substitua este bloco por um fetch() ao endpoint real.
    form.reset();
    status.textContent = 'Solicitação enviada! Nossa equipe entrará em contato em breve.';
    status.hidden = false;
  });
})();
