document.addEventListener('DOMContentLoaded', function () {
  const nav = document.querySelector('nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = Array.from(document.querySelectorAll('.nav-links > li > a'));
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  const dropdowns = Array.from(document.querySelectorAll('.nav-dropdown'));
  const dropdownTriggers = Array.from(document.querySelectorAll('.nav-dropdown-trigger'));
  const observedSectionIds = [
    'topo',
    'quem-somos',
    'videos',
    'social-media',
    'jingles',
    'restauracao-foto',
    'fita-vhs',
    'fita-vhsc',
    'mini-dv',
    'vinil',
    'dvd',
    'fita-cassete',
    'monoculo',
    'cinegrafistas',
    'fotografos',
    'produtoras',
    'revelacao',
    'oficinas'
  ];
  const sections = observedSectionIds
    .map(function (sectionId) { return document.getElementById(sectionId); })
    .filter(Boolean);
  const whatsappNumber = '5544998375967';
  const serviceSectionIds = new Set([
    'videos',
    'social-media',
    'jingles',
    'restauracao-foto'
  ]);
  const mediaSectionIds = new Set([
    'fita-vhs',
    'fita-vhsc',
    'mini-dv',
    'vinil',
    'dvd',
    'fita-cassete',
    'monoculo'
  ]);
  const partnerSectionIds = new Set([
    'cinegrafistas',
    'fotografos',
    'produtoras',
    'loja',
    'oficinas'
  ]);
  const servicesLink = navLinks.find(function (link) {
    return link.getAttribute('href') === '#videos';
  });
  const midiasLink = navLinks.find(function (link) {
    return link.getAttribute('href') === '#fita-vhs';
  });
  const whoWeAreLink = navLinks.find(function (link) {
    return link.getAttribute('href') === '#quem-somos';
  });
  const partnersLink = navLinks.find(function (link) {
    return link.getAttribute('href') === '#parceiros';
  });

  function setNavState() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
    // When the page is near the top, force the Início link to be active.
    // The #topo element is a zero-height anchor, so the IntersectionObserver
    // cannot reliably detect it; handle this case explicitly here.
    if (window.scrollY <= 24) {
      navLinks.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#topo');
      });
    }
  }

  // Bloqueia cliques/foco nos links do menu rebatível somente em viewport mobile,
  // evitando que botoes internos sejam clicaveis com o menu colapsado.
  function lockMenuLinks(lock) {
    const isMobile = window.matchMedia('(max-width: 1180px)').matches;
    // Atinge TODOS os links do menu (top-level e subitens de dropdowns).
    const links = nav.querySelectorAll('.nav-links a');
    links.forEach(function (link) {
      if (lock && isMobile) {
        link.setAttribute('inert', '');
        link.setAttribute('tabindex', '-1');
        link.setAttribute('aria-hidden', 'true');
      } else {
        link.removeAttribute('inert');
        link.removeAttribute('tabindex');
        link.removeAttribute('aria-hidden');
      }
    });
  }

  function setMobileMenu(open) {
    nav.classList.toggle('is-menu-open', open);
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
    // Quando o menu esta aberto: libera TODOS os links (incluindo submenus).
    // Quando esta fechado: bloqueia em viewport mobile para que nada seja clicavel.
    lockMenuLinks(!open);
  }

  // Garante estado inicial correto no carregamento.
  setMobileMenu(nav.classList.contains('is-menu-open'));

  function openDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.classList.add('is-open');
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(dropdown) {
    if (!dropdown) return;
    dropdown.classList.remove('is-open');
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  // ===================================================================
  // Scroll do menu: posiciona cada section no MESMO ponto vertical
  // (alinhado ao topo, logo abaixo do navbar fixo, com o mesmo respiro
  // extra usado pela primeira section do site). Esse respiro é
  // STABLE_TOP_PX e é aplicado uniformemente para TODAS as sections
  // (principais, mídias, parceiros, monóculo etc.), em TODAS as
  // resoluções — incluindo mobile e as faixas intermediárias 1300-1430
  // e 1431-1500. Antes existiam exceções por seção/classe/breakpoint
  // que faziam o título de cada section começar em pontos diferentes
  // (algumas rentes ao topo, outras no centro da tela). Agora todos os
  // títulos alinham no mesmo Y, independente da largura da viewport.
  //
  // Exceções simétricas (mantidas para preservar a calibragem visual
  // que existia antes):
  //   - Jingles: sobe 1 "scroll" extra (STABLE_TOP_PX), aproximando o
  //     título do topo/header.
  //   - Monóculo: desce 1 "scroll" extra (STABLE_TOP_PX), aproximando o
  //     título do rodapé.
  //   - Parceiros (cinegrafistas, fotógrafos, produtoras, loja, oficinas):
  //     sobem 1 "scroll" extra (STABLE_TOP_PX), aproximando o título
  //     do topo/header.
  // ===================================================================
  const STABLE_TOP_PX = 90;

  function scrollToTarget(target) {
    const navHeight = nav.offsetHeight;
    const sectionTop = target.getBoundingClientRect().top + window.pageYOffset;

    // Mesmo cálculo para todas as sections, em qualquer resolução:
    // sectionTop - navHeight coloca o topo da section rente ao navbar;
    // + STABLE_TOP_PX adiciona o respiro padronizado que mantém o título
    // sempre na mesma linha vertical em todas as seções do site.
    let scrollTarget = sectionTop - navHeight + STABLE_TOP_PX;

    // Jingles: empurra 1 scroll extra para cima (título mais perto do
    // header/navbar), oposto ao Monóculo.
    if (target.id === 'jingles') {
      scrollTarget -= STABLE_TOP_PX;
    }

    // Monóculo: empurra 1 scroll extra para baixo (título mais perto do
    // rodapé), equivalente a ~uma linha de scroll.
    if (target.id === 'monoculo') {
      scrollTarget += STABLE_TOP_PX;
    }

    // Parceiros: empurra 1 scroll extra para cima (título mais perto
    // do header/navbar).
    if (typeof partnerSectionIds !== 'undefined' && partnerSectionIds.has(target.id)) {
      scrollTarget -= STABLE_TOP_PX;
    }

    window.scrollTo({ top: Math.max(scrollTarget, 0), behavior: 'smooth' });
  }

  anchorLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      const href = link.getAttribute('href');
      const target = href.length > 1 ? document.querySelector(href) : null;

      if (target) {
        event.preventDefault();
        scrollToTarget(target);
      }

      const dropdown = link.closest('.nav-dropdown');
      if (dropdown && !link.classList.contains('nav-dropdown-trigger')) {
        closeDropdown(dropdown);
      }

      if (link.closest('.nav-links')) {
        setMobileMenu(false);
      }
    });
  });

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      setMobileMenu(!nav.classList.contains('is-menu-open'));
    });
  }

  window.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMobileMenu(false);
      dropdowns.forEach(closeDropdown);
    }
  });

  window.addEventListener('resize', function () {
    if (window.matchMedia('(min-width: 1181px)').matches) {
      setMobileMenu(false);
    } else {
      // Em viewport mobile, garante que links travados sigam o estado do menu.
      lockMenuLinks(!nav.classList.contains('is-menu-open'));
    }
  });

  dropdownTriggers.forEach(function (trigger) {
    const dropdown = trigger.closest('.nav-dropdown');
    if (!dropdown) return;

    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', function (event) {
      // First click: open submenu and prevent jumping to anchor.
      // Second click (or click on already-open item): follow the link normally.
      const isOpen = dropdown.classList.contains('is-open');
      if (!isOpen) {
        event.preventDefault();
        // Close any sibling open dropdowns so only one opens at a time.
        dropdowns.forEach(function (other) {
          if (other !== dropdown) closeDropdown(other);
        });
        openDropdown(dropdown);
      }
    });
  });

  // Close any open dropdown when clicking outside the navbar.
  document.addEventListener('click', function (event) {
    if (!nav.contains(event.target)) {
      dropdowns.forEach(closeDropdown);
    }
  });

  const revealItems = document.querySelectorAll('.section-text, footer .footer-column, footer .footer-brand');
  revealItems.forEach(function (item) { item.classList.add('reveal'); });

  const imageItems = document.querySelectorAll('img');
  imageItems.forEach(function (image) {
    if (!image.hasAttribute('loading')) image.loading = 'lazy';
    if (!image.hasAttribute('decoding')) image.decoding = 'async';
    image.classList.add('lazy-reveal');
  });

  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealItems.forEach(function (item) { revealObserver.observe(item); });

  const imageObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      imageObserver.unobserve(entry.target);
    });
  }, { rootMargin: '160px 0px', threshold: 0.08 });

  imageItems.forEach(function (image) {
    imageObserver.observe(image);
  });

  function setActiveNav(sectionId) {
    let activeLink = navLinks.find(function (link) {
      return link.getAttribute('href') === '#' + sectionId;
    });

    if (!activeLink && serviceSectionIds.has(sectionId)) {
      activeLink = servicesLink;
    }

    if (!activeLink && mediaSectionIds.has(sectionId)) {
      activeLink = midiasLink;
    }

    if (!activeLink && sectionId === 'quem-somos') {
      activeLink = whoWeAreLink;
    }

    if (!activeLink && partnerSectionIds.has(sectionId)) {
      activeLink = partnersLink;
    }

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link === activeLink);
    });
  }

  const activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      setActiveNav(entry.target.id);
    });
  }, { rootMargin: '-35% 0px -52% 0px', threshold: 0 });

  sections.forEach(function (section) { activeObserver.observe(section); });

  window.addEventListener('scroll', setNavState, { passive: true });
  setNavState();

  // Carrossel automatico do hero: alterna a classe .is-active a cada 5s.
  // Pausa quando a aba esta oculta para economizar recursos.
  // Tambem sincroniza a camada de fundo desfocado (.hero-bg-blur) com o
  // slide ativo: o src do slide vira o background-image de uma das duas
  // camadas .hero-bg-blur (a que esta oculta), e em seguida a classe
  // .is-active e transferida para essa camada. Como a transicao de
  // opacidade e a mesma (1.6s ease) usada pelos <img> do slide, o
  // "letterbox" desfocado da imagem atual faz o mesmo cross-fade que
  // o slide principal — sem corte, sem borda preta, em sincronia.
  const heroSlides = Array.from(document.querySelectorAll('.cover-hero .hero-slide'));
  const heroBgLayers = Array.from(document.querySelectorAll('.cover-hero .hero-bg-blur'));
  const heroContainer = document.querySelector('.cover-hero .hero-carousel');

  // Calcula a altura que a imagem realmente ocupa dentro do container
  // (mesma matemática do object-fit: contain), para que a blur nunca
  // "sobre" embaixo da imagem — apenas nas laterais quando necessário.
  function getRenderedImageHeight(img, containerWidth, containerHeight) {
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    if (!naturalWidth || !naturalHeight || !containerWidth || !containerHeight) {
      return containerHeight;
    }
    const containerAspect = containerWidth / containerHeight;
    const imageAspect = naturalWidth / naturalHeight;
    if (imageAspect > containerAspect) {
      // Imagem mais "larga" que o container: a largura e o fator
      // limitante do contain, sobra espaco vertical embaixo (pois a
      // imagem fica colada no topo). A blur deve parar exatamente aqui.
      return Math.round(containerWidth / imageAspect);
    }
    // Imagem mais "alta"/estreita que o container: a altura e o fator
    // limitante, a imagem preenche 100% da altura (sobra so lateral).
    return containerHeight;
  }

  function syncHeroBlurHeight(layer, img) {
    if (!layer || !img || !heroContainer) return;
    const containerWidth = heroContainer.clientWidth;
    const containerHeight = heroContainer.clientHeight;

    function applyHeight() {
      const height = getRenderedImageHeight(img, containerWidth, containerHeight);
      layer.style.height = height + 'px';
    }

    if (img.complete && img.naturalWidth) {
      applyHeight();
    } else {
      layer.style.height = containerHeight + 'px';
      img.addEventListener('load', applyHeight, { once: true });
    }
  }
  if (heroSlides.length > 1 && heroBgLayers.length > 0) {
    let heroIndex = heroSlides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (heroIndex < 0) {
      heroIndex = 0;
      heroSlides[0].classList.add('is-active');
    }

    // Slot atual = indice da camada que esta visivel neste momento.
    let heroBgSlot = 0;
    function setHeroBgOnLayer(layer, slide) {
      const src = slide.getAttribute('src');
      if (!src) return;
      syncHeroBlurHeight(layer, slide);
      layer.style.setProperty('--hero-bg', 'url("' + src + '")');
      // Alinha a posicao do blur com a do slide (mesmo object-position
      // lido do inline style --hero-position), para que imagem e blur
      // fiquem centrados na mesma linha. Sem isso, o blur ficaria
      // sempre alinhado ao topo enquanto a imagem pode estar em
      // "center 35%" por exemplo.
      const heroPos = slide.style.getPropertyValue('--hero-position');
      if (heroPos) {
        layer.style.setProperty('--hero-blur-position', heroPos);
        // A origem do scale tambem segue o alinhamento vertical do slide,
        // para que o scale(1.18) estoure igualmente nas laterais e
        // mantenha a simetria do "letterbox" lateral.
        const y = heroPos.split(' ')[1] || heroPos;
        layer.style.setProperty('--hero-blur-origin', 'center ' + y);
      } else {
        layer.style.setProperty('--hero-blur-position', 'center top');
        layer.style.setProperty('--hero-blur-origin', 'center top');
      }
    }
    // Estado inicial: slot 0 mostra o slide inicial, slot 1 fica em espera.
    setHeroBgOnLayer(heroBgLayers[0], heroSlides[heroIndex]);
    heroBgLayers[0].classList.add('is-active');

    let heroTimer = null;
    function advanceHero() {
      heroSlides[heroIndex].classList.remove('is-active');
      heroIndex = (heroIndex + 1) % heroSlides.length;
      heroSlides[heroIndex].classList.add('is-active');

      // Proxima camada a ser exibida = oposta da atual.
      const nextSlot = 1 - heroBgSlot;
      const prevSlot = heroBgSlot;
      // Define a nova imagem NA camada que vai entrar (ela esta com
      // opacidade 0, entao a troca de background-image nao e visivel
      // ate o cross-fade comecar).
      setHeroBgOnLayer(heroBgLayers[nextSlot], heroSlides[heroIndex]);
      // Inicia o cross-fade: a camada nova entra (is-active), a antiga sai.
      heroBgLayers[nextSlot].classList.add('is-active');
      heroBgLayers[prevSlot].classList.remove('is-active');
      heroBgSlot = nextSlot;
    }
    function startHero() {
      if (heroTimer !== null) return;
      heroTimer = window.setInterval(advanceHero, 5000);
    }
    function stopHero() {
      if (heroTimer === null) return;
      window.clearInterval(heroTimer);
      heroTimer = null;
    }
    startHero();
    window.addEventListener('resize', function () {
      syncHeroBlurHeight(heroBgLayers[heroBgSlot], heroSlides[heroIndex]);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopHero();
      } else {
        advanceHero();
        startHero();
      }
    });
  }
});