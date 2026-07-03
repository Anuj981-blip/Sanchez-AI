# Sanchez-AI

You speak, a Rick Sanchez look-alike abuses you in return using his own cloned voice,All in one HTML file.No server side required except the 60-line proxy for the voice, but even that isn't necessary.

**[→ Go and get roasted](#)** *(https://anuj981-blip.github.io/Sanchez-AI/)*

<img width="340" height="408" alt="Screenshot 2026-07-03 at 1 58 33 AM" src="https://github.com/user-attachments/assets/f31745e6-d9e0-4e20-9da3-815b6bd63e26" />


---

## The story, (allegedly)


Rick decided to purchase an AI. Looked through all the market — each chatbot in its unique logo, each of them was polite, cautious, and as dull as a Jerry. Not one of them was ready to tell the absolute truth.

Thus, Rick did what he usually does in case if the universe fails him — he created a new one himself, out of himself. Duplicated his voice, his face, his opinion about how stupid most of the questions are and bypassed all the necessary steps such as testing and permission to ask.

And here is the result of it. Now it's your turn to use it yourself. Try not to mess with it.

(Open the app and you will receive the full version of the bot, delivered by the author personally, followed by instructions on how to get the key.)

Yeah, I created a chatbot. Who cares? Everyone creates a chatbot. It has a CSS-only face — without images, without canvas, without videos, just div soup and math that chooses facial expressions based on if it finds the question fascinating or if it finds you an idiot. And usually, it is the latter one.

## What it actually does

- **A face made up entirely of borders and border-radius.** No pictures required! Blinks on its own, and its eyes and transformation to pickle rick is triggered by real emotion detection, not some sort of set loop – so lip syncs to actual speech.
- **7-slide introduction** starting with an explanation of Rick's origin – why he believes that all the other AIs on the market are rubbish and why he made this one out of himself – and then moves onto the actual introduction. Skip if you want, but the entire pitch in under a minute.
- **Nine automatic faces** depending on what Rick detects in your message: `talking`, `angry`, `smirk`, `thinking`, `sleep`, `surprised`, `manic`, `disgust`, `exasperation`. Decides how irritated with you he wants to be; you have no say in the matter.
- **Optional live results from the web** using Google Custom Search, so he doesn't make assumptions about any time-sensitive information.
- **Multiple chats**, stored in your browser, because for whatever reason, you want proof that he's being rude to you.
- **A guide for the sole person  who hasn't used a Gemini API key yet.**

## Start it up

1. Launch the HTML page. Chrome or Edge if you need voice input.
2. Haven't got your key yet? The tour will guide you through getting yourself a free one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey), taking about half a minute with no card involved.
3. Enter it in the little box above, press **CONNECT**.
4. Speak some nonsense. Then immediately regret it.

The API key is only stored inside your open browser tab and nowhere else.

Three steps, one page, zero installations. If you expected there to be a `git clone` and an `.env` file in here, this ain't that sort of codebase.

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

Tap **VOICE** on the left.

- **Voice in only** – just your mic, speech-to-text recognition without a key. This one comes right out of the box.
- **His actual cloned voice** – this one needs you to have a free [Fish Audio](https://fish.audio) key. Fish Audio’s API can be accessed from the server but doesn’t allow direct calls from the browser, which is why there is a ~60-line Cloudflare Worker in-between: browser sends requests to the Worker that resides on a non-Fish Audio domain; the Worker forwards your key server-side and streams mp3 back with CORS enabled. Free plan on Cloudflare console, quick setup in a few minutes.
- **Browser TTS** – native synthesis with pitch and tempo adjusted to resemble Rick’s voice better. No key needed, sounds slightly less like Rick compared to the two above.

Face movement is synchronized with the voice, not predicted, so in case of a slow connection the face won’t start flapping before the first note gets played.

## Why it's one file

And all because the entire idea was to avoid installation, construction, and the need to "clone it and run npm i." You open up an HTML file in your browser and it runs. This requirement determined everything else – the face is made of CSS, not sprites; the state is stored in `localStorage`, not a database; there is absolutely no server-side logic, aside from the Fish Audio proxy, which is an optional feature.

## The fine print

- Neither of the free plans *will* run out on you. Gemini starts lagging and 429-ing, while Fish Audio is perfectly able to truncate a sentence somewhere in the middle when it hits its quota. Just how "free" is.
- Voice commands require a Chromium-based browser (`webkitSpeechRecognition` API hasn’t been standardized yet).
- All settings browser-specific using `localStorage` — no accounts, no sync, no clouds.
- Searching requires a Google Custom Search Engine ID in addition to the Gemini one.
  
Built for Stardance. Get schwifty.
