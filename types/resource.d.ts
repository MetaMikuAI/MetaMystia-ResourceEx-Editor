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

export interface Food {
	id: number;
	name: string;
	description: string;
	level: number;
	baseValue: number;
	tags: number[];
	banTags: number[];
	spritePath: string;
}

export type CookerType = 'Pot' | 'Grill' | 'Fryer' | 'Steamer' | 'CuttingBoard';

export interface Recipe {
	id: number;
	foodId: number;
	ingredients: number[];
	cookTime: number;
	cookerType: CookerType;
}

export type MissionType = 'Main' | 'Side' | 'Kitsuna';

export type RewardType =
	| 'UnlockNPC'
	| 'ScheduleNews'
	| 'DismissNews'
	| 'ModifyPopSystem'
	| 'ToggleResourcePoint'
	| 'SetGlobalGuestFundModifier'
	| 'SetObjectPriceModifier'
	| 'DismissEvents'
	| 'RequestNPC'
	| 'DismissNPC'
	| 'AddNPCDialog'
	| 'RemoveNPCDialog'
	| 'ToggleInteractableEntity'
	| 'UnlockMap'
	| 'SetEnableInteractablesUI'
	| 'SetIzakayaIndex'
	| 'GiveItem'
	| 'SetDaySpecialNPCVisibility'
	| 'SetNPCDialog'
	| 'UpgradeKizunaLevel'
	| 'SetCanHaveLevel5Kizuna'
	| 'GetFund'
	| 'ToggleSwitchEntity'
	| 'SetLevelCap'
	| 'CouldSpawnTewi'
	| 'TewiSpawnTonight'
	| 'AskReimuProtectYou'
	| 'AddToKourindoStaticMerchandise'
	| 'EnableMultiPartnerMode'
	| 'SetPartnerCount'
	| 'MoveToChallenge'
	| 'CancelEvent'
	| 'MoveToStaff'
	| 'EnableSpecialGuestSpawnInNight'
	| 'EnableSGuestSpawnInTargetIzakayaById'
	| 'EnableSGuestSpawnInTargetIzakayaByMap'
	| 'UnlockSGuestInNotebook'
	| 'SetTargetMissionFulfilled'
	| 'UnlockMusicGameChapter'
	| 'RemoveKourindouMerchandise'
	| 'FinishFakeMission'
	| 'ForceCompleteMission'
	| 'RefreshRandomSpawnNpc'
	| 'AddLockedRecipe'
	| 'ClearLockedRecipe'
	| 'AddEffectiveSGuestMapping'
	| 'RemoveEffectiveSGuestMapping'
	| 'FinishEvent'
	| 'StartOrContinueRogueLike'
	| 'ControlSpecialGuestScheduled'
	| 'CancelControlSpecialGuestScheduled'
	| 'IgnoreSpecialGuest'
	| 'AddDLCLock'
	| 'RemoveDLCLock'
	| 'StopAllUnmanagedMovingProcess'
	| 'NotifySpecialGuestSpawnInNight'
	| 'SetAndSavePlayerPref';

export type ConditionType =
	| 'BillRepayment'
	| 'TalkWithCharacter'
	| 'InspectInteractable'
	| 'SubmitItem'
	| 'ServeInWork'
	| 'SubmitByTag'
	| 'SubmitByTags'
	| 'SellInWork'
	| 'SubmitByIngredients'
	| 'CompleteSpecifiedFollowingTasks'
	| 'CompleteSpecifiedFollowingTasksSubCondition'
	| 'ReachTargetCharacterKisunaLevel'
	| 'FakeMission'
	| 'SubmitByAnyOneTag'
	| 'CompleteSpecifiedFollowingEvents'
	| 'SubmitByLevel';

export interface MissionCondition {
	conditionType: ConditionType;
	amount?: number;
	sellableType?: 'Food' | 'Beverage';
	label?: string;
}

export type ObjectType =
	| 'Food'
	| 'Ingredient'
	| 'Beverage'
	| 'Item'
	| 'Recipe'
	| 'Izakaya'
	| 'Partner'
	| 'Badge'
	| 'Cooker';

export interface MissionReward {
	rewardType: RewardType;
	rewardId?: string;
	objectType?: ObjectType;
	rewardIntArray?: number[];
}

export interface MissionNode {
	title: string;
	description: string;
	label: string;
	debugLabel: string;
	missionType: MissionType;
	sender: string;
	reciever: string;
	rewards: MissionReward[];
	finishConditions: MissionCondition[];
	postMissionsAfterPerformance?: string[];
}

export interface PackInfo {
	name?: string;
	label?: string;
	authors?: string[];
	description?: string;
	version?: string;
}

export interface ResourceEx {
	packInfo: PackInfo;

	characters: Character[];
	dialogPackages: DialogPackage[];
	ingredients: Ingredient[];
	foods: Food[];
	recipes: Recipe[];
	missionNodes: MissionNode[];
}
