import { defineEpisode } from '../../lib/episode';
import voice from './voice.mp3';
import words from './words.json';

export const usePronounceableNames = defineEpisode({
  id: 'use-pronounceable-names',
  title: 'Use Pronounceable Names',
  theme: 'mint',
  voice,
  words,
  scenes: [
    // المشهد 1 — Hook: تعرف تنطق المتغيّر ده؟ (0–8.8s)
    {
      id: 'hook',
      kind: 'statement',
      at: 0,
      label: 'CLEAN CODE · NAMING',
      title: 'Use Pronounceable Names',
      text: 'تعرف تنطق المتغيّر ده؟',
      variant: 'hook',
      codePreview: {
        code: 'const lstLgnDt  = new Date();',
        filename: 'mystery.ts',
        language: 'javascript',
      },
    },

    // المشهد 2 — الكود قبل التعديل: أسماء مش بتتنطق (8.8–19.4s)
    {
      id: 'before',
      kind: 'code',
      at: 'الكود ده',
      label: 'BEFORE · UNPRONOUNCEABLE',
      title: 'الكود شغال... بس التواصل صعب!',
      language: 'javascript',
      filename: 'unpronounceable.js',
      code: `const lstLgnDt = new Date();\nconst cstmrRcrds = [];\nconst ordTtl = getTtl(items);`,
      highlightLines: [1],
    },

    // المشهد 3 — تفاصيل الاختصارات الغامضة (19.4–31.6s)
    {
      id: 'try-speaking',
      kind: 'code',
      at: 'الأسماء دي',
      label: 'TRY PRONOUNCING',
      title: 'جرّب تقولهم في جملة عادية!',
      language: 'javascript',
      filename: 'unpronounceable.js',
      code: `const lstLgnDt = new Date();\nconst cstmrRcrds = [];\nconst ordTtl = getTtl(items);`,
      highlightLines: [1, 2, 3],
      persistCode: true,
    },

    // المشهد 3 — المقارنة: قبل وبعد النطق (31.6–42.2s)
    {
      id: 'rename',
      kind: 'compare',
      at: 'دلوقتي',
      label: 'RENAME · BEFORE VS AFTER',
      title: 'قبل وبعد التعديل',
      pill: 'PRONOUNCEABLE NAMES',
      sides: [
        {
          title: 'مش بتتنطق (قبل)',
          tone: 'bad',
          badge: '❌ CRYPTIC',
          items: ['lstLgnDt', 'cstmrRcrds', 'ordTtl'],
        },
        {
          title: 'بتتنطق بسهولة (بعد)',
          tone: 'good',
          badge: '✓ PRONOUNCEABLE',
          items: ['lastLoginDate', 'customerRecords', 'orderTotal'],
        },
      ],
    },

    // المشهد 4 — الكود بعد التعديل: جمل واضحة ومقروءة (42.2–47.9s)
    {
      id: 'after',
      kind: 'code',
      at: 'التعديل',
      label: 'AFTER · CLEAN CODE',
      title: 'كود يتقرأ ويتناقش بسهولة',
      language: 'javascript',
      filename: 'pronounceable.js',
      code: `const lastLoginDate = new Date();\nconst customerRecords = [];\nconst orderTotal = getTotal(items);`,
      highlightLines: [1, 2, 3],
    },

    // المشهد 5 — القاعدة: Pronounceable Names (47.9–54.2s)
    {
      id: 'rule',
      kind: 'qa',
      at: 'القاعدة',
      label: 'THE GOLDEN RULE',
      title: 'Pronounceable Names',
      pill: 'CLEAN ARCHITECTURE',
      question: 'إزاي أعرف إن اسم المتغيّر كويس؟',
      answer: 'اقرأه بصوت عالي... لو معرفتش تنطقه، غيّره!',
    },

    // المشهد 6 — الخاتمة: البرمجة شغل جماعي (54.2–59.4s)
    {
      id: 'outro',
      kind: 'statement',
      at: 'افتكر',
      label: 'FINAL TAKEAWAY',
      variant: 'takeaway',
      text: `البرمجة شغل جماعي...\nاكتب أسماء الناس تقدر تتكلم بيها بسهولة.\n\nUse Pronounceable Names.`,
    },
  ],
});
