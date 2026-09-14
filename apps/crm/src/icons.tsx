import {
  IconBriefcase,
  IconBuilding,
  IconLayoutDashboard,
  IconListCheck,
  IconPhone,
  IconQuestionMark,
  IconSettings,
  IconUser,
  IconUsers,
  type IconProps,
} from '@tabler/icons-react';
import type { ComponentType } from 'react';

const REGISTRY: Record<string, ComponentType<IconProps>> = {
  IconBriefcase,
  IconBuilding,
  IconLayoutDashboard,
  IconListCheck,
  IconPhone,
  IconSettings,
  IconUser,
  IconUsers,
};

export function resolveIcon(name?: string): ComponentType<IconProps> {
  if (!name) return IconQuestionMark;
  return REGISTRY[name] ?? IconQuestionMark;
}
