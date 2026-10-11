import { useEffect, useRef } from 'react';
import { getSprite } from '../art/sprites.js';
import { H } from '../game/engine.js';

/* pixel sprite: draws the cached 1:1 canvas and lets CSS scale it with crisp pixels */
export function Sprite({ k, id, v = 'n', flip = false, scale = 2, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const src = getSprite(k, id, v, flip);
    cv.width = src.width; cv.height = src.height;
    const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(src, 0, 0);
    cv.style.width = src.width * scale + 'px';
  }, [k, id, v, flip, scale]);
  return <canvas ref={ref} className={'pt ' + className} aria-hidden="true" />;
}

export function Bar({ l, v, m, k }) {
  return (
    <div className="bar-row"><span className="bl">{l}</span>
      <div className={'bar ' + k}><i style={{ width: `${Math.max(0, Math.min(100, v / m * 100))}%` }} /></div>
      <span className="bv">{Math.round(v).toLocaleString()} / {m.toLocaleString()}</span>
    </div>
  );
}

export const Btn = ({ act, args = [], className = 'btn', children, disabled, ...rest }) => (
  <button className={className} disabled={disabled} onClick={() => H[act](...args)} {...rest}>{children}</button>
);

export const Stars = ({ n, max = 5 }) => (
  <span className={`stars s${n}`} aria-label={`${n} ดาว`}>{'★'.repeat(n)}<span className="off">{'★'.repeat(Math.max(0, max - n))}</span></span>
);
