import type { BookerCommonProps, SchedulemeInstance } from './types';
/**
 * Low-level hook for managing a ScheduleME embed instance from React.
 *
 * Most consumers should reach for the {@link Booker}, {@link BookerPopup},
 * or {@link BookerBadge} components instead — they own the DOM container
 * and the mount lifecycle for you. The hook is the escape hatch for
 * hosts that need direct access to `.open()`, `.close()`, or `.theme()`
 * on a programmatically-created instance.
 *
 * Example:
 *
 *   const { instance, ready, error } = useBooker({
 *       type: 'popup',
 *       url: 'https://acme.scheduleme.com.au',
 *       embedKey: 'pk_live_…',
 *   });
 *
 *   <button onClick={instance?.open} disabled={!ready}>Book a demo</button>
 *
 * SSR-safe: side effects all live in useEffect, so the hook is a
 * straight return of `{ instance: null, ready: false }` during server
 * render.
 */
export interface UseBookerOptions extends BookerCommonProps {
    /** Embed type. Defaults to 'inline'. */
    type?: 'inline' | 'popup' | 'badge';
    /** Required for type='inline'. Selector or DOM element. */
    target?: string | HTMLElement | null;
    /** Required for type='popup'. Selector or DOM element of the click trigger(s). */
    trigger?: string | HTMLElement | null;
    /** Badge configuration (type='badge' only). */
    badge?: {
        text?: string;
        color?: string;
        textColor?: string;
        position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    };
}
export interface UseBookerResult {
    /** The live embed instance handle. Null until the loader has finished executing. */
    instance: SchedulemeInstance | null;
    /** True once the loader is ready and `instance` is non-null. */
    ready: boolean;
    /** Populated on loader script error (network failure, CSP block, etc.). */
    error: Error | null;
}
export declare function useBooker(options: UseBookerOptions): UseBookerResult;
//# sourceMappingURL=useBooker.d.ts.map