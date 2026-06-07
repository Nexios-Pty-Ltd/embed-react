import { Fragment as _Fragment, jsx as _jsx } from "react/jsx-runtime";
import { useCallback, useState } from 'react';
import { useBooker } from './useBooker';
export function BookerPopup(props) {
    const { children, url, ...rest } = props;
    const [ready, setReady] = useState(false);
    const { instance } = useBooker({
        ...rest,
        url,
        type: 'popup',
    });
    // Mirror the hook's ready state into local so render-prop receives a
    // stable boolean.
    if (instance && !ready)
        setReady(true);
    const open = useCallback(() => {
        instance?.open?.();
    }, [instance]);
    const close = useCallback(() => {
        instance?.close?.();
    }, [instance]);
    return _jsx(_Fragment, { children: children(open, { close, ready }) });
}
//# sourceMappingURL=BookerPopup.js.map