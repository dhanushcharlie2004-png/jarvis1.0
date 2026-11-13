# JARVIS PWA — bilingual local AI starter

A beginner-friendly Progressive Web App starter for Android. It uses WebLLM to run a small Qwen model in the browser with WebGPU. No paid API key is used.

## Important limitations (read first)

- This is a **starter project**, not a full Iron Man assistant.
- The model runs locally in the browser after its first download. The first model download is large (roughly hundreds of MB; exact size depends on model/version). Keep Wi-Fi and storage available.
- Android must have a compatible browser/device with WebGPU. If WebGPU is unavailable or memory is insufficient, local inference will not start. A small model may still be slow on a phone.
- Browser speech recognition is **not guaranteed to be offline or private**. Chrome/device speech recognition may use an online service. The chat model itself runs locally after download. Text-to-speech normally uses installed device voices.
- Choose Tamil or English voice input from the language selector. Automatic Tamil/English speech-language detection is not implemented; choose the language before speaking.
- PWA installation does not mean the AI can run continuously in the background. Keep the app open while chatting.
- Google Fonts and the WebLLM module are fetched from the internet. The UI shell can be cached, but initial setup/model download requires internet. For strict offline use, self-host dependencies and ensure the model cache is complete.

## 1. What you need

- A GitHub account.
- Android phone with a recent Chrome version.
- A WebGPU-capable browser/device.
- Wi-Fi and enough free storage for the model cache.

## 2. Test locally (on a computer)

1. Extract the ZIP.
2. Open the project folder in VS Code.
3. Start a local web server. For example, with Python installed:
   ```bash
   python -m http.server 8000
   ```
4. Open `http://localhost:8000` in a browser that supports WebGPU.
5. Tap **Load local AI model** and wait for the download and initialization.
6. Ask a question in Tamil or English.

Do not open `index.html` by double-clicking it; ES modules and service workers need a web server/HTTPS.

## 3. Publish free with GitHub Pages

1. Create a new **public** GitHub repository, for example `jarvis-pwa`.
2. Upload all files and the `icons` folder from this project.
3. Open repository **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for the Pages URL to appear. It will look like `https://YOUR-USERNAME.github.io/jarvis-pwa/`.

GitHub Pages is static hosting; this project does not need a Python server in production.

## 4. Install on Android

1. Open your GitHub Pages URL in Chrome.
2. Wait until the page loads over HTTPS.
3. Open Chrome's three-dot menu.
4. Choose **Install app** or **Add to Home screen**.
5. Open JARVIS from the new home-screen icon.

## 5. Voice settings

The starter uses Tamil speech recognition:
```js
recognition.lang = "ta-IN";
```
For English, use:
```js
recognition.lang = "en-IN";
```
Speech recognition support and language availability depend on browser/device. For better bilingual handling, add a language selector or use an on-device speech-to-text model in a later version.

## 6. Troubleshooting

- **WebGPU not detected:** update Chrome/Android System WebView and check device/browser WebGPU support. Some phones do not support it.
- **Model fails or tab closes:** close other apps/tabs, free storage/RAM, use Wi-Fi, and try again. The 0.5B model is deliberately small, but phone resources vary.
- **No voice input:** use Chrome, grant microphone permission, or type instead.
- **No Tamil voice output:** install/enable a Tamil text-to-speech voice in Android settings if available.
- **Page not installing:** confirm the site uses HTTPS and that `manifest.webmanifest`, icons and service worker load without errors.

## Project files

- `index.html` — page layout
- `style.css` — JARVIS-style UI
- `app.js` — local model, chat, speech input/output
- `manifest.webmanifest` — PWA metadata
- `sw.js` — basic app-shell cache
- `icons/` — app icons

## Privacy note

The AI chat prompt is sent to the model running in the browser; this code does not send chat text to a hosted LLM API. The speech recognition browser API may process audio using a remote service, depending on the browser/device. Do not use sensitive/private information until you have verified your speech provider's privacy behavior.
