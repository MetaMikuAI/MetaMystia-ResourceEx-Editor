import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import JSZip from 'jszip';

const REPO_ROOT = process.cwd();
const INPUT_ROOT = resolve(REPO_ROOT, 'fixtures/resource-pack/inputs');
const BASELINE_ROOT = resolve(REPO_ROOT, 'fixtures/resource-pack/baseline');
const TEMP_ROOT = resolve(REPO_ROOT, '.tmp/task1-playwright');
const FIXTURE_NAMES = [
	'minimal',
	'legacy-pack-info-precedence',
	'legacy-top-level-pack-info',
	'archive-license-missing',
	'archive-license-empty',
	'archive-license-nonempty',
	'dialog-actions',
];

const sha256 = (value) =>
	createHash('sha256').update(value).digest('hex');

const inspectZip = async (bytes) => {
	const zip = await JSZip.loadAsync(bytes);
	const entries = [];
	for (const entry of Object.values(zip.files)) {
		if (entry.dir) {
			entries.push({ dir: true, name: entry.name });
			continue;
		}
		const content = Buffer.from(await entry.async('uint8array'));
		entries.push({
			bytes: content.length,
			dir: false,
			name: entry.name,
			sha256: sha256(content),
		});
	}
	return { entries, zip };
};

await mkdir(BASELINE_ROOT, { recursive: true });

const summary = [];
for (const fixtureName of FIXTURE_NAMES) {
	const inputBytes = await readFile(resolve(INPUT_ROOT, `${fixtureName}.zip`));
	const exportBytes = await readFile(
		resolve(TEMP_ROOT, `${fixtureName}-export.zip`)
	);
	const normalizedBytes = await readFile(
		resolve(TEMP_ROOT, `${fixtureName}-normalized.json`)
	);
	const input = await inspectZip(inputBytes);
	const exported = await inspectZip(exportBytes);
	const exportedJsonBytes = Buffer.from(
		await exported.zip.file('ResourceEx.json').async('uint8array')
	);
	const inputLicense = input.zip.file('LICENSE.md');
	const exportedLicense = exported.zip.file('LICENSE.md');
	const inputLicenseBytes = inputLicense
		? Buffer.from(await inputLicense.async('uint8array'))
		: null;
	const exportedLicenseBytes = exportedLicense
		? Buffer.from(await exportedLicense.async('uint8array'))
		: null;

	const fixtureBaselineRoot = resolve(BASELINE_ROOT, fixtureName);
	await mkdir(fixtureBaselineRoot, { recursive: true });
	await writeFile(
		resolve(fixtureBaselineRoot, 'normalized.json'),
		normalizedBytes
	);
	await writeFile(
		resolve(fixtureBaselineRoot, 'exported-ResourceEx.json'),
		exportedJsonBytes
	);
	if (exportedLicenseBytes) {
		await writeFile(
			resolve(fixtureBaselineRoot, 'exported-LICENSE.md'),
			exportedLicenseBytes
		);
	}

	const manifest = {
		fixture: fixtureName,
		input: {
			bytes: inputBytes.length,
			entries: input.entries,
			license: inputLicenseBytes
				? {
						bytes: inputLicenseBytes.length,
						sha256: sha256(inputLicenseBytes),
					}
				: null,
			sha256: sha256(inputBytes),
		},
		normalized: {
			bytes: normalizedBytes.length,
			sha256: sha256(normalizedBytes),
		},
		exported: {
			entries: exported.entries,
			json: {
				bytes: exportedJsonBytes.length,
				sha256: sha256(exportedJsonBytes),
			},
			license: exportedLicenseBytes
				? {
						bytes: exportedLicenseBytes.length,
						sha256: sha256(exportedLicenseBytes),
					}
				: null,
		},
	};
	await writeFile(
		resolve(fixtureBaselineRoot, 'manifest.json'),
		`${JSON.stringify(manifest, null, 2)}\n`
	);
	summary.push({
		exportEntryCount: exported.entries.length,
		exportJsonSha256: manifest.exported.json.sha256,
		fixture: fixtureName,
		inputEntryCount: input.entries.length,
		normalizedSha256: manifest.normalized.sha256,
	});
}

await writeFile(
	resolve(BASELINE_ROOT, 'summary.json'),
	`${JSON.stringify(summary, null, 2)}\n`
);

console.log(JSON.stringify(summary, null, 2));
