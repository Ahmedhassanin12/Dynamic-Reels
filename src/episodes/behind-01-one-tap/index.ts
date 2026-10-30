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
    { index: 15, original: 'بيبعط', corrected: 'بيبعت', status: 'approved', reason: 'Whisper misheard' },
  ],
  scenes: [
    {
      // Heart taps → fills red with a burst, counter +1, status chip "waiting for server".
      id: 'hook',
      kind: 'motion',
      at: 0,
      title: 'ضغطة لايك واحدة',
      pill: 'ONE TAP',
      anim: { type: 'likeHeart', likes: 1203, tapAt: 8, statusText: 'الطلب لسه مسافر...' },
    },
    {
      // Packet travels phone → server → database, synced to the voiceover words.
      id: 'journey',
      kind: 'motion',
      at: 'اول',
      label: 'EP 1 · THE JOURNEY',
      title: 'رحلة الطلب',
      pill: 'REQUEST',
      anim: {
        type: 'packetFlow',
        hopFrames: 60,
        arriveAt: [36, 132, 240],
        stops: [
          { icon: '📱', label: 'موبايلك', sub: 'ضغطة اللايك', badge: 'CLIENT', tone: 'ink' },
          { icon: '🖥️', label: 'السيرفر', sub: 'بيستلم الطلب ويفكر', badge: 'SERVER', tone: 'warn' },
          { icon: '🗄️', label: 'قاعدة البيانات', sub: 'بتحفظ الرقم الجديد', badge: 'DATABASE', tone: 'good' },
        ],
      },
    },
    {
      // Green response packet travels back up to the phone.
      id: 'response',
      kind: 'motion',
      at: 'وبعدين',
      label: 'EP 1 · THE JOURNEY',
      title: 'الرد بيرجعلك',
      pill: 'RESPONSE · 200 OK',
      anim: {
        type: 'packetFlow',
        hopFrames: 40,
        returnTrip: true,
        arriveAt: [1, 2, 3],
        stops: [
          { icon: '📱', label: 'موبايلك', sub: 'القلب بيتلوّن ❤️', badge: 'CLIENT', tone: 'good' },
          { icon: '🖥️', label: 'السيرفر', sub: 'بيبعت الرد', badge: 'SERVER', tone: 'ink' },
          { icon: '🗄️', label: 'قاعدة البيانات', sub: 'likes = 1,204', badge: 'DATABASE', tone: 'ink' },
        ],
      },
    },
    {
      id: 'speed',
      kind: 'statement',
      variant: 'takeaway',
      at: 'كل',
      text: 'كل ده قبل ما ترفع صباعك: **أقل من ثانية**',
    },
    {
      id: 'next',
      kind: 'transition',
      at: 'الحلقات',
      label: 'NEXT EPISODE',
      title: 'الحلقة الجاية',
      fromTitle: 'رحلة اللايك',
      fromBadge: 'EP 1',
      fromSub: 'موبايل ← Server ← Database',
      bridgeText: 'أول محطة: مين بيوصّل الطلب؟ ↓',
      toTitle: 'الـ API',
      toBadge: 'EP 2',
      toSub: 'الجرسون اللي بين التطبيق والسيرفر',
    },
  ],
});
