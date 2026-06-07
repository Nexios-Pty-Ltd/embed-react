import { useState } from 'react';
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
    // Callback-ref state so the post-mount toggle triggers a re-render —
    // useBooker can then re-init with the live DOM node as its target.
    // A plain `useRef` doesn't work here: mutating `.current` won't
    // re-render, and the init effect would keep its stale `target=null`.
    const [target, setTarget] = useState<HTMLDivElement | null>(null);
    const { url, className, style, ...rest } = props;

    useBooker({
        ...rest,
        url,
        type: 'inline',
        target,
    });

    return <div ref={setTarget} className={className} style={style} />;
}
