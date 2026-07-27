import { useState, type ReactNode } from 'react';
import { Img, Media } from '@/components/media';
import { GithubMark } from '@/components/icons';

/** Extra project cards live here. The "More projects" button stays hidden until
 *  this array has something in it — same contract as the old #more-projects
 *  section, just expressed as data instead of DOM inspection. */
const MORE_PROJECTS: { title: string; body: ReactNode }[] = [];

export function ProjectGrid() {
  const [open, setOpen] = useState(false);
  const hasMore = MORE_PROJECTS.length > 0;

  return (
    <>
      <section className='grid' aria-label='More work'>
        {/* The two picture cards are wrapped so they can share their rows and
            line their titles up whatever length the two write-ups run to. The
            wrapper is display:contents on a phone, where they stack. */}
        <div className='grid__pair'>
          {/* 03 — Portfolio Website */}
          <article className='card card--photo'>
            <Media
              className='card__bg'
              src='/assets/img/projects/portfolio-website.jpg'
              alt=''
              loading='lazy'
            />
            <div className='card__scrim' aria-hidden='true' />
            <div className='card__content'>
              <div className='card__head'>
                <h3 className='card__title'>Portfolio Website</h3>
                {/* "Source Available", not "Open Source": the repo is public
                    and readable, but CC BY-NC 4.0 bars commercial use, which
                    the OSI definition does not allow an open-source licence to
                    do. See LICENSE. */}
                <a
                  className='badge'
                  href='https://github.com/JulienChemery/Portfolio'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <GithubMark />
                  Source Available
                </a>
              </div>
              <p className='card__body'>
                A showcase built with Claude Code and Claude Design. Leverages
                custom agent skills, tailored MCP integrations, and generative
                media pipelines to deliver a dynamic, production-grade UI.
              </p>
            </div>
          </article>

          {/* 04 — Events-IT */}
          <article className='card card--photo'>
            <Media
              className='card__bg'
              src='/assets/img/projects/events-it.jpg'
              alt=''
              loading='lazy'
            />
            <div className='card__scrim' aria-hidden='true' />
            <div className='card__content'>
              <div className='card__head card__head--split'>
                {/* Title and badge travel together, and wrap against each other
                    rather than against the logo — the logo keeps the right edge
                    at every width. See .card__head--split. */}
                <div className='card__head-main'>
                  <h3 className='card__title'>Events-IT</h3>
                  <a
                    className='badge'
                    href='https://github.com/APP-G10E/Events-IT_Main'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <GithubMark />
                    Open Source
                  </a>
                </div>
                <Img
                  className='card__org credential__logo--invert'
                  src='/assets/img/logos/isep.png'
                  alt='ISEP'
                  height={26}
                  loading='lazy'
                />
              </div>
              <p className='card__body'>
                A festival management platform featuring ticketing, role-based
                access, and real-time sound level monitoring powered by custom
                data-acquisition hardware.
              </p>
            </div>
          </article>
        </div>

        {/* 05 — Paris Association Brand Refresh */}
        <article className='card card--pad card--wide'>
          <h3 className='card__title card__title--md'>
            Paris Association Brand Refresh
          </h3>
          <p className='card__body'>
            Modernized legacy branding for a Champs-Élysées association.
            Currently developing “LAB,” a custom chatbot enabling members to
            instantly generate and tweak social media visuals.
          </p>
        </article>

        {/* 06 — From Risk to Uncertainty */}
        <article className='card card--pad card--wide'>
          <div className='card__head card__head--split'>
            <h3 className='card__title'>From Risk to Uncertainty Paper</h3>
            <Img
              className='card__org credential__logo--invert'
              src='/assets/img/logos/berkeley.png'
              alt='UC Berkeley'
              height={22}
              loading='lazy'
            />
          </div>
          <p className='card__body'>
            A case study analyzing an internship R&amp;D conflict over simulation
            rigor. Examines the tension between geometric estimation and physics
            through the frameworks of Jasanoff, Perrow, and Wynne.
          </p>
        </article>

        {hasMore && (
          <div className='card card--wide grid__more'>
            <button
              className='more'
              type='button'
              aria-expanded={open}
              aria-controls='more-projects'
              onClick={() => setOpen((value) => !value)}
            >
              More projects{' '}
              <span className='more__arrow' aria-hidden='true'>
                ↓
              </span>
            </button>
          </div>
        )}
      </section>

      {hasMore && (
        <section className='grid grid--more' id='more-projects' hidden={!open}>
          {MORE_PROJECTS.map((project) => (
            <article key={project.title} className='card card--pad card--wide'>
              <h3 className='card__title'>{project.title}</h3>
              <p className='card__body'>{project.body}</p>
            </article>
          ))}
        </section>
      )}
    </>
  );
}
