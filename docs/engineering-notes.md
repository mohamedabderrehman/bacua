## A frontend with a clear integration boundary

BACUA explores an Algerian BAC study experience through onboarding, stream selection, structured lessons, progress and contextual chat. Its value is in the interface and state transitions. Authentication and assistant replies are mocked; the AIProvider contract marks where a real service could later connect without claiming that integration exists today.

Conversations and reading progress persist locally. Lesson context can move into a conversation, streamed text updates the interface, and cancellation stops an in-progress mock reply. These interactions require consistent state across navigation, refresh and interrupted output. Explicit RTL choices and Arabic typography are part of the layout rather than a translated label layer.

## Treating streamed text as incomplete input

During release review, a partial Markdown table header could make the parser loop indefinitely. A message that is valid when complete can be invalid at one of its streaming prefixes. The extracted pure parser now has prefix regression checks, including incomplete headers and Arabic text.

The supported web demonstration uses the existing non-Skia fallback. CanvasKit and native device rendering remain separate checks. Future work can connect a real provider, evaluate lesson retrieval and verify accessible device behavior; those belong to the roadmap, not the implemented feature list.
