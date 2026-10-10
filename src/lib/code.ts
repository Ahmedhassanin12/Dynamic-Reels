import { CODE_SNAP } from '../config';

export const typingFrames = (code: string) => Math.ceil(code.length / CODE_SNAP.charsPerFrame);
