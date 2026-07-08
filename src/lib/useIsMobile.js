import { useEffect, useState } from 'react';

// Returns true on narrow (phone) viewports. Used to switch the shell from the
// desktop sidebar layout to a stacked mobile layout.
export function useIsMobile(breakpoint = 820) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);

  return isMobile;
}
