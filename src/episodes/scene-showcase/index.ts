import { defineEpisode } from '../../lib/episode';

/**
 * Visual Scene Library Showcase Episode.
 * Demonstrates every new scene & visualizer type (Panels 4, 6, 7, 9, 10, 12, 13, 14, 15, 16)
 * so you can preview them directly in Remotion Studio or render stills.
 */
export const sceneShowcase = defineEpisode({
  id: 'scene-showcase',
  title: 'Scene Library Showcase',
  theme: 'amber',
  voice: null,
  words: [
    { text: 'مقدمة', start: 0.0, end: 3.9 },
    { text: 'مصفوفة', start: 4.0, end: 7.9 },
    { text: 'باينري', start: 8.0, end: 11.9 },
    { text: 'خطوات', start: 12.0, end: 15.9 },
    { text: 'سيرفر', start: 16.0, end: 19.9 },
    { text: 'خطأ', start: 20.0, end: 23.9 },
    { text: 'ميموري', start: 24.0, end: 27.9 },
    { text: 'ريأكت', start: 28.0, end: 31.9 },
    { text: 'تعقيد', start: 32.0, end: 35.9 },
    { text: 'انتقال', start: 36.0, end: 40.0 },
  ],
  scenes: [
    // 1. Panel 4 — Recursion Call Stack (viz.type: 'callStack')
    {
      id: 'call-stack',
      kind: 'codeDemo',
      at: 0,
      label: 'PANEL 4 · RECURSION',
      title: 'الـ Call Stack في الـ Recursion',
      filename: 'factorial.ts',
      skipTyping: true,
      code: `function fact(n: number): number {\n  if (n <= 1) return 1;\n  return n * fact(n - 1);\n}`,
      viz: {
        type: 'callStack',
        frames: ['fact(3)', 'fact(2)', 'fact(1)'],
        returns: ['1', '2', '6'],
        lines: [3, 3, 2, 2, 3, 3],
        framesPerStep: 14,
      },
      result: '6',
    },

    // 2. Panel 6 — Enhanced Array Scene (kind: 'array')
    {
      id: 'array-pointer',
      kind: 'array',
      at: 1,
      label: 'PANEL 6 · ARRAY INDEXING',
      title: 'البحث جوه الـ Array',
      cells: ['10', '24', '35', '42', '58', '71', '89'],
      target: 3,
      mode: 'scan',
      pointerLabel: 'جاري البحث... ↓',
      result: 'O(n) · 4 checks',
    },

    // 3. Panel 7 — Binary Search Halving (viz.type: 'binarySearch')
    {
      id: 'binary-search',
      kind: 'codeDemo',
      at: 2,
      label: 'PANEL 7 · BINARY SEARCH',
      title: 'قسّم النص كل مرة',
      filename: 'binary-search.ts',
      skipTyping: true,
      code: `const mid = Math.floor((low + high) / 2);\nif (arr[mid] === target) return mid;`,
      highlightLines: [1, 2],
      viz: {
        type: 'binarySearch',
        cells: ['2', '5', '8', '12', '16', '23', '38', '56', '72'],
        targetIndex: 5,
        framesPerStep: 20,
      },
      result: 'O(log n)',
    },

    // 4. Panel 9 — Rich Steps Scene with Vertical Connector & Stack State (kind: 'steps')
    {
      id: 'steps-stack',
      kind: 'steps',
      at: 3,
      label: 'PANEL 9 · STEP BY STEP',
      title: 'إزاي الـ Stack بيشتغل؟',
      pill: 'LIFO OPERATIONS',
      showStack: true,
      steps: [
        { text: 'ضف العنصر الأول للـ Stack', badge: 'push(10)', code: 'stack.push(10);', tone: 'ink' },
        { text: 'ضف العنصر التاني فوقه', badge: 'push(20)', code: 'stack.push(20);', tone: 'good' },
        { text: 'اسحب آخر عنصر دخل الأول', badge: 'pop() → 20', code: 'stack.pop();', tone: 'warn' },
      ],
    },

    // 5. Panel 10 — System Architecture / Request Lifecycle (kind: 'diagram', layout: 'architecture')
    {
      id: 'client-server',
      kind: 'diagram',
      at: 4,
      label: 'PANEL 10 · SYSTEM ARCHITECTURE',
      title: 'رحلة الـ Request للـ Server',
      layout: 'architecture',
      highlight: 1,
      nodes: [
        { title: 'Client · المتصفح', sub: 'React / Next.js App', badge: 'BROWSER', tone: 'ink' },
        { title: 'API Server · السيرفر', sub: 'Auth + Business Logic', badge: 'NODE.JS', tone: 'good' },
        { title: 'Database · قاعدة البيانات', sub: 'Indexed Lookup', badge: 'POSTGRES', tone: 'paper' },
      ],
      edgeLabels: ['GET /api/users/42', 'SELECT * WHERE id = 42'],
      returnEdgeLabels: ['200 OK · JSON', 'Row { id: 42, name: "Sara" }'],
    },

    // 6. Panel 12 — Error & Fix Code Comparison (kind: 'compare')
    {
      id: 'error-fix',
      kind: 'compare',
      at: 5,
      label: 'PANEL 12 · ERROR VS FIX',
      title: 'ليه بيحصل TypeError؟',
      pill: 'OPTIONAL CHAINING · FIX',
      sides: [
        {
          title: 'Before · الكود القديم',
          badge: '✗ CRASHES',
          code: `const city = user.address.city;\nconsole.log(city);`,
          errorLine: "TypeError: Cannot read properties of undefined (reading 'city')",
        },
        {
          title: 'After · الحل الآمن',
          badge: '✓ SAFE',
          code: `const city = user?.address?.city ?? 'Cairo';\nconsole.log(city);`,
          items: ['يمنع الـ Crash لو الـ address مش موجود'],
        },
      ],
    },

    // 7. Panel 13 — Memory & Reference Visualizer (viz.type: 'memory')
    {
      id: 'memory-ref',
      kind: 'codeDemo',
      at: 6,
      label: 'PANEL 13 · MEMORY MODEL',
      title: 'الفرق بين الـ Stack والـ Heap',
      filename: 'reference.ts',
      skipTyping: true,
      code: `const count = 10;\nconst user1 = { name: 'Sara', role: 'Dev' };\nconst user2 = user1;\nuser2.name = 'Ali';`,
      highlightLines: [3, 4],
      viz: {
        type: 'memory',
        stack: [
          { name: 'count', value: '10' },
          { name: 'user1', value: 'ref', ref: '0x4F2A' },
          { name: 'user2', value: 'ref', ref: '0x4F2A', changed: true },
        ],
        heap: [
          {
            id: '0x4F2A',
            label: 'Object (User)',
            entries: { name: '"Ali"', role: '"Dev"' },
            mutatedKey: 'name',
          },
        ],
        note: 'user1 و user2 بيشاوروا على نفس الـ Object في الـ Heap!',
      },
      result: 'shared ref',
    },

    // 8. Panel 14 — React Render Flow Pipeline (kind: 'diagram', layout: 'pipeline')
    {
      id: 'react-render',
      kind: 'diagram',
      at: 7,
      label: 'PANEL 14 · REACT INTERNALS',
      title: 'إزاي React بيعمل Render؟',
      layout: 'pipeline',
      nodes: [
        { title: 'State Update', sub: 'setCount(c => c + 1)', badge: 'TRIGGER', tone: 'warn' },
        { title: 'Render Phase', sub: 'Execute Component Fn', badge: 'PURE JS', tone: 'ink' },
        { title: 'Virtual DOM Diff', sub: 'Reconcile Prev vs Next', badge: 'DIFF O(N)', tone: 'ink' },
        { title: 'Commit DOM', sub: 'Apply Minimal Patch', badge: 'BROWSER PAINT', tone: 'good' },
      ],
      subLayer: {
        label: 'COMPONENT HOOKS',
        items: ['useState(1)', 'useMemo()', 'useEffect()'],
        note: 'Diffing O(n) → Minimal DOM Patch',
      },
    },

    // 9. Panel 15 — Big-O Complexity Graph (viz.type: 'complexity')
    {
      id: 'big-o-graph',
      kind: 'codeDemo',
      at: 8,
      label: 'PANEL 15 · BIG-O COMPLEXITY',
      title: 'مقارنة سرعة الخوارزميات',
      filename: 'complexity.ts',
      skipTyping: true,
      code: `// O(1)     -> map.get(id)\n// O(log n) -> binarySearch(sorted, id)\n// O(n)     -> users.find(u => u.id === id)`,
      viz: {
        type: 'complexity',
        highlight: 'O(log n)',
        note: 'كل ما الـ Data تكبر، الفرق بيبان!',
      },
    },

    // 10. Panel 16 — Concept-to-Concept Transition Bridge (kind: 'transition')
    {
      id: 'concept-bridge',
      kind: 'transition',
      at: 9,
      label: 'PANEL 16 · CONTINUITY',
      title: 'من الفكرة للمرحلة الجاية',
      fromTitle: 'Linear Search · بحث خطي',
      fromBadge: 'O(n) · slow',
      fromSub: 'بيعدي على العناصر واحد واحد بالترتيب',
      bridgeText: 'طب لو البيانات مترتبة؟ ↓',
      toTitle: 'Binary Search · بحث ثنائي',
      toBadge: 'O(log n) · fast',
      toSub: 'بيقسم مساحة البحث للنص في كل خطوة',
    },
  ],
});
