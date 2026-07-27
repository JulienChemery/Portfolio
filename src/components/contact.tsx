import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { CheckIcon, CopyIcon } from '@/components/icons';
import { asset, cn } from '@/lib/utils';

const EMAIL = 'julien.chemery@gmail.com';

const LINKS = [
  {
    label: 'GitHub',
    value: '@JulienChemery',
    href: 'https://github.com/JulienChemery',
  },
  {
    label: 'LinkedIn',
    value: '/in/julienchemery',
    href: 'https://www.linkedin.com/in/julienchemery',
  },
  {
    label: 'Resume',
    value: 'Download PDF',
    href: asset('/assets/julien-chemery-resume.pdf'),
  },
] as const;

export function Contact() {
  const { copied, copy } = useCopyToClipboard();

  return (
    <section className='contact' id='contact'>
      <div>
        <h2 className='contact__title'>Get in touch</h2>
        <p className='contact__body'>
          Open to consulting on agentic systems and production LLM deployments.
        </p>
      </div>
      <ul className='contact__grid'>
        <li className='contact__item contact__item--email'>
          <a className='contact__link' href={`mailto:${EMAIL}`}>
            <span className='contact__label'>Email</span>
            <span className='contact__value'>{EMAIL}</span>
          </a>
          <button
            className={cn('contact__copy', copied && 'is-copied')}
            type='button'
            aria-label={copied ? 'Copied!' : 'Copy email address'}
            onClick={() => copy(EMAIL)}
          >
            {/* Both icons stay mounted — .is-copied on the button swaps which
                one displays. Do not add a `hidden` attribute here: styles.css
                declares [hidden] { display: none !important }, which would beat
                the .is-copied rule and keep the checkmark permanently hidden. */}
            <CopyIcon className='contact__copy-icon' />
            <CheckIcon className='contact__copy-icon contact__copy-icon--check' />
          </button>
        </li>
        {LINKS.map((link) => (
          <li key={link.label}>
            <a
              className='contact__item'
              href={link.href}
              target='_blank'
              rel='noopener noreferrer'
            >
              <span className='contact__label'>{link.label}</span>
              <span className='contact__value'>
                {link.value} <span aria-hidden='true'>↗</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Footer() {
  return (
    <footer className='footer'>
      <span>© 2026 JULIEN CHÉMERY</span>
      <span>PARIS / SAN FRANCISCO / REMOTE</span>
    </footer>
  );
}
