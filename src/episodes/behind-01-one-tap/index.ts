import { defineEpisode } from '../../lib/episode';
import voice from './voice.mp3';
import words from './words.json';

/** Series: «إيه اللي بيحصل ورا التطبيق؟» · Episode 1 of 10 */
export const behind01OneTap = defineEpisode({
  id: 'behind-01-one-tap',
  title: 'ضغطة لايك واحدة',
  voice,
  words,
  theme: 'mint',
  corrections: [
    {
      index: 51,
      original: 'Viber',
      corrected: 'فايبر',
      status: 'approved',
      reason: 'Whisper misheard fiber',
    },
    { index: 17, original: 'الوحده', corrected: 'لوحده', status: 'approved', reason: 'Spelling correction' },
    { index: 116, original: 'أزكى', corrected: 'أذكى', status: 'approved', reason: 'Spelling correction' },
  ],
  scenes: [
    {
      // 1. Hook: Heart taps → fills red immediately with particle burst
      id: 'hook',
      kind: 'motion',
      at: 0,
      title: 'ضغطة لايك واحدة',
      pill: 'ONE TAP',
      anim: {
        type: 'likeHeart',
        likes: 1203,
        tapAt: 10,
        statusText: 'السيرفر: لسه ماعرفش!',
      },
    },
    {
      // 2. The Myth vs Reality of Optimistic UI
      id: 'optimistic-myth',
      kind: 'mythReality',
      at: 'Optimistic',
      label: 'EP 1 · THE ILLUSION',
      title: 'خدعة الـ Optimistic UI',
      pill: 'UI ARCHITECTURE',
      myth: {
        label: 'الظن الشائع',
        text: 'القلب احمرّ = السيرفر استلم الطلب وسجله خلاص',
        badge: '✗ غير صحيح',
      },
      reality: {
        label: 'الحقيقة البرمجية',
        text: 'التطبيق بيلوّن الشاشة محلياً فوراً عشان يحسسك بالسرعة قبل رد السيرفر!',
        badge: '✓ الصح والمثبت',
      },
      revealDelayFrames: 18,
    },
    {
      // 3. The physical & network journey across cables
      id: 'network-journey',
      kind: 'motion',
      at: 'الرحلة',
      label: 'EP 1 · PHYSICAL NETWORK',
      title: 'رحلة الطلب في الشبكة',
      pill: 'LATENCY ~40MS',
      anim: {
        type: 'packetFlow',
        hopFrames: 38,
        arriveAt: [8, 48, 88, 128],
        stops: [
          { icon: '📱', label: 'موبايلك', sub: 'ترجمة عنوان الـ IP عبر DNS', badge: 'DNS', tone: 'ink' },
          {
            icon: '🔒',
            label: 'تشفير HTTPS',
            sub: 'تأمين البيانات بـ TLS Handshake',
            badge: 'TLS',
            tone: 'good',
          },
          {
            icon: '🌊',
            label: 'كابلات فايبر البحر',
            sub: 'سفر الإشارة بسرعة الضوء ~40ms',
            badge: 'FIBER',
            tone: 'warn',
          },
          { icon: '🏢', label: 'الداتا سنتر', sub: 'وصول الطلب لمركز البيانات', badge: 'DC', tone: 'good' },
        ],
      },
    },
    {
      // 4. Server cluster processing & JWT verification
      id: 'server-cluster',
      kind: 'diagram',
      layout: 'architecture',
      at: 'Load',
      label: 'EP 1 · BACKEND INFRASTRUCTURE',
      title: 'معالجة الطلب في السيرفر',
      pill: 'CLUSTER',
      highlight: 1,
      nodes: [
        { title: 'Load Balancer', sub: 'توزيع الحمل على آلاف السيرفرات', badge: 'NGINX', tone: 'ink' },
        { title: 'App Server', sub: 'فحص الهوية بـ JWT ومنع التكرار', badge: 'NODE.JS', tone: 'good' },
        { title: 'Database', sub: 'تسجيل الـ Like وتحديث الرقم', badge: 'POSTGRES', tone: 'paper' },
      ],
      edgeLabels: ['Forward Request', 'UPDATE likes + 1'],
      returnEdgeLabels: ['200 OK · Success', 'Row Updated'],
    },
    {
      // 5. The Rollback when an error happens (heart turns back to white!)
      id: 'rollback-action',
      kind: 'motion',
      at: 'ولو',
      label: 'EP 1 · ERROR HANDLING',
      title: 'ماذا لو حصل خطأ في الشبكة؟',
      pill: 'ROLLBACK EVENT',
      anim: {
        type: 'likeHeart',
        likes: 1204,
        tapAt: 0,
        revertAt: 56, // synced with "Rollback والقلب بيرجع أبيض لوحده"
        statusText: 'جاري انتظار التأكيد...',
        failText: 'فشل الإرسال · Rollback ❌',
      },
    },
    {
      // 6. Practical takeaway
      id: 'takeaway',
      kind: 'statement',
      variant: 'takeaway',
      at: 'الخلاصة',
      label: 'EP 1 · LESSON',
      text: 'التطبيق السريع مش دايمًا أسرع في الشبكة.. هو بس **أذكى في إدارة الشاشة!**',
    },
    {
      // 7. Transition to episode 2
      id: 'next-episode',
      kind: 'transition',
      at: 'الوسيط',
      label: 'NEXT EPISODE',
      title: 'الحلقة القادمة',
      fromTitle: 'رحلة اللايك',
      fromBadge: 'EP 1',
      fromSub: 'Optimistic UI · الشبكة · السيرفر',
      bridgeText: 'مين بينقل الطلب ده بأمان؟ ↓',
      toTitle: 'الـ API',
      toBadge: 'EP 2',
      toSub: 'جرسون السيرفرات وحارس البوابة',
    },
  ],
});
