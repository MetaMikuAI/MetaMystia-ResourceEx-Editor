import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import JSZip from 'jszip';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function resolveProjectModule(specifier, parentURL) {
	const candidateBase = specifier.startsWith('@/')
		? resolve(repositoryRoot, 'app', specifier.slice(2))
		: resolve(dirname(fileURLToPath(parentURL)), specifier);
	const candidates = extname(candidateBase)
		? [candidateBase]
		: [`${candidateBase}.ts`, `${candidateBase}.tsx`, candidateBase];

	for (const candidate of candidates) {
		if (existsSync(candidate)) return pathToFileURL(candidate).href;
	}

	return null;
}

registerHooks({
	load(url, context, nextLoad) {
		if (url.startsWith('data:text/javascript,')) {
			return nextLoad(url, context);
		}
		if (url.startsWith('file:') && ['.ts', '.tsx'].includes(extname(url))) {
			const source = readFileSync(fileURLToPath(url), 'utf8');
			return {
				format: 'module',
				shortCircuit: true,
				source: stripTypeScriptTypes(source, {
					mode: 'transform',
					sourceMap: true,
				}),
			};
		}
		return nextLoad(url, context);
	},
	resolve(specifier, context, nextResolve) {
		if (specifier === 'client-only') {
			return {
				shortCircuit: true,
				url: 'data:text/javascript,export%20{}',
			};
		}
		if (
			specifier.startsWith('@/') ||
			(specifier.startsWith('.') &&
				context.parentURL?.startsWith('file:'))
		) {
			const resolved = resolveProjectModule(specifier, context.parentURL);
			if (resolved) return { shortCircuit: true, url: resolved };
		}
		return nextResolve(specifier, context);
	},
});

const { readResourcePackArchive } = await import(
	pathToFileURL(
		resolve(
			repositoryRoot,
			'app/features/resourceEditor/client/archive/readResourcePackArchive.ts'
		)
	).href
);
const { writeResourcePackArchive } = await import(
	pathToFileURL(
		resolve(
			repositoryRoot,
			'app/features/resourceEditor/client/archive/writeResourcePackArchive.ts'
		)
	).href
);
const { collectResourcePackAssetReferences } = await import(
	pathToFileURL(
		resolve(repositoryRoot, 'app/domain/resourcePack/assetReferences.ts')
	).href
);
const { normalizeResourcePack } = await import(
	pathToFileURL(
		resolve(repositoryRoot, 'app/domain/resourcePack/normalization.ts')
	).href
);
const { createResourcePackExportView, serializeResourcePack } = await import(
	pathToFileURL(
		resolve(repositoryRoot, 'app/domain/resourcePack/serialization.ts')
	).href
);
const { validateResourcePackRules } = await import(
	pathToFileURL(
		resolve(repositoryRoot, 'app/domain/resourcePack/validation.ts')
	).href
);

const fixtureNames = [
	'minimal',
	'legacy-pack-info-precedence',
	'legacy-top-level-pack-info',
	'archive-license-missing',
	'archive-license-empty',
	'archive-license-nonempty',
	'dialog-actions',
];

function sha256(bytes) {
	return createHash('sha256').update(bytes).digest('hex');
}

async function inspectZip(zipBytes) {
	const zip = await JSZip.loadAsync(zipBytes);
	const entries = [];

	for (const entry of Object.values(zip.files)) {
		if (entry.dir) {
			entries.push({ dir: true, name: entry.name });
			continue;
		}
		const bytes = await entry.async('nodebuffer');
		entries.push({
			bytes: bytes.byteLength,
			dir: false,
			name: entry.name,
			sha256: sha256(bytes),
		});
	}

	return entries;
}

