import { defineEpisode } from '../../lib/episode';
import voice from './voice.mp3';
import words from './words.json';

/** Series: «إيه اللي بيحصل ورا التطبيق؟» · Episode 2 of 10 */
export const behind02Api = defineEpisode({
  id: 'behind-02-api',
  title: 'الـ API: وسيط الملايين',
  voice,
  words,
  theme: 'mint',
  corrections: [
    { index: 15, original: 'ويعد', corrected: 'ويعدل', status: 'approved', reason: 'Whisper misheard' },
    { index: 16, original: 'الرصيده', corrected: 'رصيده', status: 'approved', reason: 'Whisper misheard' },
    { index: 130, original: 'البنات', corrected: 'البيانات', status: 'approved', reason: 'Whisper misheard' },
  ],
  scenes: [
    {
      // 1. Hook: Why apps never connect directly to databases
      id: 'hook',
      kind: 'statement',
      variant: 'hook',
      at: 0,
      title: 'ليه مستحيل تكلم الداتابيز مباشرة؟',
      text: 'ليه تطبيق الموبايل **مستحيل** يكلم الداتابيز مباشرة؟ لو عملت كده، أي حد يقدر **يعدل رصيده ويسرق البيانات!**',
      codePreview: {
        filename: 'direct-danger.ts',
        badge: '🚨 DIRECT DB ACCESS',
        code: `// ❌ اتصال مباشر خطير:\nconst db = new Client(KEY);\nawait db.query(\n  "UPDATE balance SET amount = 999"\n);`,
      },
    },
    {
      // 2. The API as security gateway and protocol translator
      id: 'api-architecture',
      kind: 'diagram',
      layout: 'architecture',
      at: 'اتعمل',
      label: 'EP 2 · ARCHITECTURE',
      title: 'الـ API · حارس الأمن والمترجم',
      pill: 'SECURITY GATEWAY',
      highlight: 1,
      nodes: [
        { title: 'تطبيق الموبايل', sub: 'iPhone / Android App', badge: 'CLIENT', tone: 'ink' },
        { title: 'API Gateway', sub: 'فحص الحماية + Rate Limiting', badge: 'FIREWALL', tone: 'good' },
        { title: 'Database', sub: 'قاعدة بيانات معزولة ومحمية', badge: 'ISOLATED DB', tone: 'paper' },
      ],
      edgeLabels: ['POST /transfer (JSON)', 'Sanitized SQL Query'],
      returnEdgeLabels: ['200 OK · Success', 'Row Updated'],
    },
    {
      // 3. The 3 essential checks: JSON validation, Rate Limiting, SQL injection prevention
      id: 'security-pipeline',
      kind: 'steps',
      at: 'لما',
      label: 'EP 2 · SECURITY CHECKS',
      title: 'فحوصات الـ API الأمنية',
      pill: 'SECURITY PIPELINE',
      showStack: true,
      steps: [
        {
          text: 'فحص الـ Headers وتنسيق الـ JSON',
          badge: '1. JSON VALIDATION',
          code: 'JSON.parse(request.body);',
          tone: 'ink',
        },
        {
          text: 'منع هجمات الـ DDoS بـ Rate Limiting',
          badge: '2. RATE LIMITING',
          code: 'maxRequests: 100 / min / IP',
          tone: 'warn',
        },
        {
          text: 'تعقيم الكود ومنع ثغرات الـ SQL Injection',
          badge: '3. SQL SANITIZE',
          code: 'db.query("WHERE id = $1", [id]);',
          tone: 'good',
        },
      ],
    },
    {
      // 4. HTTP Status Codes: 200 vs 401 vs 500
      id: 'status-codes',
      kind: 'compare',
      at: 'السيرفر',
      label: 'EP 2 · HTTP STATUS CODES',
      title: 'أكواد حالة الـ API الشائعة',
      pill: 'STATUS CODES',
      sides: [
        {
          title: '✓ 200 OK · النجاح',
          badge: 'SUCCESS',
          items: ['العملية تمت بنجاح والسيرفر خلص', 'بيانات الـ JSON راجعة سليمة للموبايل'],
        },
        {
          title: '✗ 401 & 500 · الأخطاء',
          badge: 'ERRORS',
          items: ['401: Unauthorized (مش مسجل دخول)', '500: Server Error (السيرفر وقع من الضغط)'],
          tone: 'bad',
        },
      ],
    },
    {
      // 5. Educational Takeaway
      id: 'takeaway',
      kind: 'statement',
      variant: 'takeaway',
      at: 'الخلاصة',
      label: 'EP 2 · LESSON',
      text: 'الـ **API** هو خط الدفاع الأول اللي بيحمي السيرفر، **وبيوحد لغة التواصل** بين الآيفون والأندرويد والويب!',
    },
    {
      // 6. Transition to Episode 3
      id: 'next-episode',
      kind: 'transition',
      at: 'طب',
      label: 'NEXT EPISODE',
      title: 'الحلقة القادمة',
      fromTitle: 'الـ API',
      fromBadge: 'EP 2',
      fromSub: 'حارس الأمن وتوحيد البيانات',
      bridgeText: 'إزاي بننظم ملايين الصفوف دي؟ ↓',
      toTitle: 'قواعد البيانات',
      toBadge: 'EP 3',
      toSub: 'الجداول والعلاقات والـ Foreign Key',
    },
  ],
});
