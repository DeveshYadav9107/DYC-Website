import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop — resets scroll position on every route change.
 * Place inside <BrowserRouter> so useLocation() works.
 *
 * Hash links (e.g. #services) on the SAME page are left alone
 * so in-page anchor navigation still works as expected.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Temporarily disable smooth scrolling on html to ensure an instant jump
    const html = document.documentElement;
    const originalScrollBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = 'auto';
    
    window.scrollTo(0, 0);
    
    // Restore smooth scrolling for hash links
    setTimeout(() => {
      html.style.scrollBehavior = originalScrollBehavior;
    }, 0);
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