for (const fixtureName of fixtureNames) {
	const fixtureRoot = resolve(
		repositoryRoot,
		'fixtures/resource-pack/baseline',
		fixtureName
	);
	const inputBytes = await readFile(
		resolve(
			repositoryRoot,
			'fixtures/resource-pack/inputs',
			`${fixtureName}.zip`
		)
	);
	const expectedNormalized = await readFile(
		resolve(fixtureRoot, 'normalized.json'),
		'utf8'
	);
	const expectedExport = await readFile(
		resolve(fixtureRoot, 'exported-ResourceEx.json'),
		'utf8'
	);
	const manifest = JSON.parse(
		await readFile(resolve(fixtureRoot, 'manifest.json'), 'utf8')
	);

	const archive = await readResourcePackArchive(new Uint8Array(inputBytes));
	assert.equal(
		`${JSON.stringify(archive.resourcePack, null, 2)}\n`,
		expectedNormalized,
		`${fixtureName}: normalized ResourceEx must match Task 1`
	);
	assert.equal(
		sha256(Buffer.from(archive.license)),
		manifest.input.license?.sha256 ?? sha256(Buffer.from('')),
		`${fixtureName}: LICENSE.md bytes are the only license source`
	);
	assert.ok(
		archive.folders.includes('assets/'),
		`${fixtureName}: assets/ root must always exist`
	);
	assert.equal(
		archive.files.has('LICENSE.md'),
		false,
		`${fixtureName}: LICENSE.md must not enter the file snapshot`
	);
	assert.equal(
		archive.files.has('ResourceEx.json'),
		false,
		`${fixtureName}: ResourceEx.json must not enter the file snapshot`
	);

	const stateBeforeSerialization = JSON.stringify(archive.resourcePack);
	const resourcePackJson = serializeResourcePack(archive.resourcePack);
	assert.equal(
		resourcePackJson,
		expectedExport,
		`${fixtureName}: serialized ResourceEx must match Task 1`
	);
	assert.equal(
		JSON.stringify(archive.resourcePack),
		stateBeforeSerialization,
		`${fixtureName}: serialization must not mutate editor state`
	);

	const outputBlob = await writeResourcePackArchive({
		files: archive.files,
		folders: archive.folders,
		license: archive.license,
		referencedPaths: collectResourcePackAssetReferences(
			archive.resourcePack
		),
		resourcePackJson,
	});
	const outputBytes = new Uint8Array(await outputBlob.arrayBuffer());
	assert.deepEqual(
		await inspectZip(outputBytes),
		manifest.exported.entries,
		`${fixtureName}: exported archive entries and bytes must match Task 1`
	);
}

const invalidInput = await readFile(
	resolve(
		repositoryRoot,
		'fixtures/resource-pack/inputs/invalid-characters-shape.zip'
	)
);
await assert.rejects(
	() => readResourcePackArchive(new Uint8Array(invalidInput)),
	(error) =>
		error instanceof Error &&
		error.message.includes('characters') &&
		error.message.includes('array'),
	'invalid collection errors must identify the characters path and expected array shape'
);

function createWire(overrides = {}) {
	return {
		packInfo: { label: 'ValidPack' },
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
		...overrides,
	};
}

const reviewFailures = [];

function runReviewCheck(name, check) {
	try {
		check();
	} catch (error) {
		reviewFailures.push(new Error(name, { cause: error }));
	}
}

function assertWireRejects(input, path, expected) {
	runReviewCheck(path, () => {
		assert.throws(
			() => normalizeResourcePack(input),
			(error) =>
				error instanceof Error &&
				error.message.includes(path) &&
				error.message.includes(expected),
			`${path} must report ${expected}`
		);
	});
}

for (const reservedLabel of ['CORE', 'DLC1']) {
	runReviewCheck(`reserved label ${reservedLabel}`, () => {
		const issues = validateResourcePackRules(
			normalizeResourcePack(
				createWire({ packInfo: { label: reservedLabel } })
			)
		);
		assert.ok(
			issues.some(
				(issue) =>
					issue.severity === 'error' &&
					issue.message.includes('保留关键字') &&
					issue.message.includes(reservedLabel)
			),
			`${reservedLabel} must be a domain validation error`
		);
	});
}

runReviewCheck('normal and invalid labels', () => {
	const normalIssues = validateResourcePackRules(
		normalizeResourcePack(
			createWire({ packInfo: { label: 'Normal_Pack' } })
		)
	);
	assert.equal(
		normalIssues.some((issue) => issue.message.includes('保留关键字')),
		false
	);
	const invalidIssues = validateResourcePackRules(
		normalizeResourcePack(createWire({ packInfo: { label: 'Bad/Pack' } }))
	);
	assert.ok(
		invalidIssues.some(
			(issue) =>
				issue.severity === 'error' &&
				issue.message.includes('含非法字符')
		)
	);
});

const whitespaceReferencePack = normalizeResourcePack(
	createWire({
		ingredients: [
			{
				id: 9000,
				name: 'Ingredient',
				description: '',
				level: 1,
				prefix: -1,
				isFish: false,
				isMeat: false,
				isVeg: true,
				baseValue: 1,
				tags: [],
				spritePath: ' external/referenced.png ',
			},
		],
	})
);
const whitespaceExportView = createResourcePackExportView(
	whitespaceReferencePack
);

runReviewCheck('trimmed non-assets reference', () => {
	const { referencedPaths, resourcePackJson } = whitespaceExportView;
	const serialized = JSON.parse(resourcePackJson);
	assert.ok(
		referencedPaths.has(serialized.ingredients[0].spritePath),
		'referenced paths must come from the same trimmed export view as JSON'
	);
});

