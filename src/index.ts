/**
 * @scheduleme/embed-react — typed React components for the ScheduleME
 * booking widget. See ../README.md for the install + customisation guide.
 */

export { Booker } from './Booker';
export type { BookerProps } from './Booker';

export { BookerPopup } from './BookerPopup';
export type { BookerPopupProps } from './BookerPopup';

export { BookerBadge } from './BookerBadge';
export type { BookerBadgeProps } from './BookerBadge';

export { useBooker } from './useBooker';
export type { UseBookerOptions, UseBookerResult } from './useBooker';

export type {
    BookerCommonProps,
    BookingConfirmedPayload,
    BookingFailedPayload,
    DateTimeSelectedPayload,
    EmployeeSelectedPayload,
    FunnelViewedPayload,
    PaymentStartedPayload,
    SchedulemeAnalytics,
    SchedulemeEventBase,
    SchedulemeEventMap,
    SchedulemeEventName,
    SchedulemeInstance,
    SchedulemePrefill,
    SchedulemeTheme,
    ServiceSelectedPayload,
} from './types';
