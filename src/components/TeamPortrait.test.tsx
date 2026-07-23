import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { TeamMember } from '../content/team';
import { TeamPortrait } from './TeamPortrait';

const fixture: TeamMember = {
  id: 'portrait-fixture',
  name: 'Portrait Fixture',
  role: 'Approved public role',
  responsibility: 'Owns the verified responsibility.',
  disciplines: ['Fixture discipline'],
  profileUrl: 'https://example.com/profile',
  portrait: {
    painted: {
      avif: '/team/fixture/painted-480.avif 480w, /team/fixture/painted-800.avif 800w',
      webp: '/team/fixture/painted-480.webp 480w, /team/fixture/painted-800.webp 800w',
      fallback: '/team/fixture/painted-800.jpg',
      width: 800,
      height: 1000,
    },
    real: {
      avif: '/team/fixture/real-480.avif 480w, /team/fixture/real-800.avif 800w',
      webp: '/team/fixture/real-480.webp 480w, /team/fixture/real-800.webp 800w',
      fallback: '/team/fixture/real-800.jpg',
      width: 800,
      height: 1000,
    },
  },
};

describe('TeamPortrait', () => {
  it('renders both registered portrait layers and keeps the real layer unrevealed initially', () => {
    const markup = renderToStaticMarkup(<TeamPortrait member={fixture} />);

    expect(markup).toContain('aria-pressed="false"');
    expect(markup).toContain('Reveal the real portrait of Portrait Fixture');
    expect(markup).toContain('/team/fixture/painted-480.avif 480w');
    expect(markup).toContain('/team/fixture/real-480.webp 480w');
    expect(markup).toContain('Portrait Fixture');
    expect(markup).toContain('Approved public role');
    expect(markup).toContain('Owns the verified responsibility.');
  });
});
