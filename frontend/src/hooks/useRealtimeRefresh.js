import { useEffect } from 'react';

export function useRealtimeRefresh(load, interval = 7000) {
  useEffect(() => {
    let alive = true;
    const run = () => { if (alive) load(); };
    run();
    const timer = setInterval(run, interval);
    const handler = () => run();
    window.addEventListener('skillswap:refresh', handler);
    return () => { alive = false; clearInterval(timer); window.removeEventListener('skillswap:refresh', handler); };
  }, [load, interval]);
}
