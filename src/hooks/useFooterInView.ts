import { useState, useEffect } from 'react';

export function useFooterInView() {
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    const footerEl = document.getElementById('site-footer');
    if (!footerEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px 0px -40px 0px', // Trigger slightly before reaching full bottom
        threshold: 0.05,
      }
    );

    observer.observe(footerEl);
    return () => observer.disconnect();
  }, []);

  return isFooterVisible;
}
