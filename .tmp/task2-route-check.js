async (page) => {
	const routes = [
		'/',
		'/asset',
		'/beverage',
		'/character',
		'/clothes',
		'/dialogue',
		'/event',
		'/food',
		'/info',
		'/ingredient',
		'/merchant',
		'/mission',
		'/recipe',
	];
	const results = [];

	for (const route of routes) {
		const consoleErrors = [];
		const failedRequests = [];
		const handleConsole = (message) => {
			if (message.type() === 'error') {
				consoleErrors.push(message.text());
			}
		};
		const handleRequestFailed = (request) => {
			failedRequests.push({
				error: request.failure()?.errorText ?? 'unknown',
				url: request.url(),
			});
		};

		page.on('console', handleConsole);
		page.on('requestfailed', handleRequestFailed);
		const response = await page.goto(`http://127.0.0.1:3101${route}`, {
			waitUntil: 'networkidle',
		});
		await page.waitForTimeout(200);
		results.push({
			consoleErrors,
			failedRequests,
			finalPath: await page.evaluate(() => location.pathname),
			headings: await page.locator('h1, h2').allTextContents(),
			requestedPath: route,
			status: response?.status() ?? null,
			title: await page.title(),
		});
		page.off('console', handleConsole);
		page.off('requestfailed', handleRequestFailed);
	}

	return results;
}
