/* Shared with the standalone campaign source. Content stays visible without JS. */
(() => {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  const targets = new Map();
  const add = (element, delay = 0) => {
    if (element && !targets.has(element)) targets.set(element, delay);
  };

  document.querySelectorAll([
    'h1', '.text-block-11', '.link-block-5', '.section-heading', '.heading-2',
    '.par-sfalsato-sopra', '.par-sfalsato-sotto', '.text-block-9', '.heading-10',
    '.text-block-16', '.text-block-17', '.text-contact', '.form', '.client-grid',
    '.bookings-footer .container', '.footer-holder', '.hero-art', '.contact-band .shell',
    '.reveal:not(.metrics):not(.numbered-grid):not(.process-list):not(.case-study__details):not(.matrix)',
  ].join(',')).forEach(element => add(element));

  document.querySelectorAll([
    '.stages-grid', '.grid-7', '.mask', '.hero-copy', '.logo-row', '.metrics',
    '.numbered-grid', '.process-list', '.case-study__details', '.matrix', '.faq-list',
  ].join(',')).forEach(group => {
    [...group.children].forEach((child, index) => {
      // Animate inside Webflow slides without touching the carousel's transforms.
      add(child.matches('.w-slide') ? child.querySelector('.service-wrapper') : child,
        Math.min(index * 65, 195));
    });
  });

  const reveal = (element, animate = true) => {
    element.classList.add('is-visible');
    if (!animate || preference.matches || typeof element.animate !== 'function') return;
    const heading = element.matches('h1') || element.querySelector('h1');
    const animation = element.animate([
      { opacity: heading ? 1 : 0, translate: '0 18px' },
      { opacity: 1, translate: '0 0' },
    ], {
      duration: 620,
      delay: targets.get(element) || 0,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    });
    running.add(animation);
    animation.onfinish = animation.oncancel = () => running.delete(animation);
  };

  // Avoid animating both a group and its descendants.
  for (const element of targets.keys()) {
    let parent = element.parentElement;
    while (parent && !targets.has(parent)) parent = parent.parentElement;
    if (parent) targets.delete(element);
  }

  let observer;
  if (!preference.matches && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        reveal(entry.target);
        observer.unobserve(entry.target);
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    targets.forEach((_, element) => observer.observe(element));
  } else {
    targets.forEach((_, element) => reveal(element, false));
  }

  // Keyboard users never wait for an entrance animation to access a control.
  document.addEventListener('focusin', event => {
    for (const animation of running) {
      if (animation.effect?.target?.contains(event.target)) animation.cancel();
    }
  });
  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    observer?.disconnect();
    for (const animation of running) animation.cancel();
    targets.forEach((_, element) => reveal(element, false));
  });
})();
