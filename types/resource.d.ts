export type CharacterType = 'Self' | 'Special' | 'Normal' | 'Unknown';

export interface CharacterPortrait {
	pid: number;
	label?: string;
	path: string;
}

export interface Request {
	tagId: number;
	request: string;
}

export interface LikeTag {
	tagId: number;
	weight: number;
}

export interface SpawnConfig {
	izakayaId: number;
	relativeProb: number;
	onlySpawnAfterUnlocking: boolean;
	onlySpawnWhenPlaceBeRecorded: boolean;
}

export interface GuestInfo {
	fundRangeLower: number;
	fundRangeUpper: number;
	evaluation: string[];
	conversation: string[];
	foodRequests: Request[];
	bevRequests: Request[];
	hateFoodTag: number[];
	likeFoodTag: LikeTag[];
	likeBevTag: LikeTag[];
	spawn?: SpawnConfig[] | undefined;
}

export interface CharacterSpriteSet {
	name: string;
	mainSprite: string[];
	eyeSprite: string[];
}

export interface Character {
	id: number;
	name: string;
	label: string;
	descriptions?: string[];
	type: CharacterType;
	portraits?: CharacterPortrait[] | undefined;
	guest?: GuestInfo | undefined;
	characterSpriteSetCompact?: CharacterSpriteSet | undefined;
}

export interface Dialog {
	characterId: number;
	characterType: CharacterType;
	pid: number;
	position: 'Left' | 'Right';
	text: string;
}

export interface DialogPackage {
	name: string;
	dialogList: Dialog[];
}

export interface Ingredient {
	id: number;
	name: string;
	description: string;
	level: number;
	prefix: number;
	isFish: boolean;
	isMeat: boolean;
	isVeg: boolean;
	baseValue: number;
	tags: number[];
	spritePath: string;
}

export interface ResourceEx {
	characters: Character[];
	dialogPackages: DialogPackage[];
	ingredients: Ingredient[];
}
