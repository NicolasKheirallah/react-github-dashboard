import { describe, expect, it, vi } from 'vitest';
import {
  getSafeExternalUrl,
  getSafeGithubWebUrl,
  openExternalUrl,
} from './externalLinks';

describe('externalLinks', () => {
  it('returns null for unsupported protocols', () => {
    expect(getSafeExternalUrl('javascript:alert(1)')).toBeNull();
    expect(getSafeExternalUrl('data:text/html,hello')).toBeNull();
  });

  it('normalizes valid http and https urls', () => {
    expect(getSafeExternalUrl('https://github.com/openai')).toBe(
      'https://github.com/openai'
    );
    expect(getSafeExternalUrl('/search', 'https://example.com')).toBe(
      'https://example.com/search'
    );
  });

  it('rejects disallowed hosts when an allowlist is provided', () => {
    expect(
      getSafeExternalUrl('https://evil.example.com/path', {
        allowedHosts: ['github.com'],
      })
    ).toBeNull();
  });

  it('converts GitHub API urls into safe GitHub web urls', () => {
    expect(
      getSafeGithubWebUrl('https://api.github.com/repos/openai/react-github-dashboard/issues/1')
    ).toBe('https://github.com/openai/react-github-dashboard/issues/1');
  });

  it('opens valid urls and rejects unsafe ones', () => {
    const opener = vi.fn();

    expect(openExternalUrl('https://github.com', opener)).toBe(true);
    expect(opener).toHaveBeenCalledWith(
      'https://github.com/',
      '_blank',
      'noopener,noreferrer'
    );

    expect(openExternalUrl('javascript:alert(1)', opener)).toBe(false);
    expect(opener).toHaveBeenCalledTimes(1);
  });
});
