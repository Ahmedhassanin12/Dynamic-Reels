import { defineEpisode } from '../../lib/episode';
import voice from './voice.wav';
import words from './words.json';

export const naming1 = defineEpisode({
  id: 'naming-1',
  title: 'Intention-Revealing Names',
  theme: 'mint',
  voice,
  words,
  scenes: [
    // المشهد 1 — Hook (0–6s)
    {
      id: 'hook',
      kind: 'code',
      at: 0,
      label: 'CLEAN CODE · TIP 01',
      title: 'المتغير ده بيعبر عن إيه؟',
      language: 'typescript',
      filename: 'order.ts',
      code: `// ❓ What is "d"?\nconst d = 30;`,
      highlightLines: [2],
    },

    // المشهد 2 — المشكلة والغموض (6–15s)
    {
      id: 'mystery-d',
      kind: 'steps',
      at: 'الـ d',
      label: 'THE PROBLEM',
      title: 'الـ d دي معناها إيه؟',
      steps: [
        '1. Days؟ (أيام)',
        '2. Distance؟ (مسافة)',
        '3. Duration؟ (مدة زمنية)',
        '⚠️ الكود شغال... بس الاسم مش مفيد!',
      ],
      pill: 'AMBIGUOUS NAME',
    },

    // المشهد 3 — الحل الأول: الاسم الصريح (15–23s)
    {
      id: 'elapsed-time',
      kind: 'code',
      at: 'بص',
      label: 'SOLUTION 1',
      title: 'الاسم الصح يشرح نفسه',
      language: 'typescript',
      filename: 'order.ts',
      code: `// ✅ Clear & Intention-Revealing\nconst elapsedTimeInDays = 30;\n\n// وقت منقضي بالأيام... من غير تخمين!`,
      highlightLines: [2],
    },

    // المشهد 4 — مثال واقعي ومقارنة (23–38s)
    {
      id: 'max-attempts',
      kind: 'compare',
      at: 'ونفس',
      label: 'REAL-WORLD EXAMPLE',
      title: 'أقصى عدد محاولات دخول',
      sides: [
        {
          title: '❌ Bad Naming',
          code: 'const m = 5;',
          items: ['حرف غامض ومبهم', 'محتاج تقرأ الكود عشان تفهمه'],
        },
        {
          title: '✅ Clean Naming',
          code: 'const maxLoginAttempts = 5;',
          items: ['بيشرح وظيفته مباشرة', 'أي Developer يفهمه بسرعة'],
        },
      ],
      pill: 'COMPARE',
    },

    // المشهد 5 — القاعدة الذهبية (38–47s)
    {
      id: 'the-rule',
      kind: 'mythReality',
      at: 'القاعدة',
      label: 'THE GOLDEN RULE',
      title: 'Intention Revealing Names',
      myth: {
        label: '❌ اسم قصير ومختصر',
        text: 'تسمي المتغير بحرف واحد أو اختصار غامض إنت بس اللي فاكره.',
        code: 'const d = 30;\nconst m = 5;',
        badge: 'AVOID',
        tone: 'bad',
      },
      reality: {
        label: '✅ اسم يوضح المعنى والدور',
        text: 'اختار اسم يوضّح معنى القيمة ودورها في البرنامج لأي حد.',
        code: 'const elapsedTimeInDays = 30;\nconst maxLoginAttempts = 5;',
        badge: 'RULE',
        tone: 'good',
      },
      pill: 'CLEAN CODE',
    },

    // المشهد 6 — الخاتمة والدرس المستفاد (47–55s)
    {
      id: 'takeaway',
      kind: 'statement',
      at: 'افتكر',
      label: 'FINAL TAKEAWAY',
      text: `الكود بيتكتب مرة واحدة...\nلكن بيتقرأ عشرات المرات.\n\nClean Code starts with clear names.`,
      variant: 'takeaway',
    },
  ],
});
