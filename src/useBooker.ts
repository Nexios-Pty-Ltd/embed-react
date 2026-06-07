import { useEffect, useRef, useState } from 'react';
import { ensureLoader, getScheduleMEGlobal } from './loader';
import type {
    BookerCommonProps,
    SchedulemeInstance,
} from './types';

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

export function useBooker(options: UseBookerOptions): UseBookerResult {
    const [instance, setInstance] = useState<SchedulemeInstance | null>(null);
    const [error, setError] = useState<Error | null>(null);

    // Stable across re-renders so the effect doesn't re-init on every
    // option change. Consumers wanting reactive updates use the
    // `instance.theme()` etc. methods on the returned handle.
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        // Inline embeds need a mounted target before the loader's `init`
        // can attach the iframe. Bail until the host's ref attaches —
        // the effect re-runs when `options.target` flips from null to
        // the live DOM node (target is in the dep list below).
        if ((options.type ?? 'inline') === 'inline' && !options.target) {
            return;
        }

        let active = true;
        let local: SchedulemeInstance | null = null;

        ensureLoader(options.url)
            .then(() => {
                if (!active) return;
                const global = getScheduleMEGlobal();
                if (!global) {
                    setError(new Error('ScheduleME global is unavailable after loader ran.'));
                    return;
                }
                const init = optionsRef.current;
                local = global('init', {
                    type: init.type ?? 'inline',
                    target: init.target ?? undefined,
                    trigger: init.trigger ?? undefined,
                    url: init.url,
                    embedKey: init.embedKey,
                    service: init.service,
                    employee: init.employee,
                    timezone: init.timezone,
                    prefill: init.prefill,
                    prefillToken: init.prefillToken,
                    analytics: init.analytics,
                    badge: init.badge,
                });
                if (local && init.theme && typeof local.theme === 'function') {
                    local.theme(init.theme);
                }
                if (init.onBookingConfirmed) {
                    global('on', 'booking:confirmed', (payload) =>
                        optionsRef.current.onBookingConfirmed?.(payload as never),
                    );
                }
                if (init.onBookingFailed) {
                    global('on', 'booking:failed', (payload) =>
                        optionsRef.current.onBookingFailed?.(payload as never),
                    );
                }
                setInstance(local);
            })
            .catch((err: Error) => {
                if (!active) return;
                setError(err);
                optionsRef.current.onError?.(err);
            });

        return () => {
            active = false;
            try {
                local?.destroy?.();
            } catch {
                // Tear-down errors must never escape into React's render path.
            }
            setInstance(null);
        };
        // URL, type, and target/trigger all invalidate the loader /
        // instance. Other prop changes get applied via .theme() etc. on
        // the live handle.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.url, options.type, options.target, options.trigger]);

    // Reactive theme — apply on every render where the value changed.
    useEffect(() => {
        if (!instance || !options.theme) return;
        try {
            instance.theme?.(options.theme);
        } catch {
            // Loader may not be ready yet; the initial init effect already
            // applies the theme once instance becomes non-null.
        }
    }, [instance, options.theme]);

    return { instance, ready: instance !== null, error };
}
