import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import JSZip from 'jszip';

const ROOT = resolve(process.cwd(), 'fixtures/resource-pack/inputs');
const FIXED_DATE = new Date('2000-01-01T00:00:00.000Z');
const PNG_1X1 = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
	'base64'
);
const WAV_MINIMAL = Buffer.from(
	'UklGRiQAAABXQVZFZm10IBAAAAABAAEAgD4AAIA+AAABAAgAZGF0YQAAAAA=',
	'base64'
);

const createBaseResourcePack = (label) => ({
	packInfo: {
		name: `${label} Resource Pack`,
		label,
		authors: ['Task 1'],
		description: 'Deterministic baseline fixture',
		version: '1.0.0',
	},
	characters: [],
	dialogPackages: [],
	ingredients: [],
	foods: [],
	beverages: [],
	recipes: [],
	missionNodes: [],
	eventNodes: [],
	merchants: [],
	clothes: [],
});

const addEntry = (zip, name, data, options = {}) => {
	zip.file(name, data, {
		createFolders: false,
		date: FIXED_DATE,
		...options,
	});
};

const addDirectory = (zip, name) => {
	addEntry(zip, name.endsWith('/') ? name : `${name}/`, null, { dir: true });
};

const addResourcePackJson = (zip, resourcePack) => {
	addEntry(zip, 'ResourceEx.json', `${JSON.stringify(resourcePack, null, 2)}\n`);
};

const addArchiveTruthTableEntries = (zip) => {
	addDirectory(zip, 'assets/');
	addDirectory(zip, 'assets/Empty/');
	addDirectory(zip, 'assets/Nested/');
	addDirectory(zip, 'assets/Nested/Empty/');
	addEntry(zip, 'assets/CG/scene.png', PNG_1X1);
	addEntry(zip, 'assets/BG/background.png', PNG_1X1);
	addEntry(zip, 'assets/Audio/test.wav', WAV_MINIMAL);
	addEntry(zip, 'assets/Unreferenced/keep.bin', Buffer.from('managed-unreferenced\n'));
	addEntry(zip, 'external/referenced.png', PNG_1X1);
	addEntry(zip, 'external/unreferenced.bin', Buffer.from('drop-on-export\n'));
	addDirectory(zip, 'external/ignored-empty/');
	addEntry(zip, '__MACOSX/._ResourceEx.json', Buffer.from('ignored\n'));
};

const writeZip = async (name, configure) => {
	const zip = new JSZip();
	await configure(zip);
	const bytes = await zip.generateAsync({
		compression: 'STORE',
		platform: 'DOS',
		streamFiles: false,
		type: 'nodebuffer',
	});
	const path = resolve(ROOT, name);
	await writeFile(path, bytes);
	return {
		bytes: bytes.length,
		file: name,
		sha256: createHash('sha256').update(bytes).digest('hex'),
	};
};

await mkdir(ROOT, { recursive: true });

const results = [];

results.push(
	await writeZip('minimal.zip', async (zip) => {
		addResourcePackJson(zip, createBaseResourcePack('FixtureMinimal'));
		addDirectory(zip, 'assets/');
	})
);

results.push(
	await writeZip('legacy-pack-info-precedence.zip', async (zip) => {
		const resourcePack = {
			...createBaseResourcePack('FixturePackInfoWins'),
			name: 'Legacy Name Must Be Ignored',
			label: 'LegacyLabelMustBeIgnored',
			authors: ['Legacy Author'],
			description: 'Legacy description must be ignored',
			version: '9.9.9',
			packInfo: {
				...createBaseResourcePack('FixturePackInfoWins').packInfo,
				license: 'legacy JSON license must be ignored',
			},
			characters: [
				{
					id: 9001,
					name: 'Legacy Character',
					label: '_FixturePackInfoWins_Character',
					type: 'Special',
					descriptions: ['one'],
					guest: {
						fundRangeLower: 1,
						fundRangeUpper: 2,
						evaluation: ['A'],
						conversation: [],
						foodRequests: [{ tagId: 2, request: 'food' }],
						bevRequests: [{ tagId: 3, request: 'bev', enable: false }],
						hateFoodTag: [9, 1],
						likeFoodTag: [
							{ tagId: 2, weight: 1 },
							{ tagId: 1, weight: 2 },
						],
						likeBevTag: [{ tagId: 3, weight: 1 }],
						spawn: [
							{
								izakayaId: 2,
								relativeProb: 1,
								onlySpawnAfterUnlocking: false,
								onlySpawnWhenPlaceBeRecorded: false,
							},
							{
								izakayaId: 1,
								relativeProb: 1,
								onlySpawnAfterUnlocking: false,
								onlySpawnWhenPlaceBeRecorded: false,
							},
						],
					},
				},
			],
			foods: [
				{
					id: 9003,
					name: 'Legacy Food',
					description: '',
					level: 1,
					baseValue: 1,
					tags: [3, 1],
					banTags: [4, 2],
					spritePath: '',
				},
			],
			beverages: null,
			recipes: null,
			missionNodes: [
				{
					name: 'Legacy Mission',
					debugLabel: '',
					missionType: 'Kitsuna',
					receiver: 'Legacy Receiver',
				},
			],
			eventNodes: [
				{
					label: '_FixturePackInfoWins_Event',
					debugLabel: 'Legacy Event',
					trigger: { triggerType: 'OnTalkWithCharacter' },
					eventData: { eventType: 'Null' },
				},
			],
			clothes: [
				{
					id: 9004,
					name: 'Legacy Clothes',
					description: '',
					spritePath: '',
					portraitPath: '',
				},
			],
		};
		delete resourcePack.ingredients;
		delete resourcePack.merchants;
		addResourcePackJson(zip, resourcePack);
		addDirectory(zip, 'assets/');
	})
);

