import type { CookerType } from '@/domain/resourcePack/contracts/items';

export const COOKER_TYPES = [
	'Pot',
	'Grill',
	'Fryer',
	'Steamer',
	'CuttingBoard',
] as const satisfies readonly CookerType[];

export const COOKER_TYPE_NAMES = {
	CuttingBoard: '料理台',
	Fryer: '油锅',
	Grill: '烧烤架',
	Pot: '煮锅',
	Steamer: '蒸锅',
} as const satisfies Record<CookerType, string>;
