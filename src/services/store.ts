import { writable } from 'svelte/store';

export interface CustomEventPayload {
  event: string;
  data?: {
    to: [number, number];
    from: [number, number];
  };
}

export const eventPayload = writable<CustomEventPayload>({ event: null, data: null });
