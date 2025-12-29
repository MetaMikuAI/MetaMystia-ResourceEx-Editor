export type CharacterType = 'Self' | 'Special' | 'Normal' | 'Unknown';

export interface CharacterPortrait {
	pid: number;
	path: string;
}

export interface FoodRequest {
	tagId: number;
	request: string;
	enabled?: boolean | undefined;
}

export interface LikeTag {
	tagId: number;
	weight: number;
}

export interface GuestInfo {
	fundRangeLower: number;
	fundRangeUpper: number;
	evaluation: string[];
	conversation: string[];
	foodRequests: FoodRequest[];
	hateFoodTag: number[];
	likeFoodTag: LikeTag[];
	likeBevTag: LikeTag[];
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
	descriptions: string[];
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

export interface ResourceEx {
	characters: Character[];
	dialogPackages: DialogPackage[];
}