const whitespaceArchive = await writeResourcePackArchive({
	files: new Map([
		['external/referenced.png', new Blob(['trimmed-reference-bytes'])],
	]),
	folders: [],
	license: '',
	referencedPaths: whitespaceExportView.referencedPaths,
	resourcePackJson: whitespaceExportView.resourcePackJson,
});
const whitespaceZip = await JSZip.loadAsync(
	new Uint8Array(await whitespaceArchive.arrayBuffer())
);
assert.equal(
	await whitespaceZip.files['external/referenced.png'].async('string'),
	'trimmed-reference-bytes',
	'a trimmed non-assets path referenced by exported JSON must be written to ZIP'
);
assert.equal(
	whitespaceZip.files[' external/referenced.png '],
	undefined,
	'the untrimmed non-assets path must not be written to ZIP'
);

assertWireRejects(
	createWire({ packInfo: { authors: 'not-an-array' } }),
	'packInfo.authors',
	'an array'
);
assertWireRejects(
	createWire({ dialogPackages: [{ name: '_ValidPack_Dialog' }] }),
	'dialogPackages[0].dialogList',
	'an array'
);
assertWireRejects(
	createWire({
		dialogPackages: [
			{ name: '_ValidPack_Dialog', dialogList: 'not-an-array' },
		],
	}),
	'dialogPackages[0].dialogList',
	'an array'
);
assertWireRejects(
	createWire({
		ingredients: [
			{
				id: 9000,
				name: 'Ingredient',
				description: '',
				level: 1,
				prefix: -1,
				isFish: false,
				isMeat: false,
				isVeg: true,
				baseValue: 1,
				tags: 'not-an-array',
				spritePath: '',
			},
		],
	}),
	'ingredients[0].tags',
	'an array'
);
assertWireRejects(
	createWire({
		characters: [
			{
				id: 9001,
				name: 'Character',
				label: '_ValidPack_Character',
				type: 'Special',
				guest: null,
			},
		],
	}),
	'characters[0].guest',
	'an object'
);
assertWireRejects(
	createWire({ packInfo: { description: null } }),
	'packInfo.description',
	'a string'
);
assertWireRejects(
	createWire({
		dialogPackages: [
			{
				name: '_ValidPack_Dialog',
				dialogList: [
					{
						characterId: 0,
						characterType: 'Special',
						pid: 0,
						position: 'Left',
						text: '',
						actions: [{ actionType: 'Invalid' }],
					},
				],
			},
		],
	}),
	'dialogPackages[0].dialogList[0].actions[0].actionType',
	'a supported dialog action type'
);
assertWireRejects(
	createWire({
		dialogPackages: [
			{
				name: '_ValidPack_Dialog',
				dialogList: [
					{
						characterId: 0,
						characterType: 'Special',
						pid: 0,
						position: 'Left',
						text: '',
						actions: [{ actionType: 'Sound', sound: null }],
					},
				],
			},
		],
	}),
	'dialogPackages[0].dialogList[0].actions[0].sound',
	'a string'
);
assertWireRejects(
	createWire({
		characters: [
			{
				id: 9001,
				name: 'Character',
				label: '_ValidPack_Character',
				type: 'Special',
				guest: {
					fundRangeLower: 1,
					fundRangeUpper: 2,
					evaluation: [],
					conversation: [],
					foodRequests: [{ tagId: 1, request: '', enable: null }],
					bevRequests: [],
					hateFoodTag: [],
					likeFoodTag: [],
					likeBevTag: [],
				},
			},
		],
	}),
	'characters[0].guest.foodRequests[0].enable',
	'a boolean'
);
assertWireRejects(
	createWire({
		missionNodes: [
			{
				debugLabel: '',
				missionType: 'Kitsuna',
				finishConditions: [{ conditionType: 'Invalid' }],
			},
		],
	}),
	'missionNodes[0].finishConditions[0].conditionType',
	'a supported mission condition type'
);
assertWireRejects(
	createWire({
		eventNodes: [
			{
				label: '_ValidPack_Event',
				debugLabel: '',
				eventData: { eventType: 'Invalid' },
			},
		],
	}),
	'eventNodes[0].eventData.eventType',
	'a supported event type'
);
assertWireRejects(
	createWire({
		merchants: [
			{
				key: '_ValidPack_Merchant',
				welcomeDialogPackageNames: [],
				nullDialogPackageNames: [],
				priceMultiplierMin: 1,
				priceMultiplierMax: 1,
				leastSellNum: 1,
				merchandise: [
					{
						item: {
							productType: 'Invalid',
							productId: 1,
							productAmount: 1,
							productLabel: '',
						},
						itemAmountMin: 1,
						itemAmountMax: 1,
						sellProbability: 1,
					},
				],
			},
		],
	}),
	'merchants[0].merchandise[0].item.productType',
	'a supported product type'
);

