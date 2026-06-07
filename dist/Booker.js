import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { useBooker } from './useBooker';
export function Booker(props) {
    const containerRef = useRef(null);
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
    return _jsx("div", { ref: containerRef, className: className, style: style });
}
//# sourceMappingURL=Booker.js.map