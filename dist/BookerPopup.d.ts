import { type ReactNode } from 'react';
import type { BookerCommonProps } from './types';
/**
 * Popup embed — render-prop API so the host owns the trigger UI. The
 * popup itself (backdrop + close button + iframe) lives in the loader's
 * own DOM portal so no React state is needed for the open/close flicker.
 *
 * Example:
 *
 *   <BookerPopup url="https://acme.scheduleme.com.au" embedKey="pk_live_…">
 *       {(open) => <Button onClick={open}>Book a demo</Button>}
 *   </BookerPopup>
 *
 * The render prop receives `open` (typed as `() => void`); the second
 * argument is the live instance handle so advanced consumers can call
 * `.close()` or `.theme()` from anywhere in their tree.
 */
export interface BookerPopupProps extends BookerCommonProps {
    children: (open: () => void, instance: {
        close: () => void;
        ready: boolean;
    }) => ReactNode;
}
export declare function BookerPopup(props: BookerPopupProps): JSX.Element;
//# sourceMappingURL=BookerPopup.d.ts.map