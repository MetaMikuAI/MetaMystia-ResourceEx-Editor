import type { ProductType } from '@/domain/resourcePack/contracts/merchant';

export const PRODUCT_TYPE_LABELS = {
	Badge: '徽章（Badge）',
	Beverage: '酒水（Beverage）',
	Cooker: '厨具（Cooker）',
	Food: '料理（Food）',
	Ingredient: '食材（Ingredient）',
	Item: '物品（Item）',
	Izakaya: '雀食堂（Izakaya）',
	Mission: '任务（Mission）',
	Money: '金钱（Money）',
	Partner: '伙伴（Partner）',
	Recipe: '食谱（Recipe）',
	Trophy: '奖杯（Trophy）',
} as const satisfies Record<ProductType, string>;

export const PRODUCT_TYPE_OPTIONS = [
	{ value: 'Food', label: PRODUCT_TYPE_LABELS.Food },
	{ value: 'Ingredient', label: PRODUCT_TYPE_LABELS.Ingredient },
	{ value: 'Beverage', label: PRODUCT_TYPE_LABELS.Beverage },
	{ value: 'Recipe', label: PRODUCT_TYPE_LABELS.Recipe },
	{ value: 'Money', label: PRODUCT_TYPE_LABELS.Money },
	{ value: 'Mission', label: PRODUCT_TYPE_LABELS.Mission },
	{ value: 'Item', label: PRODUCT_TYPE_LABELS.Item },
	{ value: 'Izakaya', label: PRODUCT_TYPE_LABELS.Izakaya },
	{ value: 'Cooker', label: PRODUCT_TYPE_LABELS.Cooker },
	{ value: 'Partner', label: PRODUCT_TYPE_LABELS.Partner },
	{ value: 'Badge', label: PRODUCT_TYPE_LABELS.Badge },
	{ value: 'Trophy', label: PRODUCT_TYPE_LABELS.Trophy },
] as const satisfies readonly { label: string; value: ProductType }[];
