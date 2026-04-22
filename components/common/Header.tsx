import { type ChangeEvent, memo, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

import { cn } from '@/lib';
import { useData } from '@/components/context/DataContext';
import { validateResourcePack } from './validateResourcePack';
import { ExportValidationDialog } from './ExportValidationDialog';
import type { ValidationIssue } from './validateResourcePack';

interface NavDropdownProps {
	label: string;
	active: boolean;
	items: { href: string; label: string }[];
}

const NavDropdown = memo(function NavDropdown({
	label,
	active,
	items,
}: NavDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const pathname = usePathname();

	return (
		<div
			className="relative"
			onMouseEnter={() => setIsOpen(true)}
			onMouseLeave={() => setIsOpen(false)}
		>
			<button
				className={cn(
					'btn-mystia flex items-center gap-1 transition-colors',
					active
						? 'bg-black/5 dark:bg-white/5'
						: 'hover:bg-black/5 dark:hover:bg-white/5',
					isOpen && 'bg-black/5 dark:bg-white/5'
				)}
			>
				{label}
				<svg
					className={cn(
						'h-3 w-3 transition-transform duration-200',
						isOpen && 'rotate-180'
					)}
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute left-0 top-full flex w-40 flex-col gap-1 rounded-lg border border-gray-300/95 bg-white/95 p-1 shadow-lg backdrop-blur-lg dark:border-gray-800/95 dark:bg-gray-900/95">
					{items.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								'rounded px-3 py-2 text-left text-sm transition-colors',
								pathname === item.href
									? 'bg-primary/10 text-primary'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							{item.label}
						</Link>
					))}
				</div>
			)}
		</div>
	);
});

export const Header = memo(function Header() {
	const pathname = usePathname();
	const { data, assetUrls, createBlank, loadResourcePack, saveResourcePack } =
		useData();
	const [validationIssues, setValidationIssues] = useState<
		ValidationIssue[] | null
	>(null);

	const handleFileUpload = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				loadResourcePack(file);
			}
		},
		[loadResourcePack]
	);

	const handleExport = useCallback(async () => {
		const issues = await validateResourcePack(data, Object.keys(assetUrls));
		if (issues.length > 0) {
			setValidationIssues(issues);
		} else {
			saveResourcePack();
		}
	}, [data, assetUrls, saveResourcePack]);

	const handleExportConfirm = useCallback(() => {
		setValidationIssues(null);
		saveResourcePack();
	}, [saveResourcePack]);

	const handleExportCancel = useCallback(() => {
		setValidationIssues(null);
	}, []);

	const isItemsActive = [
		'/ingredient',
		'/food',
		'/recipe',
		'/beverage',
		'/clothes',
	].includes(pathname);
	const isNodesActive = ['/mission', '/event'].includes(pathname);
	const isCharacterActive = ['/character', '/dialogue', '/merchant'].includes(
		pathname
	);

	return (
		<header className="sticky top-0 z-50 w-full border-b border-gray-300/95 bg-white/5 backdrop-blur-lg dark:border-gray-800/95">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-2 sm:px-4 md:px-6 lg:px-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="flex select-none items-center gap-6">
					<div className="hidden items-center gap-1 md:flex">
						<span className="image-rendering-pixelated h-10 w-10 shrink-0 rounded-full bg-logo bg-cover bg-no-repeat" />
						<p className="flex items-baseline gap-1">
							<span className="whitespace-nowrap text-lg font-bold">
								ResourceEx Editor
							</span>
							<span className="hidden font-mono text-xs uppercase opacity-40 lg:inline">
								MetaMystia
							</span>
						</p>
					</div>
					<nav className="flex items-center gap-2 text-center">
						<Link
							href="/info"
							className={cn(
								'btn-mystia',
								pathname === '/info'
									? 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							基础信息
						</Link>
						<NavDropdown
							label="角色"
							active={isCharacterActive}
							items={[
								{ href: '/character', label: '稀客' },
								{ href: '/dialogue', label: '对话' },
								{ href: '/merchant', label: '商人' },
							]}
						/>

						<NavDropdown
							label="素材"
							active={isItemsActive}
							items={[
								{ href: '/ingredient', label: '原料' },
								{ href: '/food', label: '料理' },
								{ href: '/recipe', label: '菜谱' },
								{ href: '/beverage', label: '酒水' },
								{ href: '/clothes', label: '服装' },
							]}
						/>

						<NavDropdown
							label="节点"
							active={isNodesActive}
							items={[
								{ href: '/mission', label: '任务节点' },
								{ href: '/event', label: '事件节点' },
							]}
						/>

						<Link
							href="/asset"
							className={cn(
								'btn-mystia',
								pathname === '/asset'
									? 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							资产
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-1 text-center">
					<a
						href="https://github.com/MetaMystia/MetaMystia-ResourceEx-Editor"
						target="_blank"
						rel="noreferrer noopener"
						aria-label="GitHub 仓库"
						title="GitHub 仓库"
						className="btn-mystia flex h-14 w-14 items-center justify-center hover:bg-black/5 dark:hover:bg-white/5"
					>
						<svg
							viewBox="0 0 24 24"
							className="h-12 w-12"
							aria-hidden="true"
							fill="currentColor"
						>
							<path d="M12 .5C5.73.5.79 5.44.79 11.71c0 4.94 3.2 9.13 7.64 10.61.56.1.77-.24.77-.54 0-.27-.01-1.16-.02-2.11-3.11.68-3.77-1.32-3.77-1.32-.51-1.29-1.25-1.64-1.25-1.64-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.63 1.22 3.27.94.1-.73.39-1.22.71-1.5-2.49-.28-5.11-1.25-5.11-5.55 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.99 0 0 .94-.3 3.09 1.15.9-.25 1.86-.37 2.82-.38.96.01 1.92.13 2.82.38 2.15-1.45 3.09-1.15 3.09-1.15.61 1.56.23 2.71.11 2.99.72.79 1.16 1.79 1.16 3.02 0 4.31-2.62 5.27-5.12 5.55.4.34.76 1.02.76 2.05 0 1.48-.01 2.67-.01 3.04 0 .3.2.65.78.54 4.43-1.49 7.62-5.67 7.62-10.61C23.21 5.44 18.27.5 12 .5z" />
						</svg>
					</a>
					<button
						onClick={createBlank}
						className="btn-mystia text-sm hover:underline hover:underline-offset-2"
					>
						全新创建
					</button>
					<label className="btn-mystia text-sm hover:underline hover:underline-offset-2">
						上传资源包(ZIP)
						<input
							type="file"
							accept=".zip"
							onChange={handleFileUpload}
							className="hidden"
						/>
					</label>
					<button
						onClick={handleExport}
						className="btn-mystia text-sm hover:underline hover:underline-offset-2"
					>
						导出资源包(ZIP)
					</button>
				</div>
			</div>

			{validationIssues && (
				<ExportValidationDialog
					issues={validationIssues}
					onConfirm={handleExportConfirm}
					onCancel={handleExportCancel}
				/>
			)}
		</header>
	);
});
