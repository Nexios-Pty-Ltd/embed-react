/**
 * Public event payload contracts for the @scheduleme/embed-react SDK.
 *
 * These mirror the wire protocol the embed iframe emits over postMessage
 * (the `scheduleme:*` events documented in the master plan §8). Keeping
 * them as named TypeScript types lets host code consume the events with
 * full intellisense — and lets the SDK author maintain the contract in
 * one place even when the iframe-side bus adds a new event.
 */
export {};
//# sourceMappingURL=types.js.map