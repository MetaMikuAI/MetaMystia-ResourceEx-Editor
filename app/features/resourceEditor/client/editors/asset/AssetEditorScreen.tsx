'use client';

import { cn } from '@heroui/theme';
import { useCallback, useState } from 'react';

import Button from '@/design/ui/components/button';
import ScrollShadow from '@/design/ui/components/scrollShadow';

import type { IAssetPathOperation } from '@/features/resourceEditor/client/assets/contracts';
import { ChevronRight } from '@/features/resourceEditor/client/components/icons/ChevronRight';
import { EditorPanel } from '@/features/resourceEditor/client/components/layout/EditorPanel';
import { EditorWorkspace } from '@/features/resourceEditor/client/components/layout/EditorWorkspace';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { AssetFileManager } from './AssetFileManager';

const QUICK_FOLDERS = [
	{
		label: '全部资产',
		path: 'assets/',
		description: '资源包内assets/下的所有文件。',
	},
	{ label: 'CG', path: 'assets/CG/', description: '对话动作CG推荐目录。' },
	{ label: 'BG', path: 'assets/BG/', description: '对话动作BG推荐目录。' },
	{
		label: '音频',
		path: 'assets/Audio/',
		description: '对话动作Sound推荐目录，Mod目前仅支持.wav。',
	},
	{
		label: '自定义',
		path: 'assets/Custom/',
		description: '自由管理额外资源，按需要在JSON中引用。',
	},
] as const;

export function AssetEditorScreen() {
	const {
		resourcePack: data,
		assets: { folders: assetFolders, urls: assetUrls },
		updateAsset,
		removeAsset,
		createAssetFolder,
		removeAssetFolders,
		moveAssets,
		copyAssets,
	} = useResourceEditor();
	const [activeFolder, setActiveFolder] = useState<string>('assets/');
	const [isCollapsed, setIsCollapsed] = useState(false);

	const removeAssets = useCallback(
		(paths: string[]) => {
			for (const path of paths) removeAsset(path);
		},
		[removeAsset]
	);

	const handleMove = useCallback(
		(operations: IAssetPathOperation[]) => {
			moveAssets(operations);
		},
		[moveAssets]
	);

	const handleCopy = useCallback(
		(operations: IAssetPathOperation[]) => {
			copyAssets(operations);
		},
		[copyAssets]
	);

	return (
		<EditorWorkspace columns={4}>
			<EditorPanel
				as="aside"
				className="flex h-min flex-col gap-2 lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)] lg:overflow-hidden"
			>
				<div className="flex shrink-0 items-center justify-between">
					<h2 className="mb-2 text-xl font-semibold">资产目录</h2>
					<Button
						isIconOnly
						variant="light"
						size="sm"
						className="mb-2 h-8 w-8 lg:hidden"
						onPress={() => setIsCollapsed((v) => !v)}
						aria-label={isCollapsed ? '展开列表' : '折叠列表'}
					>
						<ChevronRight
							className={cn(
								'h-4 w-4 transition-transform duration-200',
								isCollapsed ? '-rotate-90' : 'rotate-0'
							)}
						/>
					</Button>
				</div>

				<ScrollShadow
					aria-label="资产目录"
					className="min-h-0 lg:flex-1"
				>
					<div
						className={cn(
							'grid overflow-hidden transition-all duration-300',
							isCollapsed
								? 'grid-rows-[0fr] lg:grid-rows-[1fr]'
								: 'grid-rows-[1fr]'
						)}
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
										'h-auto min-h-16 shrink-0 flex-col items-stretch whitespace-normal border px-3 py-2 text-left text-foreground',
										activeFolder === folder.path
											? 'border-primary bg-primary/15'
											: 'border-divider bg-content2/30 hover:border-primary/40 hover:bg-default/40'
									)}
								>
									<div className="text-sm font-bold">
										{folder.label}
									</div>
									<div className="break-all font-mono text-xs text-foreground-600">
										{folder.path}
									</div>
									<div className="mt-1 break-words text-xs leading-relaxed text-foreground-500">
										{folder.description}
									</div>
								</Button>
							))}

							<div className="mt-4 shrink-0 rounded-large border border-dashed border-divider bg-content2/20 p-3 text-xs leading-relaxed text-foreground-600">
								<p>
									此页现在按资源包内真实路径管理文件。目录由文件路径自动推导，复制、移动、删除会直接修改导出的ZIP内容。
								</p>
								<p className="mt-2">
									导出会保留
									<code className="rounded bg-default/40 px-1 font-mono">
										assets/
									</code>
									下的已上传文件；对话CG/BG/音频等模块仍会在导出前校验引用是否存在。
								</p>
							</div>
						</div>
					</div>
				</ScrollShadow>
			</EditorPanel>

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
		</EditorWorkspace>
	);
}
