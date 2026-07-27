import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Hero } from '@/components/hero';
import { TopBar } from '@/components/top-bar';
import { Credentials } from '@/components/credentials';
import { Statement } from '@/components/statement';
import { TradingAgent, PrintedProjects } from '@/components/features';
import { ProjectGrid } from '@/components/project-grid';
import { Photography } from '@/components/photography';
import { Contact, Footer } from '@/components/contact';
import { PANELS, type PanelId } from '@/components/section-tabs';

const isPanelId = (value: string): value is PanelId =>
  PANELS.some((panel) => panel.id === value);

const panelFromHash = (): PanelId | null => {
  const id = window.location.hash.slice(1);
  return isPanelId(id) ? id : null;
};

export default function App() {
  // Deep links: /#photography and /#projects open their panel directly.
  const [panel, setPanel] = useState<PanelId>(() => panelFromHash() ?? 'projects');
  // Raised by the hero once it has collapsed past the top of the viewport, and
  // read by both ends of the hand-off: the hero fades its tabs out, the bar
  // fades its own in. One source of truth for the two halves of one gesture.
  const [docked, setDocked] = useState(false);
  // Raised earlier than `docked`, while the pill is still on its way up. The
  // phone bar cannot hold the pill and both chips, and the chips have to be out
  // of the way before the pill arrives rather than at the moment it lands.
  const [near, setNear] = useState(false);
  const workRef = useRef<HTMLElement>(null);
  // Raised by a tab click and by nothing else. Switching panels swaps one long
  // column for another, and the page does not move: from the foot of Projects
  // you arrive at the foot of Photography, half way down a panel you have never
  // seen. A deep link or the first paint must not scroll, though, so the rewind
  // has to know which of the two put the panel there.
  const rewindOnPanelChange = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const next = panelFromHash();
      if (next) setPanel(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const selectPanel = (id: PanelId) => {
    if (id !== panel) rewindOnPanelChange.current = true;
    setPanel(id);
    // replaceState, not a hash assignment — updating the URL should not add a
    // history entry or trigger the smooth scroll that jumping to #id would.
    window.history.replaceState(null, '', `#${id}`);
  };

  // Stable: the hero hands this to a ScrollTrigger that is built once.
  const handleDockChange = useCallback((next: boolean) => setDocked(next), []);
  const handleNearChange = useCallback((next: boolean) => setNear(next), []);

  // Switching panels is a layout change of the whole document: the panel going
  // away takes its height with it. Anything scroll-driven inside the one coming
  // back measured itself while it was display:none, so its start and end are
  // zero until they are recalculated here.
  useEffect(() => {
    ScrollTrigger.refresh();

    if (!rewindOnPanelChange.current) return;
    rewindOnPanelChange.current = false;

    const work = workRef.current;
    // Only when the top of the panel is already behind you. Switching tabs from
    // the hero, where both panels are still below the fold, should leave the
    // page exactly where it is.
    if (work && work.getBoundingClientRect().top < 0) {
      // No options: the smooth scroll and the offset for the collapsed bar are
      // both the stylesheet's (scroll-behavior and scroll-padding-top on html),
      // which means prefers-reduced-motion turns the animation off for free.
      work.scrollIntoView();
    }
  }, [panel]);

  return (
    <div className='page'>
      <TopBar
        docked={docked}
        near={near}
        onSeeWork={() => setPanel('projects')}
      />

      <Hero
        activePanel={panel}
        onPanelChange={selectPanel}
        onDockChange={handleDockChange}
        onNearChange={handleNearChange}
      />

      <main id='work' ref={workRef}>
        <div
          id='panel-projects'
          role='tabpanel'
          aria-labelledby='tab-projects'
          tabIndex={0}
          hidden={panel !== 'projects'}
        >
          <Credentials />
          <Statement />
          <TradingAgent />
          <PrintedProjects />
          <ProjectGrid />
        </div>

        <div
          id='panel-photography'
          role='tabpanel'
          aria-labelledby='tab-photography'
          tabIndex={0}
          hidden={panel !== 'photography'}
        >
          <Photography />
        </div>
      </main>

      <Contact />
      <Footer />
    </div>
  );
}
