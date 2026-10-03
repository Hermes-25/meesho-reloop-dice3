# One-tap hosted voice search

User intent: remove engine/language choices, eliminate local speech-model loading, improve the path to Hindi/Hinglish transcription while retaining strictly free service.

## Implementation

- One Speak to search button starts recording; two seconds of silence after sustained sound ends a clip, or the user taps Done. No-speech timeout: 10 seconds; recording cap: 25 seconds.
- MediaRecorder capture -> local resample to 16 kHz mono PCM WAV -> same-origin POST /api/voice -> authenticated D1 quota check -> Groq Whisper Large v3 -> editable search text. No automatic bid or purchase.
- No browser SpeechRecognition dependency, no local Whisper model download, no language dropdown. Groq receives a short recording; audio is not stored by ReLoop. Automatic language detection preserves a single path; a brief bilingual stock vocabulary prompt gives context.
- GROQ_API_KEY is server-only in Vercel Production. No paid fallback. Stay on Groq Free plan; provider quota exhaustion yields a clear typed-search fallback.
- Backend authorization is only callable with the existing private gateway header and a valid user/demo session. D1 caps: 8 clips/person/10 min, 16 clips/IP/10 min, 12/min globally, 120/hour globally, 600/day globally. Each clip is server-validated as <=25s; fixed-window caps do not guarantee provider availability, especially if the key is shared elsewhere.
- Cancel/unmount releases microphone tracks, recording, meter, AudioContext and in-flight request. Cancellation during asynchronous capture/transcription ignores late results.
- Server validates WAV headers, payload size, channel/sample format, duration and signal energy before quota/inference. Provider errors and secrets never reach client logs or error text.
- Existing market, account, photo and review-comment tables are preserved. No migration required; quotas use app_limits. All 20 comments were backed up before release.

## Evidence and limitations

15 app tests and 11 backend tests passed before deployment. The production market UI was visually checked after reload: one microphone button, language hint and audio-processing disclosure, without voice setup menus. Existing demo session survived the deployment.

Live API tests used public recordings and temporary buyer demo sessions (no personal recordings or exposed credentials):

- English speech fixture: HTTP 200, 4.097 seconds for the transcription request, with the expected sentence returned.
- Sarvam's public product-refund example, first 20 seconds: HTTP 200, 4.618 seconds. This sample was English, so it is not Hindi evidence.
- Nexdata public Hindi sample G01362S1030, 3.528 seconds of audio: HTTP 200, 3.256 seconds. Hindi script was returned; lexical errors remained when compared with its reference.
- Nexdata public Hindi sample G01674S2244, 3.940 seconds of audio: HTTP 200, 3.177 seconds. Hindi script and the question were recovered, with a resort-name/spelling error.

These are integration checks, not an accuracy benchmark or latency guarantee. Mixed Hindi-English stock queries, noisy shops, real microphone capture on iOS/Android and different accents still require representative user testing. No claim that Hindi accuracy is solved. Request latency above excludes recording and browser audio conversion.

Sources for test samples: https://github.com/sarvamai/sarvam-ai-cookbook/tree/main/sample_data/call_analytics_audios and https://github.com/Nexdata-AI/759-Hours-Hindi-Speech-Data-by-Mobile-Phone . Samples were processed transiently for checks and were not added to the production app.

## Release

- Vercel production deployment: dpl_AsM2tt59FdQjpoBidFn58vLeX9ft (READY), https://reloop-source.vercel.app . GROQ_API_KEY was entered by the user in Production; its value was not read or logged.
- Backend version 8: appgprj_6ab54a00bcfc8191a872203ce6536594~appgver_5831ec013d008191b1864161d721e3da . Source commit: 0040fb9660a89194112c9e9ac5f17106a7cd9ae5 . Deployment appgdep_6ab881f251788191817a3c8221ccadf0 succeeded.
- Post-deployment comparison: 20 original review comments, 20 after release, zero changed original comments. No market/account/photo schema migration.
- UI evidence: output/hosted-voice-live-2026-09-27.png (workspace root).

Official references: https://console.groq.com/docs/speech-to-text and https://console.groq.com/docs/rate-limits (checked 27 September 2026). Groq recommends whisper-large-v3 for error-sensitive multilingual work; free-plan limits are account-specific and can change.

The earlier technical image slides describe the previous local-Whisper architecture. Regenerate slide 2 before presenting it as the new release; semantic E5 and photo CLIP still run locally.
