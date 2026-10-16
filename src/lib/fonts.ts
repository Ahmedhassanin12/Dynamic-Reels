import { loadFont as loadFiraCode } from '@remotion/google-fonts/FiraCode';
import { loadFont as loadReadexPro } from '@remotion/google-fonts/ReadexPro';

export const { fontFamily: ARABIC_FONT } = loadReadexPro('normal', {
  weights: ['700'],
  subsets: ['arabic', 'latin'],
});

export const { fontFamily: CODE_FONT } = loadFiraCode('normal', {
  weights: ['400', '500', '600', '700'],
  subsets: ['latin'],
});
