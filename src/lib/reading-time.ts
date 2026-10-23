import { isValidElement } from 'react';
import type { ReactNode } from 'react';

/** Average adult reading speed used for the "N min read" estimate. */
export const WORDS_PER_MINUTE = 200;

/**
 * Flattens a React tree into plain text so prose written as JSX (the resource
 * guides' real-life examples) can be measured like any other string. Elements
 * contribute their children; booleans and nulls are ignored exactly as React
 * does when rendering.
 */
export function textFromReactNode(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);

  if (Array.isArray(node)) {
    return node.map(textFromReactNode).filter(Boolean).join(' ');
  }

  if (isValidElement(node)) {
    const props = node.props as { children?: ReactNode };
    return textFromReactNode(props.children);
  }

  return '';
}

/** Counts whitespace-separated tokens that contain at least one letter or digit. */
export function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Whole minutes to read `text`, never below one. */
export function readingTimeMinutes(text: string, wordsPerMinute: number = WORDS_PER_MINUTE): number {
  if (wordsPerMinute <= 0) return 1;
  const words = countWords(text);
  if (words === 0) return 1;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

/** Short label for a card, e.g. `3 min read`. */
export function readingTimeLabel(text: string, wordsPerMinute: number = WORDS_PER_MINUTE): string {
  return `${readingTimeMinutes(text, wordsPerMinute)} min read`;
}
