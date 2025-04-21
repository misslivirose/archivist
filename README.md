# [WIP] Archivist

Archivist is a tool for analyzing your past via Facebook archives. Work in progress. Upload a .zip folder archive from Facebook, andAarchivist will display every message you've ever sent or received. What could possibly go wrong with this information?

<img width="1196" alt="image" src="https://github.com/user-attachments/assets/d8532f99-efc1-45f9-9ec2-225b0cd844ef" />

You can also search through messages, but to be honest, I'm not sure how good the search capability is yet.

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

Building Archivist:

TODO: Write more specific steps that specifically includes how to do this from a fresh clone. You have to do the `npm install` stuff and frankly I'm not in the mood to do it from scratch right now.


```npm run tauri dev``` - Development build

```npm run tauri build``` - Generate release build

Archivist has a --no-cache flag that can optionally be passed into the CLI, which can be useful for testing purposes.
