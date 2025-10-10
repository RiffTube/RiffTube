export const OPEN_CREATE_EVENT = 'open-create-project' as const;

export type OpenCreateDetail = { youtubeUrl?: string };

export function dispatchOpenCreate(detail?: OpenCreateDetail): void {
  window.dispatchEvent(
    new CustomEvent<OpenCreateDetail>(OPEN_CREATE_EVENT, { detail }),
  );
}
