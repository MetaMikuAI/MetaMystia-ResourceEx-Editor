import {
	Character,
	CharacterPortrait,
	GuestInfo,
	CharacterSpriteSet,
} from '@/types/resource';
import { BasicInfo } from './editor/BasicInfo';
import { Descriptions } from './editor/Descriptions';
import { Portraits } from './editor/Portraits';
import { GuestInfoEditor } from './editor/GuestInfo';
import { SpriteSetEditor } from './editor/SpriteSet';

interface CharacterEditorProps {
	character: Character | null;
	isIdDuplicate: boolean;
	onUpdate: (updates: Partial<Character>) => void;
	onRemove: () => void;
}

export function CharacterEditor({
	character,
	isIdDuplicate,
	onUpdate,
	onRemove,
}: CharacterEditorProps) {
	if (!character) {
		return (
			<div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md md:col-span-2">
				<div className="flex h-full items-center justify-center italic opacity-40">
					请从左侧选择一个角色进行编辑，或点击 + 号添加新角色
				</div>
			</div>
		);
	}

	const updateDescription = (index: number, value: string) => {
		const newDescriptions = [...(character.descriptions || [])];
		newDescriptions[index] = value;
		onUpdate({ descriptions: newDescriptions });
	};

	const addPortrait = () => {
		const portraits = character.portraits || [];
		const nextPid =
			portraits.length > 0
				? Math.max(...portraits.map((p) => p.pid)) + 1
				: 0;
		const label = character.label || 'Character';
		onUpdate({
			portraits: [
				...portraits,
				{ pid: nextPid, path: `assets/${label}_${nextPid}.png` },
			],
		});
	};

	const updatePortrait = (
		index: number,
		updates: Partial<CharacterPortrait>
	) => {
		const portraits = [...(character.portraits || [])];
		portraits[index] = {
			...portraits[index],
			...updates,
		} as CharacterPortrait;
		onUpdate({ portraits });
	};

	const removePortrait = (index: number) => {
		const portraits = [...(character.portraits || [])];
		portraits.splice(index, 1);
		onUpdate({ portraits });
	};

	const updateGuest = (updates: Partial<GuestInfo>) => {
		const defaultGuest: GuestInfo = {
			fundRangeLower: 0,
			fundRangeUpper: 0,
			evaluation: Array(9).fill(''),
			conversation: [],
			foodRequests: [],
			bevRequests: [],
			hateFoodTag: [],
			likeFoodTag: [],
			likeBevTag: [],
		};
		const guest = {
			...defaultGuest,
			...(character.guest || {}),
			...updates,
		};
		onUpdate({ guest });
	};

	const enableGuest = () => {
		updateGuest({});
	};

	const disableGuest = () => {
		onUpdate({ guest: undefined });
	};

	const updateSpriteSet = (updates: Partial<CharacterSpriteSet>) => {
		const spriteSet = character.characterSpriteSetCompact || {
			name: character.label || '',
			mainSprite: Array(12).fill(''),
			eyeSprite: Array(24).fill(''),
		};
		onUpdate({ characterSpriteSetCompact: { ...spriteSet, ...updates } });
	};

	const enableSpriteSet = () => {
		const label = character.label || 'Unknown';
		const mainSprite = [];
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 3; col++) {
				mainSprite.push(
					`assets/${label}/${label}_Main_${row}, ${col}.png`
				);
			}
		}
		const eyeSprite = [];
		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 4; col++) {
				eyeSprite.push(
					`assets/${label}/${label}_Eyes_${row}, ${col}.png`
				);
			}
		}
		updateSpriteSet({ name: label, mainSprite, eyeSprite });
	};

	const disableSpriteSet = () => {
		onUpdate({ characterSpriteSetCompact: undefined });
	};

	const generateDefaultSprites = () => {
		const label = character.label || 'Unknown';
		const mainSprite = [];
		for (let row = 0; row < 4; row++) {
			for (let col = 0; col < 3; col++) {
				mainSprite.push(
					`assets/${label}/${label}_Main_${row}, ${col}.png`
				);
			}
		}
		const eyeSprite = [];
		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 4; col++) {
				eyeSprite.push(
					`assets/${label}/${label}_Eyes_${row}, ${col}.png`
				);
			}
		}
		updateSpriteSet({ name: label, mainSprite, eyeSprite });
	};

	return (
		<div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md md:col-span-2">
			<div className="flex flex-col gap-8">
				<div className="flex items-center justify-between border-b border-white/10 pb-4">
					<div className="flex items-center gap-4">
						<h2 className="text-2xl font-bold">
							编辑角色: {character.name}
						</h2>
						<span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-bold text-primary">
							{character.type}
						</span>
					</div>
					<button
						onClick={onRemove}
						className="rounded-lg bg-danger/20 px-3 py-1 text-sm font-bold text-danger transition-colors hover:bg-danger/30"
					>
						删除角色
					</button>
				</div>

				<BasicInfo
					character={character}
					isIdDuplicate={isIdDuplicate}
					onUpdate={onUpdate}
				/>

				<Descriptions
					descriptions={character.descriptions}
					onUpdate={updateDescription}
				/>

				<Portraits
					portraits={character.portraits || []}
					onAdd={addPortrait}
					onUpdate={updatePortrait}
					onRemove={removePortrait}
				/>

				<GuestInfoEditor
					guest={character.guest}
					onUpdate={updateGuest}
					onEnable={enableGuest}
					onDisable={disableGuest}
				/>

				<SpriteSetEditor
					spriteSet={character.characterSpriteSetCompact}
					label={character.label}
					onUpdate={updateSpriteSet}
					onEnable={enableSpriteSet}
					onDisable={disableSpriteSet}
					onGenerateDefaults={generateDefaultSprites}
				/>
			</div>
		</div>
	);
}
