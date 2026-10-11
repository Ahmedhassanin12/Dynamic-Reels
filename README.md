# Arabic Reel Project Architecture

**Arabic Reel** is a programmatic video generation tool built using [Remotion](https://www.remotion.dev/). It allows developers to create high-quality, animated Arabic educational reels/videos directly from code. 

By combining React-based scene composition with automated word-level speech-to-text synchronization, it transforms an audio file and a declarative script into a fully animated `.mp4` video.

##  Tech Stack

*   **Core Engine**: [Remotion](https://www.remotion.dev/) (React 19, TypeScript) for programmatic video rendering.
*   **Speech-to-Text**: Python with `faster-whisper` for offline, word-level Arabic transcription.
*   **UI/Rendering**: Built-in Remotion primitives, custom React components, CSS-in-JS styling.

## 📂 Project Structure

```text
arabic-reel/
├── package.json              # Project dependencies and script definitions
├── tsconfig.json             # TypeScript configuration
├── scripts/                  # Workflow utility scripts
│   ├── new-episode.mjs       # Scaffolds boilerplate for new episodes
│   └── transcribe.py         # Uses Whisper to transcribe audio -> words.json
├── public/                   # Global static assets (e.g. character image)
└── src/                      # Source code
    ├── Root.tsx / Reel.tsx   # Core Remotion compositions & video player setup
    ├── types.ts              # Type definitions (Scene configs, Words, etc.)
    ├── components/           # Core UI elements (Captions, Character, Transitions)
    ├── episodes/             # One self-contained folder per episode (index.ts + words.json + voice.mp3)
    ├── lib/                  # Utilities (Captions parsing, timeline resolving)
    ├── scenes/               # Scene templates (Statement, Code, Diagram, Compare)
    └── viz/                  # Data/Algorithmic visualizers (e.g., ScanViz, LookupViz)
```

## 🏗 Architecture & Core Concepts

The architecture relies on a **Declarative Timeline** driven by the transcribed audio. 

1.  **Episodes & Scenes**: An episode is defined in `src/episodes/<id>/index.ts` using the `defineEpisode` function. It contains a list of **Scenes** (e.g., a code snippet, a diagram, or a comparison table).
2.  **Audio Syncing (`at` anchors)**: Scenes are synchronized to the audio using the `at` property. A scene can start precisely when a specific word is spoken (by supplying a string match or word index). The `lib/timeline.ts` module calculates precise frame durations based on these anchors.
3.  **Captions**: The `Captions.tsx` component parses `words.json` and renders spring-animated Arabic captions that pop up in real-time as words are spoken.
4.  **Scene Registry**: The `src/scenes/registry.ts` maps semantic scene declarations (like `kind: 'codeDemo'`) to their respective React components, making the engine highly extensible.

##  The Pipeline Workflow

Creating a new reel follows a well-defined 5-step pipeline:

1.  **Scaffold**: 
    Run `npm run new-episode -- <topic-name>`. This creates `src/episodes/<topic-name>/` and registers the episode in `src/episodes/index.ts`.
2.  **Voiceover**: 
    Record the audio track and place it at `src/episodes/<topic-name>/voice.mp3`. In the episode's `index.ts`, uncomment `import voice from './voice.mp3'` and set `voice` (instead of `null`).
3.  **Transcribe**: 
    Run `npm run transcribe -- <topic-name>`. The Python script utilizes `faster-whisper` to analyze the audio and generate a `words.json` file containing highly accurate start/end timestamps for every spoken Arabic word.
4.  **Authoring**: 
    Edit the episode's `index.ts` file to declare visual scenes. Scenes are synced to the speech using textual anchors (e.g., `at: 'الحل'` triggers a scene when the word "الحل" is spoken).
5.  **Render**: 
    *   Preview in browser: `npm run dev` (opens Remotion Studio).
    *   Export to video: `npm run render -- <topic-name> out/my-topic.mp4`.
