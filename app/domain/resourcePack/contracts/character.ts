export type CharacterType = 'Self' | 'Special' | 'Normal' | 'Unknown';

export interface CharacterPortrait {
	pid: number;
	label?: string;
	path: string;
}

export interface Request {
	tagId: number;
	request: string;
	enable: boolean;
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

export interface KizunaInfo {
	lv1UpgradePrerequisiteEvent?: string;
	lv2UpgradePrerequisiteEvent?: string;
	lv3UpgradePrerequisiteEvent?: string;
	lv4UpgradePrerequisiteEvent?: string;
	lv1Welcome?: string[];
	lv2Welcome?: string[];
	lv3Welcome?: string[];
	lv4Welcome?: string[];
	lv5Welcome?: string[];
	lv1ChatData?: string[];
	lv2ChatData?: string[];
	lv3ChatData?: string[];
	lv4ChatData?: string[];
	lv5ChatData?: string[];
	lv2InviteSucceed?: string[];
	lv2InviteFailed?: string[];
	lv3InviteSucceed?: string[];
	lv3InviteFailed?: string[];
	lv4InviteSucceed?: string[];
	lv4InviteFailed?: string[];
	lv5InviteSucceed?: string[];
	lv3RequestIngerdient?: string[];
	lv4RequestIngerdient?: string[];
	lv5RequestIngerdient?: string[];
	lv4RequestBeverage?: string[];
	lv5RequestBeverage?: string[];
	lv5Commision?: string[];
	lv5CommisionFinish?: string[];
	commisionAreaLabel?: string;
}

export interface SpawnMarker {
	mapLabel: string;
	x: number;
	y: number;
	rotation: 'Down' | 'Up' | 'Left' | 'Right';
}

export interface Character {
	id: number;
	name: string;
	label: string;
	descriptions?: string[];
	type: CharacterType;
	spawnMarker?: SpawnMarker;
	faceInNoteBook?: number | undefined;
	portraits?: CharacterPortrait[] | undefined;
	guest?: GuestInfo | undefined;
	kizuna?: KizunaInfo | undefined;
	characterSpriteSetCompact?: CharacterSpriteSet | undefined;
	hideInAlbum?: boolean;
	isParticular?: boolean;
	isCollabCharacter?: boolean;
}
