import { useEffect, useRef, useState } from 'react';
import { ensureLoader, getScheduleMEGlobal } from './loader';
export function useBooker(options) {
    const [instance, setInstance] = useState(null);
    const [error, setError] = useState(null);
    // Stable across re-renders so the effect doesn't re-init on every
    // option change. Consumers wanting reactive updates use the
    // `instance.theme()` etc. methods on the returned handle.
    const optionsRef = useRef(options);
    optionsRef.current = options;
    useEffect(() => {
        let active = true;
        let local = null;
        ensureLoader(options.url)
            .then(() => {
            if (!active)
                return;
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
                global('on', 'booking:confirmed', (payload) => optionsRef.current.onBookingConfirmed?.(payload));
            }
            if (init.onBookingFailed) {
                global('on', 'booking:failed', (payload) => optionsRef.current.onBookingFailed?.(payload));
            }
            setInstance(local);
        })
            .catch((err) => {
            if (!active)
                return;
            setError(err);
            optionsRef.current.onError?.(err);
        });
        return () => {
            active = false;
            try {
                local?.destroy?.();
            }
            catch {
                // Tear-down errors must never escape into React's render path.
            }
            setInstance(null);
        };
        // Only the URL invalidates the loader / instance. Other prop
        // changes get applied via .theme() etc. on the live handle.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.url, options.type]);
    // Reactive theme — apply on every render where the value changed.
    useEffect(() => {
        if (!instance || !options.theme)
            return;
        try {
            instance.theme?.(options.theme);
        }
        catch {
            // Loader may not be ready yet; the initial init effect already
            // applies the theme once instance becomes non-null.
        }
    }, [instance, options.theme]);
    return { instance, ready: instance !== null, error };
}
//# sourceMappingURL=useBooker.js.map