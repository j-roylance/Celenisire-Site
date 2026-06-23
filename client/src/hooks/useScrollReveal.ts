import { useEffect } from 'react';

export function useScrollReveal(selector = '.landing-section') {
  useEffect(() => {
    const sections = document.querySelectorAll(selector);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px' },
    );

    sections.forEach((section) => {
      if (!section.classList.contains('hero')) {
        observer.observe(section);
      }
    });

    return () => observer.disconnect();
  }, [selector]);
}
