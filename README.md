# @Nexios-Pty-Ltd/embed-react

Typed React components for the [ScheduleME](https://scheduleme.com.au) booking
widget. Wraps the vanilla `embed.js` loader so React apps get full
intellisense for the event protocol, prefill payloads, and theme overrides
— and SSR-safe defaults so the package ships cleanly inside Next.js,
Remix, Astro, and any other framework that pre-renders.

> **v0.1.0** — Phase F.1 scaffold. The package source lives in the
> ScheduleME monorepo under `packages/embed-react/`. Releases are
> published to the standalone GitHub repo
> [`Nexios-Pty-Ltd/embed-react`](https://github.com/Nexios-Pty-Ltd/embed-react)
> for direct git-install consumption. **Not on npm by design** — see
> EMBED.md for the rationale.

---

## Install

Released via GitHub (not npm). Pin to a tagged release:

```bash
npm install github:Nexios-Pty-Ltd/embed-react#v0.1.0
# or
pnpm add github:Nexios-Pty-Ltd/embed-react#v0.1.0
# or
yarn add Nexios-Pty-Ltd/embed-react#v0.1.0
```

Public repo — no `.npmrc` config or auth token required. Your
`package.json` ends up with:

```jsonc
{
    "dependencies": {
        "@Nexios-Pty-Ltd/embed-react": "github:Nexios-Pty-Ltd/embed-react#v0.1.0"
    }
}
```

Import paths are unchanged from a regular npm install — the package's
own `name` field still resolves the import:

```tsx
import { Booker } from '@Nexios-Pty-Ltd/embed-react';
```

React 17/18/19 are all supported via the package's peer dependency
range. **Upgrading:** bump the tag in your `package.json` and re-run
`npm install`. Dependabot/Renovate both support git-URL deps but need
explicit configuration — see [docs](https://docs.renovatebot.com/modules/datasource/github-tags/).

## Three components

The SDK ships three components that mirror the loader's three embed modes:

| Component | Use case |
|---|---|
| `<Booker />` | Inline embed — booking widget appears in-page where you mount it |
| `<BookerPopup />` | Click-to-open modal — render-prop owns the trigger UI |
| `<BookerBadge />` | Floating "Book" button anchored to a screen corner |

All three accept the same core props (URL, embed key, prefill, theme,
analytics, event callbacks) and differ only in their type-specific options
(target / trigger / badge).

### Inline

```tsx
import { Booker } from '@Nexios-Pty-Ltd/embed-react';

export function ContactPage() {
    return (
        <Booker
            url="https://acme.scheduleme.com.au"
            embedKey="pk_live_..."
            service={42}                              // optional pre-select
            prefill={{ name: 'Jane', email: 'jane@acme.com' }}
            theme={{ brandColor: '#5b21b6', mode: 'dark' }}
            onBookingConfirmed={(b) => analytics.track('Booking Confirmed', b)}
        />
    );
}
```

### Popup (render-prop)

```tsx
import { BookerPopup } from '@Nexios-Pty-Ltd/embed-react';

export function CTA() {
    return (
        <BookerPopup url="https://acme.scheduleme.com.au" embedKey="pk_live_...">
            {(open) => (
                <Button onClick={open}>Book a demo</Button>
            )}
        </BookerPopup>
    );
}
```

The render-prop receives `open` (a `() => void` that opens the popup) and
a small handle exposing `close` + `ready`.

### Floating badge

```tsx
import { BookerBadge } from '@Nexios-Pty-Ltd/embed-react';

export function App() {
    return (
        <>
            <YourSite />
            <BookerBadge
                url="https://acme.scheduleme.com.au"
                embedKey="pk_live_..."
                text="Book a meeting"
                position="bottom-right"
            />
        </>
    );
}
```

### Programmatic — `useBooker`

For full control (custom trigger, programmatic open/close from anywhere in
your tree), reach for the underlying hook:

```tsx
import { useBooker } from '@Nexios-Pty-Ltd/embed-react';

function CustomBookFlow() {
    const { instance, ready, error } = useBooker({
        type: 'popup',
        url: 'https://acme.scheduleme.com.au',
        embedKey: 'pk_live_...',
    });

    if (error) return <p>Booking widget failed to load: {error.message}</p>;
    return (
        <Button onClick={instance?.open} disabled={!ready}>
            Book a demo
        </Button>
    );
}
```

## Prefill

Two paths:

1. **URL form** — pass `prefill` directly to the component. Values appear
   in the iframe URL, so use this when the data is non-sensitive or the
   host already has it client-side.

   ```tsx
   <Booker
       url={url}
       embedKey={key}
       prefill={{
           name:  'Jane Smith',
           email: 'jane@acme.com',
           phone: '+61400000000',
           customFields: { how_did_you_hear: 'twitter' },
       }}
   />
   ```

2. **Signed token** — server-issued, single-use, embed-key-scoped. The
   PII never appears in the URL bar, browser history, or Referer header.

   ```bash
   # Your server-side, after authenticating the visitor:
   curl -X POST https://acme.scheduleme.com.au/api/v1/embed/prefill-tokens \
        -H "Content-Type: application/json" \
        -d '{ "embed_key": "pk_live_...", "expires_in": 600,
              "prefill": { "name": "Jane", "email": "jane@acme.com" } }'
   # → { "token": "pf_live_...", "expires_at": "..." }
   ```

   ```tsx
   // Client-side:
   <Booker url={url} embedKey={key} prefillToken={tokenFromServer} />
   ```

## Theme

Static via props:

```tsx
<Booker
    url={url}
    embedKey={key}
    theme={{ brandColor: '#5b21b6', fontFamily: 'Inter', mode: 'dark' }}
/>
```

Reactive — change the `theme` prop and the booking surface updates in
place without a reload:

```tsx
const [mode, setMode] = useState<'light' | 'dark'>('light');

<Booker url={url} embedKey={key} theme={{ mode }} />;
```

## Event callbacks

Each component accepts typed event callbacks. The payload shapes are
documented in [`src/types.ts`](src/types.ts) and exported from the package
root.

```tsx
<Booker
    url={url}
    embedKey={key}
    onBookingConfirmed={(payload) => {
        // payload.unique_id, payload.datetime, payload.services, payload.value, payload.currency
        track('purchase', { value: payload.value, currency: payload.currency });
    }}
    onBookingFailed={(payload) => {
        // payload.code, payload.message
        console.warn('Booking failed', payload);
    }}
/>
```

For finer-grained funnel events (`funnel:service_selected`,
`funnel:time_selected`, etc.) use the loader's global `on()` directly or
reach for `useBooker` and call `getScheduleMEGlobal()`.

## Analytics auto-wire

If you have GA4, GTM, Meta Pixel, or TikTok Pixel installed on the host
page, the loader auto-bridges funnel events into them without any
follow-up code. Either configure the IDs in the embed key configurator
(server-side, recommended) or pass them inline:

```tsx
<Booker
    url={url}
    embedKey={key}
    analytics={{
        ga4_measurement_id: 'G-XXXXXXX',
        gtm_container_id: 'GTM-XXXX',
        meta_pixel_id: '123456789',
    }}
/>
```

Standard ecommerce mappings:

| `scheduleme:*` event | GA4 / GTM | Meta | TikTok |
|---|---|---|---|
| `funnel:viewed` | `view_item` | `ViewContent` | `ViewContent` |
| `funnel:time_selected` | `add_to_cart` | `AddToCart` | `AddToCart` |
| `funnel:payment_started` | `begin_checkout` | `InitiateCheckout` | `InitiateCheckout` |
| `booking:confirmed` | `purchase` | `Purchase` | `CompletePayment` |

## SSR safety

Every component is SSR-safe — DOM access is gated behind `useEffect`, so
server-rendered output is just an empty `<div>` (Booker), `null` (Badge),
or whatever your render-prop returns (Popup). Hydration on the client
kicks the loader fetch and the iframe appears.

## TypeScript

The package is written in TypeScript and exports types for every prop,
event payload, and instance handle. No `any` casts in your call sites.

## License

MIT.
