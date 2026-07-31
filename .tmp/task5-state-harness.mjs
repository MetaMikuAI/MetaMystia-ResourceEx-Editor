import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { registerHooks, stripTypeScriptTypes } from 'node:module';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function resolveProjectModule(specifier, parentURL) {
	const candidateBase = specifier.startsWith('@/')
		? resolve(repositoryRoot, 'app', specifier.slice(2))
		: resolve(dirname(fileURLToPath(parentURL)), specifier);
	for (const candidate of [`${candidateBase}.ts`, `${candidateBase}.tsx`]) {
		if (existsSync(candidate)) return pathToFileURL(candidate).href;
	}
	return existsSync(candidateBase) ? pathToFileURL(candidateBase).href : null;
}

registerHooks({
	load(url, context, nextLoad) {
		if (url.startsWith('data:text/javascript,'))
			return nextLoad(url, context);
		if (url.startsWith('file:') && ['.ts', '.tsx'].includes(extname(url))) {
			return {
				format: 'module',
				shortCircuit: true,
				source: stripTypeScriptTypes(
					readFileSync(fileURLToPath(url), 'utf8'),
					{ mode: 'transform' }
				),
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
		if (specifier.startsWith('@/') || specifier.startsWith('.')) {
			const resolved = resolveProjectModule(specifier, context.parentURL);
			if (resolved) return { shortCircuit: true, url: resolved };
		}
		return nextResolve(specifier, context);
	},
});

const { createBlankResourcePack } = await import(
	pathToFileURL(
		resolve(
			repositoryRoot,
			'app/domain/resourcePack/createBlankResourcePack.ts'
		)
	).href
);
const { runResourcePackExport } = await import(
	pathToFileURL(
		resolve(
			repositoryRoot,
			'app/features/resourceEditor/client/state/runResourcePackExport.ts'
		)
	).href
);

function createPack(label = 'NormalPack') {
	return {
		...createBlankResourcePack(),
		packInfo: { label, name: `${label} name`, version: '1.0.0' },
	};
}

function createDeferred() {
	let resolvePromise;
	const promise = new Promise((resolveValue) => {
		resolvePromise = resolveValue;
	});
	return { promise, resolve: resolvePromise };
}

let revision = 1;
let currentResourcePack = createPack('BeforePending');
let currentLicense = 'old license';
let currentFiles = new Map([
	['assets/old.png', new Blob(['old asset'], { type: 'image/png' })],
]);
let currentFolders = ['assets/', 'assets/old/'];
let clearedDirtyCount = 0;
let downloadedPack = null;
let writerInput = null;
let writerCallCount = 0;
const writerDeferred = createDeferred();

const pendingExport = runResourcePackExport({
	expectedRevision: 1,
	readCurrentRevision: () => revision,
	readSnapshot: (expectedRevision) =>
		revision === expectedRevision
			? {
					files: new Map(currentFiles),
					folders: [...currentFolders],
					license: currentLicense,
					resourcePack: currentResourcePack,
					revision,
				}
			: null,
	writeArchive: (input) => {
		writerCallCount += 1;
		writerInput = input;
		return writerDeferred.promise;
	},
	downloadArchive: (_archive, resourcePack) => {
		downloadedPack = resourcePack;
		return 'pending.zip';
	},
	clearDirtyIfRevision: (expectedRevision) => {
		if (revision !== expectedRevision) return false;
		clearedDirtyCount += 1;
		return true;
	},
});

revision = 2;
currentResourcePack = createPack('AfterPending');
currentLicense = 'new license';
currentFiles = new Map([
	['assets/new.png', new Blob(['new asset'], { type: 'image/png' })],
]);
currentFolders = ['assets/', 'assets/new/'];
writerDeferred.resolve(new Blob(['archive']));
const pendingResult = await pendingExport;

assert.equal(pendingResult.isSuccess, true);
assert.equal(clearedDirtyCount, 0, 'pending mutation must remain dirty');
assert.equal(writerInput.license, 'old license');
assert.deepEqual(Array.from(writerInput.files.keys()), ['assets/old.png']);
assert.deepEqual(writerInput.folders, ['assets/', 'assets/old/']);
assert.equal(downloadedPack.packInfo.label, 'BeforePending');

const staleResult = await runResourcePackExport({
	expectedRevision: 1,
	readCurrentRevision: () => revision,
	readSnapshot: () => null,
	writeArchive: () => {
		writerCallCount += 1;
		return Promise.resolve(new Blob());
	},
	downloadArchive: () => 'stale.zip',
	clearDirtyIfRevision: () => true,
});
assert.equal(staleResult.isSuccess, false);
assert.match(staleResult.error, /重新验证/);
assert.equal(writerCallCount, 1, 'stale revision must not call writer');

for (const [label, expectedError] of [
	['CORE', '保留关键字'],
	['DLC1', '保留关键字'],
	['Bad/Pack', '含非法字符'],
]) {
	let blockedWriterCalls = 0;
	const result = await runResourcePackExport({
		expectedRevision: 10,
		readCurrentRevision: () => 10,
		readSnapshot: () => ({
			files: new Map(),
			folders: ['assets/'],
			license: '',
			resourcePack: createPack(label),
			revision: 10,
		}),
		writeArchive: () => {
			blockedWriterCalls += 1;
			return Promise.resolve(new Blob());
		},
		downloadArchive: () => 'blocked.zip',
		clearDirtyIfRevision: () => true,
	});
	assert.equal(result.isSuccess, false);
	assert.match(result.error, new RegExp(expectedError));
	assert.equal(blockedWriterCalls, 0);
}

const normalResult = await runResourcePackExport({
	expectedRevision: 20,
	readCurrentRevision: () => 20,
	readSnapshot: () => ({
		files: new Map(),
		folders: ['assets/'],
		license: '',
		resourcePack: createPack('Normal_Pack'),
		revision: 20,
	}),
	writeArchive: () => Promise.resolve(new Blob(['normal'])),
	downloadArchive: () => 'normal.zip',
	clearDirtyIfRevision: () => true,
});
assert.deepEqual(normalResult, { filename: 'normal.zip', isSuccess: true });

const {
	copyAssetMaps,
	createObjectUrlRegistry,
	moveAssetMaps,
	removeAssetMaps,
	replaceAssetMaps,
	updateAssetMaps,
} = await import(
	pathToFileURL(
		resolve(
			repositoryRoot,
			'app/features/resourceEditor/client/assets/assetStoreTransactions.ts'
		)
	).href
);

function createFakeUrlEnvironment() {
	let createCount = 0;
	let failAt = Number.POSITIVE_INFINITY;
	const revokeCounts = new Map();
	return {
		createObjectURL: () => {
			createCount += 1;
			if (createCount === failAt)
				throw new Error(`create failed ${failAt}`);
			return `blob:task5-${createCount}`;
		},
		get createCount() {
			return createCount;
		},
		revokeObjectURL: (url) => {
			revokeCounts.set(url, (revokeCounts.get(url) ?? 0) + 1);
		},
		revokeCounts,
		setFailAt: (nextFailAt) => {
			failAt = nextFailAt;
		},
	};
}

const urlEnvironment = createFakeUrlEnvironment();
const urlRegistry = createObjectUrlRegistry(urlEnvironment);
let assetMaps = replaceAssetMaps(
	new Map([
		['assets/a.png', new Blob(['a'])],
		['assets/b.png', new Blob(['b'])],
	]),
	urlRegistry
);
assert.deepEqual(Array.from(assetMaps.urls.values()), [
	'blob:task5-1',
	'blob:task5-2',
]);

let transaction = updateAssetMaps(
	assetMaps.files,
	assetMaps.urls,
	'assets/a.png',
	new Blob(['a2']),
	urlRegistry
);
transaction.urlsToRevoke.forEach(urlRegistry.revoke);
assetMaps = transaction;
assert.equal(assetMaps.urls.get('assets/a.png'), 'blob:task5-3');
assert.equal(urlEnvironment.revokeCounts.get('blob:task5-1'), 1);

transaction = removeAssetMaps(assetMaps.files, assetMaps.urls, 'assets/b.png');
transaction.urlsToRevoke.forEach(urlRegistry.revoke);
assetMaps = transaction;
assert.equal(assetMaps.files.has('assets/b.png'), false);
assert.equal(urlEnvironment.revokeCounts.get('blob:task5-2'), 1);

transaction = copyAssetMaps(
	assetMaps.files,
	assetMaps.urls,
	[{ from: 'assets/a.png', to: 'assets/b.png' }],
	urlRegistry
);
transaction.urlsToRevoke.forEach(urlRegistry.revoke);
assetMaps = transaction;
assert.equal(assetMaps.urls.get('assets/b.png'), 'blob:task5-4');

transaction = copyAssetMaps(
	assetMaps.files,
	assetMaps.urls,
	[{ from: 'assets/a.png', to: 'assets/b.png' }],
	urlRegistry
);
transaction.urlsToRevoke.forEach(urlRegistry.revoke);
assetMaps = transaction;
assert.equal(assetMaps.urls.get('assets/b.png'), 'blob:task5-5');
assert.equal(urlEnvironment.revokeCounts.get('blob:task5-4'), 1);

transaction = moveAssetMaps(assetMaps.files, assetMaps.urls, [
	{ from: 'assets/a.png', to: 'assets/b.png' },
]);
transaction.urlsToRevoke.forEach(urlRegistry.revoke);
assetMaps = transaction;
assert.deepEqual(Array.from(assetMaps.files.keys()), ['assets/b.png']);
assert.equal(assetMaps.urls.get('assets/b.png'), 'blob:task5-3');
assert.equal(urlEnvironment.revokeCounts.get('blob:task5-5'), 1);

transaction = removeAssetMaps(assetMaps.files, assetMaps.urls, 'assets/b.png');
transaction.urlsToRevoke.forEach(urlRegistry.revoke);
assetMaps = transaction;
assert.equal(assetMaps.files.size, 0);
assert.equal(urlEnvironment.revokeCounts.get('blob:task5-3'), 1);

const replacementFailureEnvironment = createFakeUrlEnvironment();
replacementFailureEnvironment.setFailAt(2);
const replacementFailureRegistry = createObjectUrlRegistry(
	replacementFailureEnvironment
);
const previousFiles = new Map([['assets/previous.png', new Blob(['old'])]]);
await assert.rejects(
	async () =>
		replaceAssetMaps(
			new Map([
				['assets/first.png', new Blob(['first'])],
				['assets/second.png', new Blob(['second'])],
			]),
			replacementFailureRegistry
		),
	/create failed 2/
);
assert.deepEqual(Array.from(previousFiles.keys()), ['assets/previous.png']);
assert.equal(replacementFailureEnvironment.revokeCounts.get('blob:task5-1'), 1);

const copyFailureEnvironment = createFakeUrlEnvironment();
copyFailureEnvironment.setFailAt(2);
const copyFailureRegistry = createObjectUrlRegistry(copyFailureEnvironment);
const copySourceFiles = new Map([
	['assets/a.png', new Blob(['a'])],
	['assets/b.png', new Blob(['b'])],
]);
const copySourceUrls = new Map([
	['assets/a.png', 'blob:source-a'],
	['assets/b.png', 'blob:source-b'],
]);
assert.throws(
	() =>
		copyAssetMaps(
			copySourceFiles,
			copySourceUrls,
			[
				{ from: 'assets/a.png', to: 'assets/c.png' },
				{ from: 'assets/b.png', to: 'assets/d.png' },
			],
			copyFailureRegistry
		),
	/create failed 2/
);
assert.deepEqual(Array.from(copySourceFiles.keys()), [
	'assets/a.png',
	'assets/b.png',
]);
assert.deepEqual(Array.from(copySourceUrls.keys()), [
	'assets/a.png',
	'assets/b.png',
]);
assert.equal(copyFailureEnvironment.revokeCounts.get('blob:task5-1'), 1);

const disposableEnvironment = createFakeUrlEnvironment();
const disposableRegistry = createObjectUrlRegistry(disposableEnvironment);
const disposableUrl = disposableRegistry.create(new Blob(['dispose']));
disposableRegistry.revoke(disposableUrl);
disposableRegistry.revoke(disposableUrl);
assert.equal(disposableEnvironment.revokeCounts.get(disposableUrl), 1);
const unmountUrl = disposableRegistry.create(new Blob(['unmount']));
disposableRegistry.dispose();
disposableRegistry.dispose();
assert.equal(disposableEnvironment.revokeCounts.get(unmountUrl), 1);
const createCountAfterDispose = disposableEnvironment.createCount;
assert.throws(
	() => disposableRegistry.create(new Blob(['after-dispose'])),
	/disposed/,
	'a disposed registry must reject create before calling the environment'
);
assert.equal(disposableEnvironment.createCount, createCountAfterDispose);

console.log(
	'Task 5 state/assets harness: revision, label guards, URL transactions passed'
);
