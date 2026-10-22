import { defineEpisode } from '../../lib/episode';
import words from './words.json';

export const foreignKey = defineEpisode({
  id: 'foreign-key',
  title: 'Primary Key vs Foreign Key',
  theme: 'amber',
  voice: null,
  words,
  scenes: [
    // 0. Hook
    {
      id: 'hook',
      kind: 'statement',
      variant: 'hook',
      at: 0,
      text: 'إزاي جدول [orders] بيعرف صاحب الطلب في [users]؟',
      codePreview: {
        filename: 'orders.sql',
        language: 'sql',
        badge: 'FK → PK',
        code: `user_id INT REFERENCES users(id)`,
      },
    },

    // 1. A `users` table with a Primary Key
    {
      id: 'users-pk',
      kind: 'codeDemo',
      at: 'الأول',
      label: 'STEP 1 · PARENT TABLE',
      title: 'جدول الـ Users والـ Primary Key',
      pill: 'PRIMARY KEY · UNIQUE ID',
      pillTone: 'good',
      filename: 'users.sql',
      language: 'sql',
      code: `CREATE TABLE users (\n  id INT PRIMARY KEY,\n  name TEXT\n);`,
      highlightLines: [2],
      viz: {
        type: 'relation',
        tables: [
          {
            name: 'users',
            badge: 'PARENT · PK',
            tone: 'good',
            columns: [
              { name: 'id', pk: true, highlight: true },
              { name: 'name' },
            ],
            rows: [
              [42, 'Sara'],
              [43, 'Ali'],
            ],
            highlightRow: 0,
          },
        ],
        note: 'الـ Primary Key بيميز كل مستخدم برقم فريد لا يتكرر',
      },
      result: 'PK: users.id',
    },

    // 2. An `orders` table with a Foreign Key
    {
      id: 'orders-fk',
      kind: 'codeDemo',
      at: 'التاني',
      label: 'STEP 2 · CHILD TABLE',
      title: 'جدول الـ Orders والـ Foreign Key',
      pill: 'FOREIGN KEY · REFERENCE',
      pillTone: 'neutral',
      filename: 'orders.sql',
      language: 'sql',
      code: `CREATE TABLE orders (\n  id INT PRIMARY KEY,\n  user_id INT REFERENCES users(id),\n  total INT\n);`,
      highlightLines: [3],
      viz: {
        type: 'relation',
        tables: [
          {
            name: 'orders',
            badge: 'CHILD · FK',
            tone: 'warn',
            columns: [
              { name: 'id', pk: true },
              { name: 'user_id', fk: true, highlight: true },
              { name: 'total' },
            ],
            rows: [
              [101, 42, 250],
              [102, 42, 180],
            ],
            highlightRow: 0,
          },
        ],
        note: 'بدل ما نكرر بيانات Sara، بنخزن رقمها بس في user_id',
      },
      result: 'FK: user_id',
    },

    // 3. The relationship between `orders.user_id` and `users.id` + Short SQL JOIN
    {
      id: 'fk-pk-relationship',
      kind: 'codeDemo',
      at: 'العلاقة',
      label: 'STEP 3 · RELATIONAL LINK',
      title: 'العلاقة بين orders.user_id و users.id',
      pill: 'RELATIONAL DB · FK → PK',
      pillTone: 'good',
      filename: 'join.sql',
      language: 'sql',
      skipTyping: true,
      code: `SELECT orders.id, users.name, orders.total\nFROM orders\nJOIN users ON orders.user_id = users.id;`,
      highlightLines: [3],
      viz: {
        type: 'relation',
        tables: [
          {
            name: 'users',
            columns: [{ name: 'id', pk: true }, 'name'],
            rows: [[42, 'Sara']],
          },
          {
            name: 'orders',
            columns: [
              { name: 'id', pk: true },
              { name: 'user_id', fk: true, highlight: true },
              'total',
            ],
            rows: [[101, 42, 250]],
          },
        ],
        link: {
          fromTable: 'orders',
          fromColumn: 'user_id',
          toTable: 'users',
          toColumn: 'id',
          value: 42,
          label: 'REFERENCES',
        },
        note: 'orders.user_id = 42 بيشاور مباشرة على users.id = 42',
      },
      result: '1:N Relation',
    },

    // 4. Comparison between Primary Key and Foreign Key
    {
      id: 'pk-vs-fk',
      kind: 'compare',
      at: 'الفرق',
      label: 'KEY DIFFERENCE',
      title: 'Primary Key vs Foreign Key',
      pill: 'PK VS FK',
      sides: [
        {
          title: 'Primary Key (PK)',
          badge: 'users.id',
          tone: 'good',
          code: `id INT PRIMARY KEY`,
          items: [
            'بيعرّف الصف جوه نفس الجدول',
            'لازم يكون Unique وممنوع يبقى NULL',
          ],
        },
        {
          title: 'Foreign Key (FK)',
          badge: 'orders.user_id',
          tone: 'ink',
          code: `user_id INT REFERENCES users(id)`,
          items: [
            'بيربط الجدول بـ Primary Key في جدول تاني',
            'ممكن يتكرر لو المستخدم عنده كذا طلب',
          ],
        },
      ],
    },

    // 5. Takeaway
    {
      id: 'takeaway',
      kind: 'statement',
      variant: 'takeaway',
      at: 'الخلاصة',
      label: 'FINAL TAKEAWAY',
      text: 'الـ [Primary Key] هو بطاقة تعريف الصف...\nوالـ [Foreign Key] هو الخيط اللي بيربط الجداول ببعض.',
    },
  ],
});
