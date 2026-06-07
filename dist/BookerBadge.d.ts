import type { BookerCommonProps } from './types';
/**
 * Floating badge — fixed-position button that opens a popup on click.
 * The badge itself is rendered in `document.body` by the loader; this
 * component is a side-effect-only mount that exists purely to manage
 * the lifecycle (init on mount, destroy on unmount).
 *
 * Example:
 *
 *   <BookerBadge
 *       url="https://acme.scheduleme.com.au"
 *       embedKey="pk_live_…"
 *       text="Book a meeting"
 *       position="bottom-right"
 *   />
 */
export interface BookerBadgeProps extends BookerCommonProps {
    /** Button label. Defaults to "Book a meeting". */
    text?: string;
    /** Background colour. Defaults to neutral if not supplied. */
    color?: string;
    /** Foreground colour. Defaults to a contrasting tone for the background. */
    textColor?: string;
    /** Anchor corner. Defaults to 'bottom-right'. */
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}
export declare function BookerBadge(props: BookerBadgeProps): JSX.Element | null;
//# sourceMappingURL=BookerBadge.d.ts.map