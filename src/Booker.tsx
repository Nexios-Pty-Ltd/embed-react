import { useEffect, useRef } from 'react';
import { useBooker } from './useBooker';
import type { BookerCommonProps } from './types';

/**
 * Inline embed. Renders the booking widget directly into a `<div>` you
 * place wherever you want the iframe to appear on the page. Auto-resizes
 * to the content's scrollHeight so no fixed height is needed.
 *
 * SSR-safe: the iframe is mounted in `useEffect`, so the server-rendered
 * output is just an empty placeholder `<div>`. Hydration kicks the
 * loader fetch and produces the iframe on the client.
 *
 * Example:
 *
 *   <Booker
 *       url="https://acme.scheduleme.com.au"
 *       embedKey="pk_live_…"
 *       service={42}
 *       onBookingConfirmed={(b) => analytics.track('Booking Confirmed', b)}
 *   />
 */
export interface BookerProps extends BookerCommonProps {
    /** Optional pre-selected service ID. */
    service?: number | string;
    /** Optional pre-selected employee ID. */
    employee?: number | string;
    /** Forwarded to the wrapping `<div>` — useful for layout. */
    className?: string;
    /** Inline styles on the wrapping `<div>`. */
    style?: React.CSSProperties;
}

export function Booker(props: BookerProps): JSX.Element {
    const containerRef = useRef<HTMLDivElement>(null);
    const targetReady = useRef(false);
    const { url, className, style, ...rest } = props;

    // Hand the ref to the hook only once the DOM node is mounted — the
    // ref's current is null on the first render under React 18 concurrent
    // mode. The companion effect below kicks the hook re-init by toggling
    // targetReady.current after the ref is populated.
    const target = targetReady.current ? containerRef.current : undefined;

    useBooker({
        ...rest,
        url,
        type: 'inline',
        target,
    });

    useEffect(() => {
        if (containerRef.current && !targetReady.current) {
            targetReady.current = true;
            // No state to set — useBooker re-reads optionsRef every render,
            // and the inline init effect re-runs when target changes via
            // the URL dep above. We sidestep the dep tracking because the
            // ref-target pattern needs a manual re-init nudge.
        }
    });

    return <div ref={containerRef} className={className} style={style} />;
}
