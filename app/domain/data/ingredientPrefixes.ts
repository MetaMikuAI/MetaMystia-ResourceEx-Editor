export interface IngredientPrefixOption {
	id: number;
	label: string;
}

export const INGREDIENT_PREFIX_NONE_ID = -1;

export const INGREDIENT_PREFIXES: IngredientPrefixOption[] = [
	{ id: -1, label: '无' },
	{ id: 0, label: '夹肉' },
	{ id: 1, label: '林间' },
	{ id: 2, label: '野性' },
	{ id: 3, label: '家常' },
	{ id: 4, label: '地味' },
	{ id: 5, label: '催泪' },
	{ id: 6, label: '海味' },
	{ id: 7, label: '招牌' },
	{ id: 8, label: '鲜美' },
	{ id: 9, label: '洄游' },
	{ id: 10, label: '山猪' },
	{ id: 11, label: '极鲜' },
	{ id: 12, label: '伞' },
	{ id: 13, label: '山之主' },
	{ id: 14, label: '海皇' },
	{ id: 15, label: '粉嫩' },
	{ id: 16, label: '秋之' },
	{ id: 17, label: '海鲜' },
	{ id: 18, label: '甜甜' },
	{ id: 19, label: '虫族' },
	{ id: 20, label: '超梦幻' },
	{ id: 21, label: '朝露' },
	{ id: 22, label: '家常' },
	{ id: 23, label: '节节高' },
	{ id: 24, label: '黄油' },
	{ id: 25, label: '勾芡' },
	{ id: 26, label: '竹筒' },
	{ id: 27, label: '软软' },
	{ id: 28, label: '月之' },
	{ id: 29, label: '冰' },
	{ id: 30, label: '激辣' },
];

const PREFIX_LABEL_MAP = new Map(
	INGREDIENT_PREFIXES.map((p) => [p.id, p.label])
);

export function getIngredientPrefixLabel(id: number): string {
	return PREFIX_LABEL_MAP.get(id) ?? `未知（${id}）`;
}
