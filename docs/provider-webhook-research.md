# Provider webhook research

This implementation uses provider-agnostic callback foundations based on the following primary documentation reviewed on 2026-08-26.

| Provider | Verified behavior | Source |
|---|---|---|
| Slack | Slack Events API supports HTTP request URLs or Socket Mode. HTTP callbacks are JSON POST requests, include `event_id`, and Slack recommends signed-secret verification rather than the deprecated token mechanism. | [Slack Events API](https://docs.slack.dev/apis/events-api/) |
| DocuSign | DocuSign Connect provides account-, recipient-, envelope-, and organization-level webhook configurations. It sends HTTPS POST notifications and retries failed delivery with exponential backoff. | [DocuSign Connect overview](https://developers.docusign.com/platform/webhooks/connect/) |
| Salesforce | Salesforce Platform Events provide an event-driven integration surface; adapter implementation should use the tenant's approved Salesforce Connected App and event/API policy. | [Salesforce Platform Events](https://developer.salesforce.com/docs/atlas.en-us.platform_events.meta/platform_events/platform_events_intro.htm) |

The repository callback foundation validates provider type, external event ID, signature, payload hash, duplicate event IDs, and tenant-scoped event persistence before publishing a domain event. Provider credentials remain configuration-dependent and are never returned to the frontend.
