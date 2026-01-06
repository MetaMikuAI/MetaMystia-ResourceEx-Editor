import { type ChangeEvent, memo } from 'react';
import Link from 'next/link';

import { cn } from '@/lib';

interface HeaderProps {
	onCreateBlank: () => void;
	onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
	onDownload: () => void;
	currentPage?: 'character' | 'dialogue';
}

export const Header = memo<HeaderProps>(function Header({
	onCreateBlank,
	onFileUpload,
	onDownload,
	currentPage = 'character',
}) {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-gray-300/95 bg-white/5 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
				<div className="flex select-none items-center gap-6">
					<div className="flex items-center gap-1">
						<span className="image-rendering-pixelated h-10 w-10 shrink-0 rounded-full bg-[url(/assets/icon.png)] bg-cover bg-no-repeat" />
						<p className="flex items-baseline gap-1">
							<span className="text-lg font-bold">
								ResourceEx Editor
							</span>
							<span className="font-mono text-xs uppercase opacity-40">
								MetaMystia
							</span>
						</p>
					</div>
					<nav className="flex items-center gap-2">
						<Link
							href="/character"
							className={cn(
								'btn-mystia hover:bg-black/10 hover:text-foreground',
								currentPage === 'character'
									? 'bg-black/5 text-foreground'
									: 'text-foreground/60'
							)}
						>
							角色编辑
						</Link>
						<Link
							href="/dialogue"
							className={cn(
								'btn-mystia hover:bg-black/10 hover:text-foreground',
								currentPage === 'dialogue'
									? 'bg-black/5 text-foreground'
									: 'text-foreground/60'
							)}
						>
							对话编辑
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={onCreateBlank}
						className="btn-mystia text-sm hover:underline hover:underline-offset-2"
					>
						从空白创建
					</button>
					<label className="btn-mystia text-sm hover:underline hover:underline-offset-2">
						上传 JSON
						<input
							type="file"
							accept=".json"
							onChange={onFileUpload}
							className="hidden"
						/>
					</label>
					<button
						onClick={onDownload}
						className="btn-mystia text-sm hover:underline hover:underline-offset-2"
					>
						导出 JSON
					</button>
				</div>
			</div>
		</header>
	);
});
