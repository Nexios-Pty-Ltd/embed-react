/**
 * Public event payload contracts for the @scheduleme/embed-react SDK.
 *
 * These mirror the wire protocol the embed iframe emits over postMessage
 * (the `scheduleme:*` events documented in the master plan §8). Keeping
 * them as named TypeScript types lets host code consume the events with
 * full intellisense — and lets the SDK author maintain the contract in
 * one place even when the iframe-side bus adds a new event.
 */

/** Common fields every event carries — useful for typing the catch-all on() handler. */
export interface SchedulemeEventBase {
    /** Loader-tagged source — always 'scheduleme' for outbound events. */
    source: 'scheduleme';
    /** Protocol version. Bumped only on breaking changes; today: 1. */
    version: 1;
}

export interface FunnelViewedPayload {
    step?: number;
}

export interface ServiceSelectedPayload {
    step?: number;
    serviceId?: number;
    serviceName?: string;
    price?: number;
}

export interface EmployeeSelectedPayload {
    step?: number;
    employeeId?: number;
    employeeName?: string;
}

export interface DateTimeSelectedPayload {
    step?: number;
    datetime?: string;
}

export interface PaymentStartedPayload {
    step?: number;
    amount?: number;
    currency?: string;
}

export interface BookingConfirmedPayload {
    /** Stable identifier for the booking; appears in the confirmation email + URL. */
    unique_id?: string;
    /** ISO-8601 start time. */
    datetime?: string;
    /**
     * Services on the booking. Always an array even for a single-service
     * appointment so the host's ecommerce payload mapping is uniform.
     */
    services?: Array<{ id?: number; name?: string; price?: number }>;
    value?: number;
    currency?: string;
    /** Payment lifecycle marker. `pending_payment` is non-terminal. */
    payment_status?: 'paid' | 'pending_payment' | 'deposit_paid' | 'pay_later' | null;
}

export interface BookingFailedPayload {
    step?: number;
    code?: string;
    message?: string;
}

/** Map of every supported event name to its payload shape. */
export interface SchedulemeEventMap {
    'funnel:viewed': FunnelViewedPayload;
    'funnel:service_selected': ServiceSelectedPayload;
    'funnel:employee_selected': EmployeeSelectedPayload;
    'funnel:date_selected': DateTimeSelectedPayload;
    'funnel:time_selected': DateTimeSelectedPayload;
    'funnel:form_started': { step?: number };
    'funnel:payment_started': PaymentStartedPayload;
    'booking:confirmed': BookingConfirmedPayload;
    'booking:failed': BookingFailedPayload;
}

export type SchedulemeEventName = keyof SchedulemeEventMap;

/**
 * Theme update payload. Same shape as the embed key's server-side
 * `default_theme`; passing this via the SDK overlays the server defaults
 * for the lifetime of the React component (or page navigation).
 */
export interface SchedulemeTheme {
    /** Brand colour in hex, e.g. '#5b21b6'. Sets `--primary` in the iframe. */
    brandColor?: string;
    /** Font family the iframe should adopt — host loads the font file. */
    fontFamily?: string;
    /** 'auto' follows host `prefers-color-scheme`; explicit wins. */
    mode?: 'auto' | 'light' | 'dark';
}

/**
 * Prefill payload. The fields here mirror what the configurator stores
 * server-side; customFields keys come from `BookingFormField.key` so the
 * booking form binds the value to the right input.
 */
export interface SchedulemePrefill {
    name?: string;
    email?: string;
    phone?: string;
    /** Custom form fields keyed by BookingFormField.key. */
    customFields?: Record<string, string>;
}

/**
 * Analytics IDs the loader auto-bridges funnel events into. Usually
 * configured server-side via the embed key configurator, but the SDK
 * accepts them inline for environments where the host doesn't want to
 * round-trip through the configurator.
 */
export interface SchedulemeAnalytics {
    ga4_measurement_id?: string;
    gtm_container_id?: string;
    segment_write_key?: string;
    meta_pixel_id?: string;
    tiktok_pixel_id?: string;
}

/** Shared init options across every embed type. */
export interface BookerCommonProps {
    /** Tenant origin, e.g. 'https://acme.scheduleme.com.au'. */
    url: string;
    /** Public embed key (`pk_live_…` or `pk_test_…`). Optional in legacy mode. */
    embedKey?: string;
    /** Pre-select a service by ID. */
    service?: number | string;
    /** Pre-select an employee by ID. */
    employee?: number | string;
    /** Override the browser-detected timezone. */
    timezone?: string;
    /** Prefill payload. Lower trust than `prefillToken` because the values appear in the URL. */
    prefill?: SchedulemePrefill;
    /** Server-issued single-use token from POST /api/v1/embed/prefill-tokens. Preferred for PII. */
    prefillToken?: string;
    /** Theme overrides applied on top of the embed key's server-side defaults. */
    theme?: SchedulemeTheme;
    /** Analytics IDs for the loader's GA4/GTM/Meta/TikTok auto-bridge. */
    analytics?: SchedulemeAnalytics;

    onBookingConfirmed?: (payload: BookingConfirmedPayload) => void;
    onBookingFailed?: (payload: BookingFailedPayload) => void;
    onError?: (err: Error) => void;
}

/**
 * Internal — the global the loader installs on `window`. Hosts should
 * never reach for this directly; the React components own the lifecycle.
 */
export interface ScheduleMEGlobal {
    version?: string;
    (action: 'init', options: Record<string, unknown>): SchedulemeInstance | null;
    (action: 'on', event: SchedulemeEventName, cb: (payload: unknown) => void): void;
    (action: 'theme', theme: SchedulemeTheme): void;
    (action: 'destroy'): void;
    init?: (options: Record<string, unknown>) => SchedulemeInstance | null;
    q?: IArguments[];
}

export interface SchedulemeInstance {
    type: 'inline' | 'popup' | 'badge';
    iframe?: HTMLIFrameElement;
    open?: () => void;
    close?: () => void;
    theme?: (t: SchedulemeTheme) => void;
    destroy: () => void;
}
