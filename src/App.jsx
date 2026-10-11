import { useEffect } from 'react';
import { useGame } from './game/store.js';
import { boot } from './game/engine.js';
import { unlock, setTrack, sfx } from './audio/sound.js';
import { Hud, Tabs } from './components/Hud.jsx';
import { StatusView, DailyView, GatesView, ShopView, WardrobeView, HeroesView, CodexView, ShadowView } from './components/views.jsx';
import { Battle } from './components/Battle.jsx';
import { Modal } from './components/Modals.jsx';
import { Toasts, SoundControl } from './components/Chrome.jsx';
import { TownView } from './components/Town.jsx';
import { GuildView } from './components/Guild.jsx';

const VIEWS = { status: StatusView, daily: DailyView, gates: GatesView, shop: ShopView, wardrobe: WardrobeView, heroes: HeroesView, town: TownView, guild: GuildView, codex: CodexView, shadow: ShadowView };

export default function App() {
  const { S, ui } = useGame();
  useEffect(() => { boot(); }, []);
  /* audio may only start after a user gesture */
  useEffect(() => {
    const go = () => unlock();
    addEventListener('pointerdown', go); addEventListener('keydown', go);
    return () => { removeEventListener('pointerdown', go); removeEventListener('keydown', go); };
  }, []);
  const track = !S || !S.run ? 'town' : S.run.stage === 3 && S.run.enemy && S.run.state === 'fight' ? 'boss' : 'dungeon';
  useEffect(() => { setTrack(track); }, [track]);
  const View = VIEWS[ui.tab] || GatesView;
  const click = e => { const b = e.target.closest('button'); if (b && !b.disabled) sfx('click'); };
  return <>
    <Toasts />
    <SoundControl />
    <main id="app" onClickCapture={click}>
      {S && S.cls && <><Hud />{S.run ? <Battle /> : <><Tabs /><View /></>}</>}
    </main>
    {ui.modal && <Modal />}
  </>;
}
