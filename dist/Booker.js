import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { useBooker } from './useBooker';
export function Booker(props) {
    // Callback-ref state so the post-mount toggle triggers a re-render —
    // useBooker can then re-init with the live DOM node as its target.
    // A plain `useRef` doesn't work here: mutating `.current` won't
    // re-render, and the init effect would keep its stale `target=null`.
    const [target, setTarget] = useState(null);
    const { url, className, style, ...rest } = props;
    useBooker({
        ...rest,
        url,
        type: 'inline',
        target,
    });
    return _jsx("div", { ref: setTarget, className: className, style: style });
}
//# sourceMappingURL=Booker.js.map