declare global {
    interface Window {
        /** Reloads the page once when a script from before the last deploy fails to import. Set in Base.astro. */
        silkRecover?: (error: unknown) => boolean;
    }
}

export {};
