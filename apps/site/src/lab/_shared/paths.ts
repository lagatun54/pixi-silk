/** Site-relative locations the lab pages link to (respects Astro's `base`). */
const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');

export const LAB_HOME = `${BASE}lab/`;
export const REFS = `${BASE}refs/`;
