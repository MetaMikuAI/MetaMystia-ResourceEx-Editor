import { type ChangeEvent, memo, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import Link from 'next/link';

import { cn } from '@/lib';
import { useData } from '@/components/DataContext';

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
						<Link
							href="/ingredient"
							className={cn(
								'btn-mystia',
								pathname === '/ingredient'
									? 'bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
									: 'hover:bg-black/5 dark:hover:bg-white/5'
							)}
						>
							原料编辑
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
