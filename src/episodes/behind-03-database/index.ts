import { defineEpisode } from '../../lib/episode';
import voice from './voice.mp3';
import words from './words.json';

/** Series: «إيه اللي بيحصل ورا التطبيق؟» · Episode 3 of 10 */
export const behind03Database = defineEpisode({
  id: 'behind-03-database',
  title: 'قواعد البيانات والجداول',
  voice,
  words,
  theme: 'mint',
  corrections: [
    {
      index: 27,
      original: 'هنتطر',
      corrected: 'هنضطر',
      status: 'approved',
      reason: 'Whisper spelling drift',
    },
    {
      index: 45,
      original: 'العلاقية',
      corrected: 'العلائقية',
      status: 'approved',
      reason: 'Whisper spelling drift',
    },
    { index: 65, original: 'جوا', corrected: 'جواه', status: 'approved', reason: 'Whisper spelling drift' },
    {
      index: 115,
      original: 'للديتا',
      corrected: 'للداتا',
      status: 'approved',
      reason: 'Whisper spelling drift',
    },
    { index: 130, original: 'لك', corrected: 'لـ', status: 'approved', reason: 'Whisper spelling drift' },
  ],
  scenes: [
    {
      // 1. Hook: Why we never put all data into a single huge table
      id: 'hook',
      kind: 'statement',
      variant: 'hook',
      at: 0,
      title: 'ليه بنقسم الداتا في جداول؟',
      text: 'تطبيق زي إنستجرام بيحفظ **مليارات الصور**.. ليه الداتابيز **مش بتتلخبط** بين صورك وصور غيرك؟',
      codePreview: {
        filename: 'anti-pattern.sql',
        badge: '❌ HUGE TABLE RISK',
        code: `-- ❌ جدول واحد كبير يسبب تكرار هائل:\nCREATE TABLE feed (\n  image_url TEXT,\n  user_name TEXT,  -- مكرر مليار مرة!\n  user_email TEXT  -- تكرار يستهلك المساحة\n);`,
      },
    },
    {
      // 2. Relational Database with PK -> FK visualizer
      id: 'relational-tables',
      kind: 'codeDemo',
      at: 'الحل',
      label: 'EP 3 · RELATIONAL DATABASE',
      title: 'العلاقات بين الجداول · Foreign Key',
      pill: 'PRIMARY & FOREIGN KEYS',
      viz: {
        type: 'relation',
        tables: [
          {
            name: 'users',
            badge: 'PARENT · PK',
            columns: [
              { name: 'id', label: 'id', pk: true },
              { name: 'name', label: 'name' },
            ],
            rows: [
              { id: '1', name: 'Sara' },
              { id: '42', name: 'Ahmed' },
            ],
            highlightRow: 1,
          },
          {
            name: 'posts',
            badge: 'CHILD · FK',
            columns: [
              { name: 'id', label: 'id', pk: true },
              { name: 'user_id', label: 'user_id', fk: true },
              { name: 'image', label: 'image' },
            ],
            rows: [
              { id: '101', user_id: '42', image: 'post1.jpg' },
              { id: '102', user_id: '42', image: 'post2.jpg' },
            ],
            highlightRow: 0,
          },
        ],
        link: {
          fromTable: 'posts',
          fromColumn: 'user_id',
          toTable: 'users',
          toColumn: 'id',
          label: 'REFERENCES',
        },
      },
      result: 'PK ──► FK',
    },
    {
      // 3. The SQL JOIN in action
      id: 'sql-join',
      kind: 'code',
      at: 'ولما',
      label: 'EP 3 · SQL JOIN',
      title: 'ربط الجداول بـ SQL JOIN',
      language: 'sql',
      filename: 'get-posts.sql',
      highlightLines: [3],
      code: `SELECT users.name, posts.image\nFROM users\nJOIN posts ON posts.user_id = users.id\nWHERE users.id = 42;`,
    },
    {
      // 4. ACID Transaction Safety
      id: 'acid-safety',
      kind: 'steps',
      at: 'وفوق',
      label: 'EP 3 · DATA INTEGRITY',
      title: 'معايير الأمان الصارمة · ACID',
      pill: 'TRANSACTION SAFETY',
      showStack: true,
      steps: [
        { text: 'Atomicity: العملية تكتمل كاملة أو تتلغي تماماً', badge: '1. ATOMICITY', tone: 'good' },
        {
          text: 'Consistency: حفظ سلامة العلاقات وتفادي أي بيانات تائهة',
          badge: '2. CONSISTENCY',
          tone: 'ink',
        },
        {
          text: 'Durability: حفظ التعديل دائماً في القرص لو الكهربا قطعت',
          badge: '3. DURABILITY',
          tone: 'warn',
        },
      ],
    },
    {
      // 5. The Scaling Dilemma
      id: 'scaling-dilemma',
      kind: 'statement',
      variant: 'takeaway',
      at: 'بس',
      label: 'EP 3 · THE DILEMMA',
      text: 'لما جدول البوستات يوصل لـ **100 مليون صف**.. البحث العادي بالاسم هياخد **ثواني كاملة** والسيرفر هيموت!',
    },
    {
      // 6. Transition to Episode 4
      id: 'next-episode',
      kind: 'transition',
      at: 'ده',
      label: 'NEXT EPISODE',
      title: 'الحلقة القادمة',
      fromTitle: 'قواعد البيانات',
      fromBadge: 'EP 3',
      fromSub: 'الجداول والعلاقات والـ Foreign Key',
      bridgeText: 'إزاي بنلاقي أي صف في 2ms؟ ↓',
      toTitle: 'الـ Index',
      toBadge: 'EP 4',
      toSub: 'شجرة الـ B-Tree والبحث الخارق',
    },
  ],
});
