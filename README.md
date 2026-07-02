# Sanchez-AI

You talk, a fake Rick Sanchez insults you back — in his own cloned voice, with a face that actually moves when he talks. One HTML file. No backend except a 60-line proxy for the voice, and you don't even need that part.

**[→ Open it and get roasted](#)** *(https://dapper-semifreddo-b63957.netlify.app)*

![Rick.ai screenshot placeholder — replace with an actual GIF of the face talking](#)

---

## The story, allegedly

Rick went shopping for an AI. Browsed the whole market — every chatbot dressed up in a slightly different logo, every one of them polite, careful, and about as interesting as a Jerry. Not one had the nerve to just tell you the truth.

So he did what he always does when the universe disappoints him: built a better one himself, out of himself. Cloned his own voice, his own face, his own opinions about how dumb most questions are — and skipped every step a responsible person would've taken, like testing it or asking permission.

What's left is this. Now you get to use it too. Try not to waste it.

*(Open the app and you'll get the full version, delivered by the man himself, before he walks you through getting a key.)*

Yeah I built a chatbot. Big deal, everyone's built a chatbot. *This* one has a CSS-only face — no images, no canvas, no video, just div soup and math — that blinks on its own, opens its mouth when it's actually speaking, and pulls a different expression depending on whether it thinks your question is fascinating or whether it thinks you're an idiot. Which, statistically, is more often the second one.

## What it actually does

- **A face made entirely of borders and border-radius.** Pure CSS/HTML, zero images. It blinks unprompted, and its mouth animation is driven by real audio playback timing, not a canned loop — so lip movement roughly tracks what's actually coming out of the speaker.
- **A 7-slide intro** that opens with Rick's origin story — why he thinks every other AI on the market is garbage and why he built this one out of himself — before sliding into the actual setup walkthrough. Skippable, but it's the whole pitch in under a minute.
- **Nine expressions**, picked automatically by reading Rick's own reply: `talking`, `angry`, `smirk`, `thinking`, `sleep`, `surprised`, `manic`, `disgust`, `exasperated`. He decides how annoyed to look at you; you don't get a vote.
- **Gemini under the hood**, prompted to actually be Rick — brilliant and useful when your question deserves it, dismissive when it doesn't.
- **Optional live web results** via Google Custom Search, so he's not just guessing about anything time-sensitive.
- **Three voice modes**: type-only, browser TTS pitched down to something Rick-adjacent (free, no key), or his real cloned voice through Fish Audio (needs a key + a tiny proxy, described below).
- **Multiple chats**, saved to your browser, because apparently you want a *paper trail* of him being rude to you.
- **A setup tour** for the one person on Stardance who's never touched a Gemini API key before.

## Get it running

1. Open the HTML file. Chrome or Edge if you want voice input.
2. No key yet? Tour walks you through grabbing a free one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — thirty seconds, no card.
3. Paste it in the box up top, hit **CONNECT**.
4. Say something. Regret it.

Your key lives in that browser tab and nowhere else — never stored, never sent anywhere but straight to Google.

Three steps, one file, zero installs. If you were expecting a `git clone` and a `.env`, this isn't that kind of project.

## Picking a brain

Dropdown top-right, defaults to Gemini 2.5 Flash. Free tier covers most of the lineup:

| Model | Free tier |
|---|---|
| Gemini 2.5 Flash *(default)* | 5 RPM |
| Gemini 2.5 Flash Lite | 10 RPM |
| Gemini 3 Flash | 5 RPM |
| Gemini 3.1 Flash Lite | 15 RPM |
| Gemini 3.5 Flash | 5 RPM |
| Gemini 2 Flash / Lite, Gemini 2.5 Pro, Gemini 3.1 Pro | paid tier only |

Swap models mid-conversation. No reconnect, no drama.

## Giving him a real voice

Click **VOICE** on the left.

- **Voice in only** — your mic, speech-to-text, no key. Works out of the box.
- **His actual cloned voice** — needs a free [Fish Audio](https://fish.audio) key. Fish Audio's API is server-only and blocks direct browser calls, so there's a ~60-line Cloudflare Worker sitting in between: browser hits the Worker on a domain that isn't Fish Audio's, Worker forwards your key server-side, streams the mp3 back with open CORS. Free tier on Cloudflare's dashboard, deploys in a couple minutes.
- **Browser TTS** — built-in synthesis, pitched and slowed toward Rick-ish. No key, noticeably less Rick.

The mouth is timed to when the audio *actually* starts and stops, not a guess — so even on a slow network the face doesn't start flapping before there's any sound to go with it.

## Why it's one file

Because the whole point was: no install, no build, no "clone this and run `npm i`." You open an HTML file in a browser and it works. That constraint shaped everything — the face is CSS instead of sprites, state lives in `localStorage` instead of a database, and the only server-side code that exists at all is the Fish Audio proxy, which is optional and about as small as a proxy gets.

## The fine print

- Both free tiers *will* run out on you. Gemini gets busy or 429s you; Fish Audio can cut a sentence off mid-word once you hit its ceiling. Not a bug, just what "free" costs.
- Voice input needs a Chromium browser (`webkitSpeechRecognition` isn't standard yet).
- Everything's per-browser via `localStorage` — no accounts, no sync, no cloud.
- Search grounding needs its own Google Custom Search Engine ID on top of the Gemini key.

Built for Stardance. Get schwifty.
