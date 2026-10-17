# Arabic Reel Project Architecture

**Arabic Reel** is a programmatic video generation tool built using [Remotion](https://www.remotion.dev/). It allows developers to create high-quality, animated Arabic educational reels/videos directly from code. 

By combining React-based scene composition with automated word-level speech-to-text synchronization, it transforms an audio file and a declarative script into a fully animated `.mp4` video.

##  Tech Stack

*   **Core Engine**: [Remotion](https://www.remotion.dev/) (React 19, TypeScript) for programmatic video rendering.
*   **Speech-to-Text**: Python with `faster-whisper` for offline, word-level Arabic transcription.
*   **UI/Rendering**: Built-in Remotion primitives, custom React components, `prism-react-renderer` syntax highlighting, CSS-in-JS styling.

## 📂 Project Structure

```text
arabic-reel/
├── package.json              # Project dependencies and script definitions
├── requirements.txt          # Python dependencies (faster-whisper)
├── tsconfig.json             # TypeScript configuration
├── scripts/                  # Workflow utility scripts
│   ├── new-episode.mjs       # Scaffolds boilerplate for new episodes
│   └── transcribe.py         # Uses Whisper to transcribe audio -> words.json
├── public/                   # Global static assets (e.g. character image)
└── src/                      # Source code
    ├── Root.tsx / Reel.tsx   # Core Remotion compositions & video player setup
    ├── config.ts             # Global layout, motion constants, and color themes (amber, mint, rose)
    ├── glossary.json         # Maps spoken/transliterated Arabic phrases to Latin technical terms
    ├── types.ts              # Type definitions (Scene configs, Words, etc.)
    ├── components/           # Core UI elements (Captions, BidiText, CodeSnap, Character, Box)
    ├── episodes/             # One self-contained folder per episode (index.ts + words.json + voice.mp3)
    ├── lib/                  # Utilities (Captions parsing, timeline resolving, theming, fonts)
    ├── scenes/               # Scene templates (statement, array, code, codeDemo, steps, compare, diagram, qa)
    └── viz/                  # Data/Algorithmic visualizers (ScanViz, LookupViz, Labeled, ResultBadge)
```

## 🏗 Architecture & Core Concepts

The architecture relies on a **Declarative Timeline** driven by the transcribed audio. 

1.  **Episodes & Scenes**: An episode is defined in `src/episodes/<id>/index.ts` using the `defineEpisode` function (with an optional per-episode `theme`: `'amber' | 'mint' | 'rose'`). It contains a list of **Scenes** (`statement`, `array`, `code`, `codeDemo`, `steps`, `compare`, `diagram`, `qa`).
2.  **Audio Syncing (`at` anchors)**: Scenes are synchronized to the audio using the `at` property. A scene can start precisely when a specific word is spoken (by supplying a string match, occurrence count, or word index). The `lib/timeline.ts` module calculates precise frame durations based on these anchors.
3.  **Captions & Glossary Normalization**: The `Captions.tsx` component parses `words.json` and renders spring-animated Arabic captions in real-time. Multi-word transliterated technical terms (e.g., `["ست", "تايم", "اوت"]` -> `"setTimeout"`, `["او", "اوف", "وان"]` -> `"O(1)"`) are automatically replaced using `src/glossary.json`.
4.  **Bidirectional Text (`BidiText`)**: The `BidiText.tsx` component automatically isolates embedded Latin/alphanumeric expressions (`<bdi dir="ltr">`) inside RTL Arabic text so code snippets, numbers, and English terms render without punctuation or word-order flipping.
5.  **Scene Registry**: The `src/scenes/registry.ts` maps semantic scene declarations (like `kind: 'codeDemo'`) to their respective React components, making the engine highly extensible.

## 🚀 The Pipeline Workflow

### Prerequisites
*   Install Node dependencies: `npm install`
*   Install Python dependencies: `pip install -r requirements.txt`

### Creating an Episode
Creating a new reel follows a 5-step pipeline:

1.  **Scaffold**: 
    Run `npm run new-episode -- <topic-name>`. This creates `src/episodes/<topic-name>/` and registers the episode in `src/episodes/index.ts`.
2.  **Voiceover**: 
    Record the audio track and place it at `src/episodes/<topic-name>/voice.mp3`. In the episode's `index.ts`, uncomment `import voice from './voice.mp3'` and set `voice` (instead of `null`).
3.  **Transcribe**: 
    Run `npm run transcribe -- <topic-name>` (or `npm run transcribe -- <topic-name> --cuda` for GPU acceleration). The Python script uses `faster-whisper` (`large-v3`) along with terms from `src/glossary.json` as an initial prompt to generate `src/episodes/<topic-name>/words.json`.
4.  **Authoring**: 
    Edit the episode's `index.ts` file to declare visual scenes. Scenes are synced to the speech using textual anchors (e.g., `at: 'الحل'` triggers a scene when the word "الحل" is spoken). Add any new technical terms to `src/glossary.json` if needed.
5.  **Render**: 
    *   Preview in browser: `npm run dev` (opens Remotion Studio).
    *   Export to video: `npm run render -- <topic-name> out/<topic-name>.mp4`.
