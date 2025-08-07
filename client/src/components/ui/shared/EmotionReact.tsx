import React, { FC, SVGProps } from 'react';

import {
  AngryReactionIcon,
  HahaReactionIcon,
  LikeReactionIcon,
  LoveReactionIcon,
  SadReactionIcon,
  WowReactionIcon
} from 'src/assets/icons';
import { EMessageEmotionType } from 'src/constants/enum';

interface ReactionIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  type: EMessageEmotionType;
}

const REACT_EMOTION_ICONS_MAPPING = {
  [EMessageEmotionType.LIKE]: LikeReactionIcon,
  [EMessageEmotionType.LOVE]: LoveReactionIcon,
  [EMessageEmotionType.HAHA]: HahaReactionIcon,
  [EMessageEmotionType.WOW]: WowReactionIcon,
  [EMessageEmotionType.SAD]: SadReactionIcon,
  [EMessageEmotionType.ANGRY]: AngryReactionIcon
};

const EmotionReact: FC<ReactionIconProps> = ({
  size = 30,
  type,
  ...otherProps
}) => {
  const IconComponent = REACT_EMOTION_ICONS_MAPPING[type];
  return <IconComponent width={size} height={size} {...otherProps} />;
};

export default EmotionReact;
