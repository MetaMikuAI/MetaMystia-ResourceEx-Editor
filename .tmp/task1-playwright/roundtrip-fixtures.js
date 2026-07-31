async (page) => {
	const root = 'fixtures/resource-pack/inputs';
	const outputRoot = '.tmp/task1-playwright';
	const fixtureNames = [
		'minimal',
		'legacy-pack-info-precedence',
		'legacy-top-level-pack-info',
		'archive-license-missing',
		'archive-license-empty',
		'archive-license-nonempty',
		'dialog-actions',
	];

	await page.evaluate(() => {
		const trackedWindow = window;
		if (!trackedWindow.__task1UrlEvents) {
			const originalCreateObjectUrl = URL.createObjectURL.bind(URL);
			const originalRevokeObjectUrl = URL.revokeObjectURL.bind(URL);
			trackedWindow.__task1UrlEvents = [];
			URL.createObjectURL = (value) => {
				const url = originalCreateObjectUrl(value);
				trackedWindow.__task1UrlEvents.push({ kind: 'create', url });
				return url;
			};
			URL.revokeObjectURL = (url) => {
				trackedWindow.__task1UrlEvents.push({ kind: 'revoke', url });
				originalRevokeObjectUrl(url);
			};
		}
	});

	const results = [];
	for (const fixtureName of fixtureNames) {
		const beforeUrlEvents = await page.evaluate(
			() => window.__task1UrlEvents.length
		);
		const fileChooserPromise = page.waitForEvent('filechooser');
		await page
			.getByRole('button', { name: '上传资源包(ZIP)' })
			.click();
		const fileChooser = await fileChooserPromise;
		await fileChooser.setFiles(`${root}/${fixtureName}.zip`);
		await page.waitForTimeout(200);

		const label = await page
			.getByPlaceholder('例如: ResourceEx')
			.inputValue();
		const license = await page
			.getByPlaceholder('在此处粘贴许可证文本，将单独保存为 LICENSE.md...')
			.inputValue();
		const importIsDirty = await page.evaluate(() => {
			const event = new Event('beforeunload', { cancelable: true });
			window.dispatchEvent(event);
			return event.defaultPrevented;
		});

		const downloadPromise = page.waitForEvent('download');
		await page
			.getByRole('button', { name: '导出资源包(ZIP)' })
			.click();
		await page.waitForTimeout(200);
		const continueButton = page.getByRole('button', {
			name: /忽略问题，仍然导出|确认导出/,
		});
		if (await continueButton.isVisible()) {
			await continueButton.click();
		}
		const download = await downloadPromise;
		await download.saveAs(`${outputRoot}/${fixtureName}-export.zip`);

		const exportIsDirty = await page.evaluate(() => {
			const event = new Event('beforeunload', { cancelable: true });
			window.dispatchEvent(event);
			return event.defaultPrevented;
		});
		const urlEvents = await page.evaluate(
			(start) => window.__task1UrlEvents.slice(start),
			beforeUrlEvents
		);
		results.push({
			exportIsDirty,
			fixtureName,
			importIsDirty,
			label,
			license,
			suggestedFilename: download.suggestedFilename(),
			urlCreates: urlEvents.filter((event) => event.kind === 'create')
				.length,
			urlRevokes: urlEvents.filter((event) => event.kind === 'revoke')
				.length,
		});
	}

	return results;
}
