# Arabic Reel — Programmatic Video Generation Engine

**Arabic Reel** is a production-grade programmatic video generation system built with [Remotion](https://www.remotion.dev/), [React 19](https://react.dev/), and [TypeScript](https://www.typescriptlang.org/). It enables software engineers and content creators to generate high-retention, educational Arabic tech reels (9:16 vertical video) directly from code and voiceovers.

The platform couples word-level speech-to-text alignment with a declarative scene graph and domain-specific data structure / runtime visualizers.

---

## 🛠 Tech Stack

* **Video Synthesis Engine**: Remotion 4.x with React 19 & TypeScript (GPU-accelerated programmatic video rendering).
* **Speech-to-Text & Alignment**: Offline transcription via `faster-whisper` (`large-v3`) with prompt glossary seeding.
* **Syntax Highlighting**: `prism-react-renderer` with custom dark-mode token palettes.
* **Testing & Quality Assurance**: Node.js native test runner (`node --test`), native type-stripping (`test-loader.mjs`), and an automated pre-render QA audit suite (`scripts/validate.mjs`).

---

## 📂 Project Architecture

```text
arabic-reel/
├── package.json              # Scripts, Remotion dependencies, React 19
├── requirements.txt          # Python dependencies (faster-whisper, torch)
├── tsconfig.json             # Strict TypeScript configuration
├── scripts/                  # Developer CLI tooling & pipelines
│   ├── new-episode.mjs       # Scaffolds new episode boilerplate and registers composition
│   ├── transcribe.py         # Word-level speech alignment (faster-whisper -> words.json)
│   ├── choreograph.mjs       # Interactive speech-to-scene alignment generator
│   ├── corrections.mjs       # Transcript spelling & glossary correction manager
│   ├── validate.mjs          # Pre-render QA audit suite (schema, timing, mobile bounds)
│   └── test-loader.mjs       # Node native type-stripping ESM loader
├── public/                   # Static media (character avatar: main.png, audio)
└── src/                      # Source code
    ├── Root.tsx              # Remotion Root (registers all episode compositions)
    ├── Reel.tsx              # Main Reel composition (Stage, Character, Captions, Transitions)
    ├── config.ts             # Geometry, timeline defaults, and design tokens
    ├── glossary.ts           # Technical vocabulary dictionary, validation, and normalization
    ├── glossary.json         # Spoken-to-display technical mappings (Arabic transliteration -> English)
    ├── types.ts              # Domain types re-export barrel (backward-compatible)
    ├── types/                # Modular domain definitions
    │   ├── transcript.ts     # Word, TranscriptCorrection, AnchorObject, SceneAnchor
    │   ├── viz.ts            # VizConfig, ExecutionStep, EventLoopStep, StackSlot, HeapObject, etc.
    │   ├── scene.ts          # SceneConfig, SceneKind, SceneOf, StepItem, CompareSide, DiagramNode
    │   ├── episode.ts        # Episode definition schema
    │   └── index.ts          # Consolidated types barrel
    ├── theme/                # Design token & palette subsystem
    │   ├── types.ts          # Theme, ThemeName, CodeChrome, CodeSyntax
    │   ├── tokens.ts         # SHARED_UI, SHARED_CODE, THEMES ('amber' | 'mint' | 'rose')
    │   ├── context.ts        # React ThemeContext, ThemeProvider, useTheme hook
    │   └── index.ts          # Theme barrel
    ├── components/           # Reusable UI primitives
    │   ├── AuthoringHUD.tsx  # In-studio debug overlay for timing budgets & anchors
    │   ├── BidiText.tsx      # Arabic RTL / English LTR text isolation (<bdi>)
    │   ├── Box.tsx           # Elevated glass/card container with tone styling
    │   ├── Captions.tsx      # Word-level animated kinetic typography with auto-chunking
    │   ├── Character.tsx     # Animated host avatar with spring bounce
    │   ├── CodeSnap.tsx      # Syntax-highlighted code editor with line highlights & typing
    │   ├── Enter.tsx         # Staggered slide/fade entrance motion wrapper
    │   ├── SceneTransition.tsx # Cross-fade & slide scene transition wrapper
    │   ├── SingleScenePreview.tsx # Standalone scene preview component
    │   └── index.ts          # Component barrel
    ├── scenes/               # High-level declarative scene implementations
    │   ├── StatementScene.tsx  # Hero hook, takeaway, and codePreview scenes
    │   ├── CodeScene.tsx       # Dedicated syntax-highlighted code breakdown
    │   ├── CodeDemoScene.tsx   # Code snippet paired with synchronized runtime visualizer
    │   ├── CompareScene.tsx    # Split-screen comparison (Before/After, Code/Error, Good/Bad)
    │   ├── DiagramScene.tsx    # Architecture & dataflow graph with directional arrows
    │   ├── StepsScene.tsx      # Staggered sequence cards with optional stacked layout
    │   ├── QaScene.tsx         # Interactive prediction quiz / Q&A with answer reveal
    │   ├── TransitionScene.tsx # Chapter & concept pivot banner
    │   ├── MythRealityScene.tsx # Common myth debunking with side-by-side verification
    │   ├── ArrayScene.tsx      # Interactive linear scan & jump array visualization
    │   ├── registry.ts         # SceneKind -> React component registry
    │   └── index.ts            # Scenes barrel
    ├── viz/                  # Algorithmic & Computer Science Visualizers
    │   ├── ScanViz.tsx         # Linear array scan pointer
    │   ├── LookupViz.tsx       # Hash table lookup with bucket hashing animation
    │   ├── ExecutionViz.tsx    # Step-by-step code tracer with variable inspector & console
    │   ├── EventLoopViz.tsx    # JS Event Loop (Call Stack, Web APIs, Microtasks, Tasks)
    │   ├── CallStackViz.tsx    # Execution call stack / recursion frame tracer
    │   ├── BinarySearchViz.tsx # Binary search pointer convergence [L, M, R]
    │   ├── MemoryViz.tsx       # Stack variables referencing Heap objects with mutation cues
    │   ├── ComplexityViz.tsx   # Big-O asymptotic curve graphs (O(1), O(log n), O(n), O(n²))
    │   ├── LinkedListViz.tsx   # Singly-linked list nodes with pointers and address tags
    │   ├── AsyncFlowViz.tsx    # Async/await & Promise lifecycle waterfall
    │   ├── RelationViz.tsx     # Relational DB tables with PK/FK links and row highlighting
    │   ├── registry.ts         # VizConfig['type'] -> React visualizer registry
    │   └── index.ts            # Visualizer barrel
    ├── lib/                  # Pure utility modules (zero circular dependencies)
    │   ├── episode.ts        # defineEpisode API and schema validation
    │   ├── timeline.ts       # Textual anchor search, occurrence matching, frame allocation
    │   ├── text.ts           # Arabic diacritics & letter normalization (alef, yaa, taa marbuta)
    │   ├── code.ts           # Typing duration and line count calculations
    │   ├── corrections.ts    # Transcript corrections application and safety assertions
    │   ├── export.ts         # Subtitle track generation (.srt and .vtt)
    │   ├── fonts.ts          # Typography loaders (Cairo Arabic font)
    │   └── scaffold.ts       # Episode ID validation and source registry update logic
    └── episodes/             # Production & showcase episodes (one folder per episode)
        ├── array-vs-hash-map/
        ├── event-loop/
        ├── clean-code-function/
        ├── naming-1/
        ├── use-pronounceable-names/
        ├── foreign-key/
        ├── scene-showcase/
        └── index.ts          # EPISODES registry consumed by Root.tsx
```

---

## 🎬 Scene Catalog

Every scene is declared declaratively inside `src/episodes/<id>/index.ts` using the `defineEpisode` API:

| Kind | Purpose | Key Props |
| :--- | :--- | :--- |
| `statement` | Opening hook, core rule, or closing takeaway | `text`, `variant: 'hook' \| 'takeaway'`, `codePreview` |
| `code` | Code walkthrough with syntax highlighting | `code`, `language`, `filename`, `highlightLines`, `persistCode` |
| `codeDemo` | Code side-by-side with animated visualizer | `code`, `viz: VizConfig`, `pill`, `tagText`, `result` |
| `compare` | Split comparison (Before vs. After, Good vs. Bad) | `sides: [CompareSide, CompareSide]`, `code`, `errorLine` |
| `diagram` | Architectural flow with arrows & badges | `nodes`, `edgeLabels`, `returnEdgeLabels`, `subLayer` |
| `steps` | Sequential execution steps or pipeline stages | `steps: (string \| StepItem)[]`, `showStack` |
| `qa` | Prediction quiz with delayed answer reveal | `question`, `answer`, `options`, `correctIndex`, `revealDelayFrames` |
| `transition` | Topic change or chapter divider | `fromTitle`, `toTitle`, `bridgeText` |
| `mythReality` | Debunking software myths with facts | `myth`, `reality`, `revealDelayFrames` |
| `array` | Linear memory inspection | `cells`, `target`, `mode: 'scan' \| 'jump'` |

---

## 🔬 Computer Science Visualizers (`VizConfig`)

The `codeDemo` scene can embed any of the following hardware/runtime visualizers:

1. **`scan`**: Linear search array with animated cursor and target hit.
2. **`lookup`**: Hash map key hashing and bucket collision resolution.
3. **`execution`**: Interactive line-by-line interpreter with variable state and stdout console.
4. **`eventLoop`**: JavaScript concurrency model showing Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (`setTimeout`).
5. **`callStack`**: Function stack frame allocation and unwinding with return values.
6. **`binarySearch`**: Divide-and-conquer search showing `L`, `M`, and `R` pointer convergence.
7. **`memory`**: Stack variable references pointing to Heap memory objects with property mutation indicators.
8. **`complexity`**: Animated Big-O complexity curves comparing algorithmic scalability.
9. **`linkedList`**: Pointer node traversal with memory addresses (`0x1A -> 0x4F`).
10. **`asyncFlow`**: Promise resolution states (`pending` -> `fulfilled`/`rejected`) and async waterfall.
11. **`relation`**: Relational database tables highlighting Primary Key (`PK`), Foreign Key (`FK`), and relational links (`REFERENCES`).

---

## ⚡ Developer Workflow & CLI Commands

### 1. Scaffolding a New Episode
```bash
npm run new-episode -- <episode-id>
```
*Creates `src/episodes/<episode-id>/` with an initial `index.ts` and registers the episode in `src/episodes/index.ts`.*

### 2. Transcribing Voiceover Audio
Place `voice.mp3` or `voice.wav` in `src/episodes/<episode-id>/`, then run:
```bash
npm run transcribe -- <episode-id>
# Or with CUDA GPU acceleration:
npm run transcribe -- <episode-id> --cuda
```
*Generates word-level timestamps in `words.json`, applying technical terms from `glossary.json` as initial Whisper prompts.*

### 3. Choreographing Scenes Against Speech
```bash
npm run choreograph -- <episode-id>
```
*Inspects the transcript and interactively generates recommended `at:` textual anchors.*

### 4. Interactive Preview in Remotion Studio
```bash
npm run dev
```
*Launches Remotion Studio at `http://localhost:3000` with live reloading, timeline scrubbing, and the Authoring HUD.*

### 5. Automated Pre-Render QA Audit
```bash
# Audit a single episode:
npm run validate -- <episode-id>

# Audit all episodes in the project:
npm run validate
```
*Verifies schema integrity, word timestamps, timeline anchor continuity, mobile safe-zone bounds, and code line length limits.*

### 6. Subtitle Export & Final Video Render
```bash
npm run render -- <episode-id> out/<episode-id>.mp4
```
*Renders high-resolution 1080x1920 30fps MP4 and exports synchronized `.srt` and `.vtt` subtitles in `out/`.*

### 7. Automated Testing & Verification
```bash
# Type check:
npm run typecheck

# Run test suite:
npm test
```
