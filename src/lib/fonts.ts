import { loadFont as loadCairo } from '@remotion/google-fonts/Cairo';
import { loadFont as loadFiraCode } from '@remotion/google-fonts/FiraCode';

export const { fontFamily: ARABIC_FONT } = loadCairo('normal', {
  weights: ['700', '800'],
  subsets: ['arabic', 'latin'],
});

export const { fontFamily: CODE_FONT } = loadFiraCode('normal', {
  weights: ['400', '500'],
  subsets: ['latin'],
});
