import { useSyncExternalStore } from 'react';

/* The game engine mutates one plain state object (S) and a UI object (ui).
   React subscribes through a version counter: every commit() re-renders the screen. */
export let S = null;
export const ui = { tab: 'gates', confirmReset: false, confirmDismantle: null, confirmRebirth: false, confirmSell: null, auto: false, busy: false, draft: null, modal: null, toasts: [], sound: false };

/* ?slot=name keeps a separate save (handy for testing without touching the main one) */
const slot = typeof location !== 'undefined' && new URLSearchParams(location.search).get('slot');
export const KEY = slot ? `arise-save-v3-${slot}` : 'arise-save-v3';
let version = 0;
const listeners = new Set();

export function setS(v) { S = v; }
export function commit() { version++; listeners.forEach(l => l()); }
const subscribe = l => { listeners.add(l); return () => listeners.delete(l); };
export function useGame() { useSyncExternalStore(subscribe, () => version); return { S, ui }; }

export function save() { try { if (S) localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* storage unavailable */ } }
export function wipe() { try { localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ } }
export function readSave() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }

let toastId = 0;
export function sys(t, k = '') {
  const id = ++toastId;
  ui.toasts = [...ui.toasts, { id, t, k, out: false }];
  commit();
  setTimeout(() => { ui.toasts = ui.toasts.map(x => x.id === id ? { ...x, out: true } : x); commit(); }, 2600);
  setTimeout(() => { ui.toasts = ui.toasts.filter(x => x.id !== id); commit(); }, 3100);
}
export function openModal(m) { ui.modal = m; commit(); }
export function closeModal() { ui.modal = null; commit(); }
