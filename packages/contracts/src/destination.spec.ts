import { describe, expect, it } from 'vitest';

import { MAX_DESTINATION_LENGTH, parseDestination } from './destination';

describe('parseDestination', () => {
  it('accepts http and https URLs', () => {
    expect(parseDestination('http://example.com/a')).toBe('http://example.com/a');
    expect(parseDestination('https://example.com/a?b=c#d')).toBe(
      'https://example.com/a?b=c#d',
    );
  });

  it('normalises through the URL parser', () => {
    expect(parseDestination('https://example.com')).toBe('https://example.com/');
    expect(parseDestination('HTTPS://Example.COM/Path')).toBe('https://example.com/Path');
  });

  it('rejects every scheme outside the allowlist', () => {
    expect(parseDestination('javascript:alert(1)')).toBeNull();
    expect(parseDestination('data:text/html,<h1>hi</h1>')).toBeNull();
    expect(parseDestination('file:///etc/passwd')).toBeNull();
    expect(parseDestination('ftp://example.com')).toBeNull();
    expect(parseDestination('mailto:someone@example.com')).toBeNull();
  });

  it('rejects input that is not an absolute URL', () => {
    expect(parseDestination('example.com')).toBeNull();
    expect(parseDestination('//example.com')).toBeNull();
    expect(parseDestination('/just/a/path')).toBeNull();
    expect(parseDestination('')).toBeNull();
    expect(parseDestination('   ')).toBeNull();
  });

  it('rejects values that are not strings', () => {
    expect(parseDestination(undefined)).toBeNull();
    expect(parseDestination(null)).toBeNull();
    expect(parseDestination(42)).toBeNull();
    expect(parseDestination({ destination: 'https://example.com' })).toBeNull();
  });

  it('rejects URLs longer than the cap', () => {
    const base = 'https://example.com/';
    const withinCap = base + 'a'.repeat(MAX_DESTINATION_LENGTH - base.length);

    expect(parseDestination(withinCap)).toBe(withinCap);
    expect(parseDestination(`${withinCap}a`)).toBeNull();
  });
});