results.push(
	await writeZip('legacy-top-level-pack-info.zip', async (zip) => {
		const resourcePack = createBaseResourcePack('unused');
		delete resourcePack.packInfo;
		Object.assign(resourcePack, {
			name: 'Legacy Top-Level Pack',
			label: 'FixtureLegacyTopLevel',
			authors: ['Legacy Author'],
			description: 'Built from legacy top-level fields',
			version: '2.3.4',
		});
		addResourcePackJson(zip, resourcePack);
		addDirectory(zip, 'assets/');
	})
);

for (const licenseVariant of ['missing', 'empty', 'nonempty']) {
	results.push(
		await writeZip(`archive-license-${licenseVariant}.zip`, async (zip) => {
			const resourcePack = createBaseResourcePack(
				`FixtureLicense${licenseVariant[0].toUpperCase()}${licenseVariant.slice(1)}`
			);
			resourcePack.ingredients.push({
				id: 9005,
				name: 'External Asset Reference',
				description: '',
				level: 1,
				prefix: -1,
				isFish: false,
				isMeat: false,
				isVeg: true,
				baseValue: 1,
				tags: [],
				spritePath: 'external/referenced.png',
			});
			resourcePack.dialogPackages.push({
				name: `_${resourcePack.packInfo.label}_ArchiveActions`,
				dialogList: [
					{
						characterId: 0,
						characterType: 'Special',
						pid: 0,
						position: 'Left',
						text: 'Archive references',
						actions: [
							{ actionType: 'CG', sprite: 'assets/CG/scene.png' },
							{ actionType: 'BG', sprite: 'assets/BG/background.png' },
							{ actionType: 'Sound', sound: 'assets/Audio/test.wav' },
						],
					},
				],
			});
			addResourcePackJson(zip, resourcePack);
			if (licenseVariant === 'empty') addEntry(zip, 'LICENSE.md', '');
			if (licenseVariant === 'nonempty') {
				addEntry(zip, 'LICENSE.md', 'Line one\r\nLine two  \n');
			}
			addArchiveTruthTableEntries(zip);
		})
	);
}

results.push(
	await writeZip('invalid-characters-shape.zip', async (zip) => {
		const resourcePack = createBaseResourcePack('FixtureInvalidCharacters');
		resourcePack.characters = { invalid: true };
		addResourcePackJson(zip, resourcePack);
		addDirectory(zip, 'assets/');
	})
);

results.push(
	await writeZip('dialog-actions.zip', async (zip) => {
		const resourcePack = createBaseResourcePack('FixtureDialogActions');
		resourcePack.dialogPackages.push({
			name: '_FixtureDialogActions_AllActions',
			dialogList: [
				{
					characterId: 0,
					characterType: 'Special',
					pid: 0,
					position: 'Left',
					text: 'All actions',
					actions: [
						{ actionType: 'CameraShake', sprite: 'discarded.png' },
						{ actionType: 'CG', sprite: 'assets/CG/scene.png' },
						{
							actionType: 'BG',
							shouldSet: false,
							sprite: 'discarded.png',
						},
						{ actionType: 'Sound', sound: 'assets/Audio/test.wav' },
						{
							actionType: 'Branch',
							options: [
								{ text: 'Paid choice', jump: 2, price: 25 },
								{ text: 'Default jump', price: 0 },
							],
						},
						{ actionType: 'Goto' },
						{ actionType: 'End' },
					],
				},
				{
					characterId: 0,
					characterType: 'Special',
					pid: 0,
					position: 'Right',
					text: 'Empty actions are omitted',
					actions: [],
				},
			],
		});
		addResourcePackJson(zip, resourcePack);
		addDirectory(zip, 'assets/');
		addEntry(zip, 'assets/CG/scene.png', PNG_1X1);
		addEntry(zip, 'assets/Audio/test.wav', WAV_MINIMAL);
	})
);

await writeFile(
	resolve(ROOT, 'sha256.json'),
	`${JSON.stringify(results, null, 2)}\n`
);

console.log(JSON.stringify(results, null, 2));
