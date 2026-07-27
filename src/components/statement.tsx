import { AnimatedWord } from '@/components/ui/animated-word';

const WORDS = ['creative', 'unique', 'original', 'useful'] as const;

// No id="work" on the section: <main> in App.tsx owns that anchor, and both the
// skip link and the top bar's "See my work" chip target it.
export function Statement() {
  return (
    <section className='statement'>
      <h2 className='statement__title'>
        Engineering &amp; deploying reliable AI,{' '}
        <span className='muted'>
          exploring <AnimatedWord words={WORDS} />
          <span className='statement__title-tail'> builds on the side.</span>
        </span>
      </h2>
      <p className='statement__body'>
        Alongside my core work in <em>AI</em> deployment and agentic workflows, I
        build cross-disciplinary projects on the side. My work spans{' '}
        <em>3D printing</em> and custom hardware, applied AI and web tools,{' '}
        <em>full-stack engineering</em>, and brand identity <em>design</em>.
      </p>
    </section>
  );
}
