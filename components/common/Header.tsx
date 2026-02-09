import { type ChangeEvent, memo, useCallback, useState } from 'react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

import { cn } from '@/lib';
import { useData } from '@/components/context/DataContext';

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
	const { createBlank, loadResourcePack, saveResourcePack } = useData();

	const handleFileUpload = useCallback(
		(e: ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (file) {
				loadResourcePack(file);
			}
		},
		[loadResourcePack]
	);

	const isItemsActive = [
		'/ingredient',
		'/food',
		'/recipe',
		'/beverage',
	].includes(pathname);
	const isNodesActive = ['/mission', '/event'].includes(pathname);
	const isMerchantActive = pathname === '/merchant';

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
						<Link
							href="/character"
							className={cn(
								'btn-mystia',
								pathname === '/character'
									? 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							角色编辑
						</Link>
						<Link
							href="/dialogue"
							className={cn(
								'btn-mystia',
								pathname === '/dialogue'
									? 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							对话编辑
						</Link>

						<NavDropdown
							label="物品编辑"
							active={isItemsActive}
							items={[
								{ href: '/ingredient', label: '原料编辑' },
								{ href: '/food', label: '料理编辑' },
								{ href: '/recipe', label: '菜谱编辑' },
								{ href: '/beverage', label: '酒水编辑' },
							]}
						/>

						<NavDropdown
							label="计划节点编辑"
							active={isNodesActive}
							items={[
								{ href: '/mission', label: '任务节点编辑' },
								{ href: '/event', label: '事件节点编辑' },
							]}
						/>

						<Link
							href="/merchant"
							className={cn(
								'btn-mystia',
								isMerchantActive
									? 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							商人编辑
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-1 text-center">
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
						onClick={() => saveResourcePack()}
						className="btn-mystia text-sm hover:underline hover:underline-offset-2"
					>
						导出资源包(ZIP)
					</button>
				</div>
			</div>
		</header>
	);
});
