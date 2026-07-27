import { AnimatedTabs } from '@/components/ui/animated-tabs';

export type PanelId = 'projects' | 'photography';

export const PANELS = [
  { id: 'projects', label: 'Projects' },
  { id: 'photography', label: 'Photography' },
] as const satisfies readonly { id: PanelId; label: string }[];

type SectionTabsProps = {
  active: PanelId;
  onChange: (id: PanelId) => void;
};

/** The section switcher — one instance, laid out at the foot of the hero and
 *  pinned into the top bar from there. Roles, keyboard handling and the sliding
 *  highlight live in <AnimatedTabs>; this binds it to the portfolio's panels. */
export function SectionTabs({ active, onChange }: SectionTabsProps) {
  return (
    <AnimatedTabs
      tabs={PANELS}
      value={active}
      onChange={(id) => onChange(id as PanelId)}
      label='Sections'
    />
  );
}
