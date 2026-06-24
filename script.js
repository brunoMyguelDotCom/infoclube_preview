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
        'parceiros'
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

      function scrollToTarget(target) {
        const navHeight = nav.offsetHeight;
        const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight + 2;
        window.scrollTo({ top: top, behavior: 'smooth' });
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

        if (!activeLink && sectionId === 'parceiros') {
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
      const heroSlides = Array.from(document.querySelectorAll('.cover-hero .hero-slide'));
      if (heroSlides.length > 1) {
        let heroIndex = heroSlides.findIndex(function (slide) {
          return slide.classList.contains('is-active');
        });
        if (heroIndex < 0) {
          heroIndex = 0;
          heroSlides[0].classList.add('is-active');
        }
        let heroTimer = null;
        function advanceHero() {
          heroSlides[heroIndex].classList.remove('is-active');
          heroIndex = (heroIndex + 1) % heroSlides.length;
          heroSlides[heroIndex].classList.add('is-active');
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