runReviewCheck('legacy guest collection defaults', () => {
	const normalized = normalizeResourcePack(
		createWire({
			characters: [
				{
					id: 9001,
					name: 'Character',
					label: '_ValidPack_Character',
					type: 'Special',
					guest: {
						fundRangeLower: 1,
						fundRangeUpper: 2,
						conversation: [],
					},
				},
			],
		})
	);
	assert.deepEqual(normalized.characters[0].guest, {
		fundRangeLower: 1,
		fundRangeUpper: 2,
		conversation: [],
		evaluation: ['', '', '', '', '', '', '', '', ''],
		foodRequests: [],
		bevRequests: [],
		hateFoodTag: [],
		likeFoodTag: [],
		likeBevTag: [],
		spawn: [],
	});
});

for (const [field, invalidValue] of [
	['evaluation', 'not-an-array'],
	['foodRequests', {}],
	['bevRequests', {}],
	['hateFoodTag', {}],
	['likeFoodTag', {}],
	['likeBevTag', {}],
	['spawn', {}],
]) {
	assertWireRejects(
		createWire({
			characters: [
				{
					id: 9001,
					name: 'Character',
					label: '_ValidPack_Character',
					type: 'Special',
					guest: {
						fundRangeLower: 1,
						fundRangeUpper: 2,
						conversation: [],
						[field]: invalidValue,
					},
				},
			],
		}),
		`characters[0].guest.${field}`,
		'an array'
	);
}

runReviewCheck('legacy food and beverage tag defaults', () => {
	const normalized = normalizeResourcePack(
		createWire({
			foods: [
				{
					id: 9000,
					name: 'Food',
					description: '',
					level: 1,
					baseValue: 1,
					spritePath: '',
				},
			],
			beverages: [
				{
					id: 9001,
					name: 'Beverage',
					description: '',
					level: 1,
					baseValue: 1,
					spritePath: '',
				},
			],
		})
	);
	assert.deepEqual(normalized.foods[0].tags, []);
	assert.deepEqual(normalized.foods[0].banTags, []);
	assert.deepEqual(normalized.beverages[0].tags, []);
});

for (const [collection, field] of [
	['foods', 'tags'],
	['foods', 'banTags'],
	['beverages', 'tags'],
]) {
	const item = {
		id: 9000,
		name: 'Item',
		description: '',
		level: 1,
		baseValue: 1,
		spritePath: '',
		[field]: 'not-an-array',
	};
	assertWireRejects(
		createWire({ [collection]: [item] }),
		`${collection}[0].${field}`,
		'an array'
	);
}

for (const ignoredLicense of [null, 42, { kind: 'legacy' }, ['legacy']]) {
	runReviewCheck(
		`ignored packInfo.license ${JSON.stringify(ignoredLicense)}`,
		() => {
			const normalized = normalizeResourcePack(
				createWire({
					packInfo: { label: 'ValidPack', license: ignoredLicense },
				})
			);
			assert.equal('license' in normalized.packInfo, false);
		}
	);
}

const legalOptionalWire = normalizeResourcePack(
	createWire({
		packInfo: { label: 'ValidPack', futureField: { enabled: true } },
		characters: [
			{
				id: 9001,
				name: 'Character',
				label: '_ValidPack_Character',
				type: 'Special',
				guest: undefined,
				futureField: 'preserved',
			},
		],
		eventNodes: [
			{
				label: '_ValidPack_Event',
				debugLabel: '',
				futureField: { enabled: true },
			},
		],
		foods: null,
	})
);
assert.equal(legalOptionalWire.foods.length, 0);
assert.equal(legalOptionalWire.characters[0].guest, undefined);
assert.equal('guest' in legalOptionalWire.characters[0], true);
assert.equal(legalOptionalWire.characters[0].futureField, 'preserved');
assert.deepEqual(legalOptionalWire.packInfo.futureField, { enabled: true });
assert.deepEqual(legalOptionalWire.eventNodes[0].futureField, {
	enabled: true,
});

if (reviewFailures.length > 0) {
	throw new AggregateError(
		reviewFailures,
		`Task 5 review RED: ${reviewFailures.length} checks failed`
	);
}

console.log(
	`Task 5 domain/archive harness: ${fixtureNames.length} fixtures and expanded wire paths passed`
);
