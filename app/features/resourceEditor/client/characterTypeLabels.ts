import type { CharacterType } from '@/domain/resourcePack/contracts/character';

export const CHARACTER_TYPE_LABELS = {
	Self: '自机',
	Special: '稀客',
	Normal: '普客',
	Unknown: '未知类型',
} as const satisfies Record<CharacterType, string>;
