import type { Character } from './character';
import type { DialogPackage } from './dialogue';
import type { EventNode } from './event';
import type { Beverage, Clothes, Food, Ingredient, Recipe } from './items';
import type { MerchantConfig } from './merchant';
import type { MissionNode } from './mission';

export interface PackInfo {
	name?: string;
	label?: string;
	authors?: string[];
	dependencies?: string[];
	description?: string;
	version?: string;
	idRangeStart?: number | undefined;
	idRangeEnd?: number | undefined;
	idSignature?: string | undefined;
}

export interface ResourceEx {
	packInfo: PackInfo;
	characters: Character[];
	dialogPackages: DialogPackage[];
	ingredients: Ingredient[];
	foods: Food[];
	beverages: Beverage[];
	recipes: Recipe[];
	missionNodes: MissionNode[];
	merchants: MerchantConfig[];
	clothes: Clothes[];
	eventNodes: EventNode[];
}
