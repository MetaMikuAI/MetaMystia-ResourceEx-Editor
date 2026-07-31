export type ProductType =
	| 'Food'
	| 'Ingredient'
	| 'Beverage'
	| 'Money'
	| 'Mission'
	| 'Item'
	| 'Recipe'
	| 'Izakaya'
	| 'Cooker'
	| 'Partner'
	| 'Badge'
	| 'Trophy';

export interface ProductConfig {
	productType: ProductType;
	productId: number;
	productAmount: number;
	productLabel: string;
}

export interface MerchandiseConfig {
	item: ProductConfig;
	itemAmountMin: number;
	itemAmountMax: number;
	sellProbability: number;
}

export interface MerchantConfig {
	key: string;
	welcomeDialogPackageNames: string[];
	nullDialogPackageNames: string[];
	priceMultiplierMin: number;
	priceMultiplierMax: number;
	leastSellNum: number;
	merchandise: MerchandiseConfig[];
}
