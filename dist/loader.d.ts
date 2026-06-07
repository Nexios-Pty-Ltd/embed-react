/**
 * Loader bootstrap — installs the queue-stub global if no other code has
 * yet, then ensures the embed.js script is appended once per host page.
 *
 * Idempotent: many React components on the same page calling
 * {@link ensureLoader} only result in ONE `<script>` tag and ONE network
 * request for the loader, even before the script finishes executing.
 *
 * SSR-safe — every call site is guarded for `typeof window` so the
 * package can ship in Next.js / Remix / Astro server-rendered routes
 * without crashing the build.
 */
import type { ScheduleMEGlobal } from './types';
declare global {
    interface Window {
        ScheduleME?: ScheduleMEGlobal;
        ScheduleMe?: ScheduleMEGlobal;
    }
}
/**
 * Install the queue-stub on `window.ScheduleME` so calls made before the
 * real loader executes are captured + replayed. Idempotent — only sets
 * the global when no stub or real implementation is present.
 */
export declare function installQueueStub(): void;
/**
 * Append `<script async src="${url}/embed/v1.js">` once. Returns a promise
 * that resolves when the script executes (or rejects on load error so
 * components can surface a clean error message instead of an opaque
 * "widget never appeared").
 */
export declare function ensureLoader(url: string): Promise<void>;
/**
 * Resolve the live `ScheduleME` global. Returns null SSR-side; in the
 * browser, returns the global once the loader has finished executing
 * (the queue stub before then is still callable, but operations like
 * `theme()` need the real implementation to take effect).
 */
export declare function getScheduleMEGlobal(): ScheduleMEGlobal | null;
export declare function __resetLoaderForTests(): void;
//# sourceMappingURL=loader.d.ts.map