import { ChangeEvent } from 'react';
import Link from 'next/link';

interface HeaderProps {
	onCreateBlank: () => void;
	onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
	onDownload: () => void;
	currentPage?: 'character' | 'dialogue';
}

export function Header({
	onCreateBlank,
	onFileUpload,
	onDownload,
	currentPage = 'character',
}: HeaderProps) {
	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/5 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
				<div className="flex select-none items-center gap-6">
					<div className="flex items-center gap-3">
						<div className="h-8 w-8 rounded-full border border-white/10 bg-[url(/assets/icon.png)] bg-cover bg-no-repeat" />
						<div className="flex items-baseline gap-2">
							<span className="text-lg font-bold tracking-tight">
								ResourceEx Editor
							</span>
							<span className="font-mono text-[10px] uppercase tracking-widest opacity-40">
								MetaMystia
							</span>
						</div>
					</div>
					<nav className="flex items-center gap-1">
						<Link
							href="/character"
							className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
								currentPage === 'character'
									? 'bg-black/10 text-black'
									: 'text-black/60 hover:bg-black/5 hover:text-black'
							}`}
						>
							角色编辑
						</Link>
						<Link
							href="/dialogue"
							className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
								currentPage === 'dialogue'
									? 'bg-black/10 text-black'
									: 'text-black/60 hover:bg-black/5 hover:text-black'
							}`}
						>
							对话编辑
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={onCreateBlank}
						className="rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95"
					>
						从空白创建
					</button>
					<label className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95">
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
						className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium transition-all hover:bg-white/20 active:scale-95"
					>
						导出 JSON
					</button>
				</div>
			</div>
		</header>
	);
}
