/* Node module hook for the balance simulator: swaps browser-only modules for headless stubs,
   so the real game engine can run in Node without a canvas. */
const STUBS = [
  ['/arena/arena.js', new URL('./arena-stub.mjs', import.meta.url).href],
];

export async function resolve(specifier, context, next) {
  const hit = STUBS.find(([tail]) => specifier.endsWith(tail));
  return hit ? { url: hit[1], shortCircuit: true } : next(specifier, context);
}
