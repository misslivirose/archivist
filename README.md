# [WIP] Archivist

Archivist is a tool for analyzing your past via Facebook archives. Work in progress. Upload a .zip folder archive from Facebook, and Archivist will display every message you've ever sent or received. What could possibly go wrong with this information?

<img width="1487" alt="image" src="https://github.com/user-attachments/assets/c8039e23-7168-4a74-8be6-2eadedd4c628" />

You can also search through messages and conversations, and filter to specific years/senders.

This builds on a previous experiment that I built, ['A Brief Memory'](https://liverickson.com/blog/?p=503), which you can view [here](https://harvest-secretive-hydrofoil.glitch.me/)

## Features
Archivist currently:
* Allows you to select a Facebook archive [read how to archive your Facebook information](https://www.facebook.com/help/284581436192616/)
* Extracts the directory to a temporary file location on your local machine
* Searches for all message and timeline posts in the archive within `your_facebook_activity` and generates a single JSON file with all of the message and timeline content
* Creates a searchable table of all messages and timeline posts
* Lets you query messages from a local large language model (if you have Ollama setup)

Future work includes:
* Making a nice overview page of your message history year by year
* Visualizing your timeline
* Maybe something to do with photos? TBD. Let me know in the comments. Don't forget to like and subscribe.

## Building & Running Archivist

Archivist is built with Tauri v2. It is a Rust + Vite + React application that uses Tailwind for styling. The LLM agent capability is built assuming you have an Ollama server running on http://localhost:11434/. It is currently using Qwen2.5 but you can change the following in App.jsx to use a different endpoint:

```
const response = await fetch("http://localhost:11434/api/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "qwen2.5",
    prompt: `${context}\n\n${agentInput}`,
    stream: false,
    }),
  });
```
<img width="825" alt="image" src="https://github.com/user-attachments/assets/801be52a-8576-49a2-8c75-5b4d2065cc29" />

Building Archivist:

1. Install Rust
2. Clone the GitHub repo
3. Run `npm install`

```npm run tauri dev``` - Development build

```npm run tauri build``` - Generate release build

Archivist has a --no-cache flag that can optionally be passed into the CLI, which can be useful for testing purposes.
