import { defineEpisode } from '../../lib/episode';
import voice from './voice.mp3';
import words from './words.json';

export const cleanCodeFunction = defineEpisode({
  id: 'clean-code-function',
  title: 'One Function = One Responsibility',
  theme: 'mint',
  voice,
  words,
  scenes: [
    // المشهد 1 — Hook: الفانكشن الكبيرة بتعمل كل حاجة (0–10s)
    {
      id: 'register-monolith',
      kind: 'code',
      at: 0,
      label: 'CLEAN CODE · SINGLE RESPONSIBILITY',
      title: 'فانكشن بتعمل كل حاجة!',
      language: 'typescript',
      filename: 'register-user.ts',
      code: `async function registerUser(data) {\n  // 1. Validation\n  if (!data.email) throw Error();\n  // 2. Save Database\n  const user = await db.user.create(data);\n  // 3. Send Email\n  await mailer.send(user.email);\n  return user;\n}`,
      highlightLines: [3, 5, 7],
    },

    // المشهد 2 — المشكلة: خطورة التعديل والـ Side Effects (10–19s)
    {
      id: 'the-problem',
      kind: 'steps',
      at: 'البداية',
      label: 'THE PROBLEM',
      title: 'ليه الفانكشن الكبيرة خطيرة؟',
      steps: [
        '1. محتاج تغيّر مزود الإيميل 📧',
        '2. بتفتح فانكشن التسجيل الكبيرة 📂',
        '3. تعديل الإيميل ممكن يكسر الحفظ! 💥',
        '⚠️ الكود شغال... بس صيانته صعبة ومعقدة!',
      ],
      pill: 'SIDE EFFECTS',
    },

    // المشهد 3 — الحل: تقسيم الشغل لفانكشنز صغيرة ومنسّقة (19–33s)
    {
      id: 'the-solution',
      kind: 'code',
      at: 'الحل',
      label: 'THE SOLUTION · REFACTORED',
      title: 'كل خطوة في Function مستقلة',
      language: 'typescript',
      filename: 'clean-register.ts',
      code: `async function registerUser(user) {\n  validateUser(user);\n  const saved = await saveUser(user);\n  await sendWelcomeEmail(saved);\n  return saved;\n}`,
      highlightLines: [2, 3, 4],
    },

    // المشهد 4 — الفهم الخاطئ vs المعنى الحقيقي للـ SRP (33–42s)
    {
      id: 'single-responsibility',
      kind: 'mythReality',
      at: 'وده',
      label: 'THE GOLDEN PRINCIPLE',
      title: 'Single Responsibility Principle',
      myth: {
        label: '❌ فهم خاطئ ومبالغ فيه',
        text: 'كل سطر كود لازم يتعمل في Function منفصلة لوحده.',
        badge: 'OVERKILL',
        tone: 'bad',
      },
      reality: {
        label: '✅ المعنى الحقيقي والصحيح',
        text: 'كل Function يكون ليها دور واحد ومسؤولية واضحة تقدر تفهمها وتختبرها بسهولة.',
        badge: 'SRP GOAL',
        tone: 'good',
      },
      pill: 'CLEAN ARCHITECTURE',
    },

    // المشهد 5 — الخاتمة والخلاصة (42–48s)
    {
      id: 'takeaway',
      kind: 'statement',
      at: 'لأن',
      label: 'FINAL TAKEAWAY',
      text: `الكود مش بس لازم يشتغل...\nالمهم تقدر تقراه وتعدّل فيه بسهولة.\n\nOne Function = One Clear Responsibility.`,
      variant: 'takeaway',
    },
  ],
});
