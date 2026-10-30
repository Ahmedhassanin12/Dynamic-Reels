import { SceneFrame } from './SceneFrame';
import { LikeHeartAnim } from '../anim/LikeHeartAnim';
import { PacketFlowAnim } from '../anim/PacketFlowAnim';
import type { SceneOf } from '../types';

/** Animated illustration scene (see `MotionAnim` in types/scene.ts for the available animations). */
export const MotionScene = ({ label, title, pill, anim }: SceneOf<'motion'>) => (
  <SceneFrame label={label} title={title} pill={pill}>
    {anim.type === 'likeHeart' && <LikeHeartAnim anim={anim} />}
    {anim.type === 'packetFlow' && <PacketFlowAnim anim={anim} />}
  </SceneFrame>
);
