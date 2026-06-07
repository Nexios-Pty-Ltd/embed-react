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
/**
 * Map of `url -> loadPromise`. Lets multiple components against the same
 * tenant origin share one fetch, while two components on different
 * tenants still each get a real load.
 */
const loadPromises = new Map();
function originOf(url) {
    return url.replace(/\/+$/, '');
}
/**
 * Install the queue-stub on `window.ScheduleME` so calls made before the
 * real loader executes are captured + replayed. Idempotent — only sets
 * the global when no stub or real implementation is present.
 */
export function installQueueStub() {
    if (typeof window === 'undefined')
        return;
    if (window.ScheduleME)
        return;
    const stub = function (...args) {
        const fn = window.ScheduleME;
        fn.q = fn.q || [];
        // Loader's queue runs `apply(null, args)` so any array-like is
        // fine; the IArguments shape is what the vanilla loader docs
        // describe, but at runtime it's a plain array of arguments.
        fn.q.push(args);
        return null;
    };
    window.ScheduleME = stub;
}
/**
 * Append `<script async src="${url}/embed/v1.js">` once. Returns a promise
 * that resolves when the script executes (or rejects on load error so
 * components can surface a clean error message instead of an opaque
 * "widget never appeared").
 */
export function ensureLoader(url) {
    if (typeof window === 'undefined') {
        return Promise.resolve();
    }
    installQueueStub();
    const origin = originOf(url);
    const existing = loadPromises.get(origin);
    if (existing)
        return existing;
    const promise = new Promise((resolve, reject) => {
        const src = `${origin}/embed/v1.js`;
        // Idempotency belt-and-braces: another tool on the page may have
        // already appended the same `<script>` — adopt its load state.
        const existingScript = document.querySelector(`script[src="${src}"], script[src^="${src}?"]`);
        if (existingScript) {
            if (existingScript.dataset.schedulemeLoaded === '1') {
                resolve();
                return;
            }
            existingScript.addEventListener('load', () => {
                existingScript.dataset.schedulemeLoaded = '1';
                resolve();
            });
            existingScript.addEventListener('error', () => reject(new Error(`Failed to load ScheduleME loader from ${src}`)));
            return;
        }
        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        script.addEventListener('load', () => {
            script.dataset.schedulemeLoaded = '1';
            resolve();
        });
        script.addEventListener('error', () => reject(new Error(`Failed to load ScheduleME loader from ${src}`)));
        document.head.appendChild(script);
    });
    loadPromises.set(origin, promise);
    return promise;
}
/**
 * Resolve the live `ScheduleME` global. Returns null SSR-side; in the
 * browser, returns the global once the loader has finished executing
 * (the queue stub before then is still callable, but operations like
 * `theme()` need the real implementation to take effect).
 */
export function getScheduleMEGlobal() {
    if (typeof window === 'undefined')
        return null;
    return window.ScheduleME ?? null;
}
// Exported for tests so they can reset between cases without leaking
// state across the in-memory Map.
export function __resetLoaderForTests() {
    loadPromises.clear();
}
//# sourceMappingURL=loader.js.map