# An Algerian BAC study app frontend

## From the problem to the implementation

An Algerian BAC study frontend for curriculum navigation, lesson reading and contextual study conversations.

Choose a stream → open a subject and lesson → mark progress → hand lesson context to chat → receive/cancel a mock streamed reply → restore local state after restart.

## Decisions and tradeoffs

The AIProvider contract separates the interface from an eventual model provider. Keyword and subject weighting are demo behavior, not retrieval or inference.

Local persistence makes the prototype useful across sessions without inventing a backend. Resetting storage removes those records.

Keeping Expo 54 avoids combining release documentation with a framework migration. Web export gives reviewers a lower-friction way to inspect the interface.

RTL is a layout decision throughout the UI, rather than a translated string layer alone.

## What the publication preparation established

Type checking and static Expo web export passed. An incremental Markdown parser could loop forever on a partial table header during streaming; its pure parser now has prefix regression checks. The default web preview uses the existing non-Skia fallback. Browser checks passed completed mock replies, conversation restoration after refresh and cancellation. Mock sign-in and the visible demonstration label are retained. Native device and opt-in CanvasKit verification are separate remaining checks.

## Deployment experience and evidence limits

Designed frontend application. Authentication and assistant replies are mocked; there is no deployed AI service implied.

Authentication and assistant responses are local mocks. The default browser fallback is the supported demonstration path; enabling EXPO_PUBLIC_ENABLE_SKIA_WEB=1 opts into a separately unverified CanvasKit path. No real AI, remote account security or cross-device synchronization is claimed.

## Next steps

Complete the uncovered checks above, record the results, and update the demonstration. Retain the existing architecture and add reproducible synthetic cases before claiming performance improvements or another provider integration.
