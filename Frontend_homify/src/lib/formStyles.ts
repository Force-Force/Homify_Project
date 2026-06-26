/** Shared form field classes — always use theme tokens, never raw white/gray. */

const fieldBase =
  'w-full bg-homify-surface border border-homify-border rounded-btn text-homify-text text-sm outline-none transition placeholder:text-homify-muted/70 focus:ring-2 focus:ring-homify-primary/20 focus:border-homify-primary/40 disabled:opacity-60 disabled:cursor-not-allowed';

export const inputClass = `${fieldBase} p-4`;

export const inputClassCompact = `${fieldBase} p-3`;

export const textareaClass = `${fieldBase} p-3 min-h-[100px] resize-y`;

export const selectClass = `${fieldBase} p-3 appearance-none cursor-pointer`;

export const authInputClass = `${fieldBase} h-14 px-4 text-base`;

export const labelClass = 'block text-sm font-semibold text-homify-text mb-2';
