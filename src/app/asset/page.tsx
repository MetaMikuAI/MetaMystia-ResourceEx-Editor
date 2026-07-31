'use client';

import { cn } from '@heroui/theme';
import { useCallback, useState } from 'react';

import { AssetFileManager } from '@/components/asset/AssetFileManager';
import { useData } from '@/components/context/DataContext';

import Button from '@/design/ui/components/button';

import type { AssetPathOperation } from '@/types/resource';

const QUICK_FOLDERS = [
	{
		label: '全部资产',
		path: 'assets/',
		description: '资源包内 assets/ 下的所有文件。',
	},
	{ label: 'CG', path: 'assets/CG/', description: '对话动作 CG 推荐目录。' },
	{ label: 'BG', path: 'assets/BG/', description: '对话动作 BG 推荐目录。' },
	{
		label: '音频',
		path: 'assets/Audio/',
		description: '对话动作 Sound 推荐目录，MOD 目前仅支持 .wav。',
	},
	{
		label: '自定义',
		path: 'assets/Custom/',
		description: '自由管理额外资源，按需要在 JSON 中引用。',
	},
] as const;

export default function AssetPage() {
	const {
		data,
		assetUrls,
		assetFolders,
		updateAsset,
		removeAsset,
		createAssetFolder,
		removeAssetFolders,
		moveAssets,
		copyAssets,
	} = useData();
	const [activeFolder, setActiveFolder] = useState<string>('assets/');
	const [isCollapsed, setIsCollapsed] = useState(false);

	const removeAssets = useCallback(
		(paths: string[]) => {
			for (const path of paths) removeAsset(path);
		},
		[removeAsset]
	);

	const handleMove = useCallback(
		(operations: AssetPathOperation[]) => {
			moveAssets(operations);
		},
		[moveAssets]
	);

	const handleCopy = useCallback(
		(operations: AssetPathOperation[]) => {
			copyAssets(operations);
		},
		[copyAssets]
	);

	return (
		<div className="flex flex-col">
			<div className="container mx-auto w-full max-w-7xl px-6 py-8 3xl:max-w-screen-2xl 4xl:max-w-screen-3xl">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
					<aside className="flex h-min flex-col gap-2 rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto">
						<div className="flex items-center justify-between">
							<h2 className="mb-2 text-xl font-semibold">
								资产目录
							</h2>
							<Button
								isIconOnly
								variant="light"
								size="sm"
								className="mb-2 h-8 w-8 lg:hidden"
								onPress={() => setIsCollapsed((v) => !v)}
								aria-label={
									isCollapsed ? '展开列表' : '折叠列表'
								}
							>
								<svg
									viewBox="0 0 24 24"
									className={cn(
										'h-4 w-4 transition-transform duration-200',
										isCollapsed ? '-rotate-90' : 'rotate-0'
									)}
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="m9 18 6-6-6-6" />
								</svg>
							</Button>
						</div>

						<div
							className={cn(
								'grid transition-all duration-300',
								isCollapsed
									? 'grid-rows-[0fr] lg:grid-rows-[1fr]'
									: 'grid-rows-[1fr]'
							)}
							style={{
								overflow: isCollapsed ? 'hidden' : undefined,
							}}
						>
							<div className="flex min-h-0 flex-col gap-2">
								{QUICK_FOLDERS.map((folder) => (
									<Button
										key={folder.path}
										onPress={() => {
											setActiveFolder(folder.path);
											setIsCollapsed(true);
										}}
										className={cn(
											'h-auto flex-col items-stretch border px-3 py-2 text-left text-foreground',
											activeFolder === folder.path
												? 'border-primary bg-primary/20 shadow-inner'
												: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
										)}
									>
										<div className="text-sm font-bold">
											{folder.label}
										</div>
										<div className="font-mono text-[10px] opacity-60">
											{folder.path}
										</div>
										<div className="mt-1 text-[11px] leading-relaxed opacity-50">
											{folder.description}
										</div>
									</Button>
								))}

								<div className="mt-4 rounded-md border border-dashed border-black/10 bg-black/5 p-3 text-[11px] leading-relaxed opacity-70 dark:border-white/10 dark:bg-white/5">
									<p>
										此页现在按资源包内真实路径管理文件。目录由文件路径自动推导，复制、移动、删除会直接修改导出的
										ZIP 内容。
									</p>
									<p className="mt-2">
										导出会保留{' '}
										<code className="rounded bg-black/10 px-1 font-mono dark:bg-white/10">
											assets/
										</code>{' '}
										下的已上传文件；对话
										CG/BG/音频等模块仍会在导出前校验引用是否存在。
									</p>
								</div>
							</div>
						</div>
					</aside>

					<section className="lg:col-span-3">
						<AssetFileManager
							key={activeFolder}
							assetUrls={assetUrls}
							assetFolders={assetFolders}
							packLabel={data.packInfo?.label}
							root="assets/"
							initialFolder={activeFolder}
							onUpload={updateAsset}
							onRemove={removeAssets}
							onCreateFolder={createAssetFolder}
							onRemoveFolders={removeAssetFolders}
							onMove={handleMove}
							onCopy={handleCopy}
						/>
					</section>
				</div>
			</div>
		</div>
	);
}
