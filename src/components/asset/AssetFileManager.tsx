'use client';

import { cn } from '@heroui/theme';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { TextInput } from '@/components/common/TextInput';
import { ChevronRight } from '@/components/icons/ChevronRight';
import { PlusIcon } from '@/components/icons/Plus';
import { TrashIcon } from '@/components/icons/Trash';

import Button from '@/design/ui/components/button';
import {
	Select,
	type SelectItem as SelectItemSpec,
} from '@/design/ui/components/select';

import type { IAssetPathOperation } from '@/features/resourceEditor/client/assets/contracts';

import { safeStorage } from '@/infrastructure/browser/storage/safeStorage';

import {
	type AssetEntry,
	buildAssetPathOperations,
	collectAssetFolders,
	expandAssetSelection,
	getAssetParentFolder,
	getFolderStats,
	joinAssetPath,
	listAssetFolder,
	normalizeAssetFilename,
	normalizeAssetFolderPath,
} from './assetPaths';

interface AssetFileManagerProps {
	assetUrls: Record<string, string>;
	assetFolders?: readonly string[];
	packLabel?: string | undefined;
	root?: string;
	initialFolder?: string;
	selectionMode?: 'manage' | 'select';
	acceptedFileTypes?: string;
	onUpload: (path: string, blob: Blob) => void;
	onRemove: (paths: string[]) => void;
	onCreateFolder?: (path: string) => void;
	onRemoveFolders?: (paths: string[]) => void;
	onMove: (operations: IAssetPathOperation[]) => void;
	onCopy: (operations: IAssetPathOperation[]) => void;
	onSelectFile?: (path: string) => void;
	className?: string;
}

type ViewMode = 'grid' | 'list';
type ClipboardState = { mode: 'copy' | 'move'; paths: Set<string> };

const DEFAULT_ROOT = 'assets/';
const VIEW_MODE_STORAGE_KEY = 'assetFileManager.viewMode';

function FileIcon({ kind }: { kind: AssetEntry['kind'] }) {
	if (kind === 'folder') {
		return (
			<svg
				viewBox="0 0 24 24"
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
			</svg>
		);
	}
	if (kind === 'audio') {
		return (
			<svg
				viewBox="0 0 24 24"
				className="h-5 w-5"
				fill="none"
				stroke="currentColor"
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M9 18V5l12-2v13" />
				<circle cx="6" cy="18" r="3" />
				<circle cx="18" cy="16" r="3" />
			</svg>
		);
	}
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-5 w-5"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M4 4h16v16H4z" />
			<path d="m4 15 4-4 4 4 2-2 6 6" />
			<circle cx="9" cy="9" r="1.5" />
		</svg>
	);
}

function CopyIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="14" height="14" x="8" y="8" rx="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</svg>
	);
}

function ScissorsIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="6" cy="6" r="3" />
			<circle cx="6" cy="18" r="3" />
			<path d="M20 4 8.1 15.9" />
			<path d="m14.5 14.5 5.5 5.5" />
			<path d="M8.1 8.1 12 12" />
		</svg>
	);
}

function PasteIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M8 4h8" />
			<path d="M9 2h6v4H9z" />
			<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
		</svg>
	);
}

function UploadIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			className="h-3.5 w-3.5"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12 3v12" />
			<path d="m7 8 5-5 5 5" />
			<path d="M5 21h14" />
		</svg>
	);
}

function FilePreview({ entry }: { entry: AssetEntry }) {
	if (entry.kind === 'folder') {
		return (
			<div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
				<FileIcon kind="folder" />
			</div>
		);
	}
	if (entry.kind === 'image' && entry.url) {
		return (
			<img
				src={entry.url}
				alt={entry.name}
				className="h-full w-full object-contain"
				draggable={false}
			/>
		);
	}
	if (entry.kind === 'audio' && entry.url) {
		return (
			<div className="flex h-full w-full items-center justify-center p-2">
				<audio
					controls
					src={entry.url}
					preload="none"
					className="h-8 w-full"
					onClick={(e) => e.stopPropagation()}
				/>
			</div>
		);
	}
	return (
		<div className="flex h-full w-full items-center justify-center bg-black/5 text-foreground/40 dark:bg-white/5">
			<FileIcon kind="file" />
		</div>
	);
}

function formatFolderLabel(folder: string, root: string): string {
	if (folder === root) return root;
	return folder.slice(0, -1);
}

function getStoredViewMode(): ViewMode {
	const stored = safeStorage.getItem<ViewMode>(VIEW_MODE_STORAGE_KEY);
	return stored === 'list' || stored === 'grid' ? stored : 'grid';
}

function buildRexUri(packLabel: string | undefined, path: string): string {
	const label = packLabel?.trim() || 'packlabel';
	return `rex://${label}/${path}`;
}

export const AssetFileManager = memo<AssetFileManagerProps>(
	function AssetFileManager({
		assetUrls,
		assetFolders,
		packLabel,
		root = DEFAULT_ROOT,
		initialFolder = root,
		selectionMode = 'manage',
		acceptedFileTypes = '*/*',
		onUpload,
		onRemove,
		onCreateFolder,
		onRemoveFolders,
		onMove,
		onCopy,
		onSelectFile,
		className,
	}) {
		const normalizedRoot = useMemo(
			() => (root.endsWith('/') ? root : `${root}/`),
			[root]
		);
		const [currentFolder, setCurrentFolder] = useState(
			() =>
				normalizeAssetFolderPath(initialFolder, normalizedRoot) ??
				normalizedRoot
		);
		const [selectedPaths, setSelectedPaths] = useState<Set<string>>(
			() => new Set()
		);
		const [clipboard, setClipboard] = useState<ClipboardState | null>(null);
		const [viewMode, setViewModeState] = useState<ViewMode>('grid');
		const [copiedKey, setCopiedKey] = useState<string | null>(null);
		const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
		const [newFolderName, setNewFolderName] = useState('');
		const [isDragging, setIsDragging] = useState(false);

		const fileInputRef = useRef<HTMLInputElement>(null);
		const folderInputRef = useRef<HTMLInputElement>(null);

		const setViewMode = useCallback((mode: ViewMode) => {
			setViewModeState(mode);
			safeStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
		}, []);

		useEffect(() => {
			setViewModeState(getStoredViewMode());
		}, []);

		const assetPaths = useMemo(
			() =>
				Object.keys(assetUrls).sort((a, b) =>
					a.localeCompare(b, 'zh-CN')
				),
			[assetUrls]
		);

		const knownFolders = useMemo(() => {
			const folders = new Set([
				...collectAssetFolders(assetPaths, normalizedRoot),
				...(assetFolders ?? []),
			]);
			return Array.from(folders).sort((a, b) =>
				a.localeCompare(b, 'zh-CN')
			);
		}, [assetFolders, assetPaths, normalizedRoot]);

		const entries = useMemo(() => {
			return listAssetFolder(
				assetUrls,
				currentFolder,
				normalizedRoot,
				new Set(assetFolders ?? [])
			);
		}, [assetFolders, assetUrls, currentFolder, normalizedRoot]);

		const selectedAssetPaths = useMemo(
			() => expandAssetSelection(selectedPaths, assetPaths),
			[selectedPaths, assetPaths]
		);

		const stats = useMemo(
			() => getFolderStats(assetUrls, currentFolder, normalizedRoot),
			[assetUrls, currentFolder, normalizedRoot]
		);

		const moveTargetItems = useMemo<SelectItemSpec<string>[]>(
			() =>
				knownFolders
					.filter((folder) => folder !== currentFolder)
					.map((folder) => ({
						value: folder,
						label: formatFolderLabel(folder, normalizedRoot),
						textValue: folder,
					})),
			[currentFolder, knownFolders, normalizedRoot]
		);

		const breadcrumbs = useMemo(() => {
			const rest = currentFolder
				.slice(normalizedRoot.length)
				.replace(/\/$/, '');
			const parts = rest ? rest.split('/') : [];
			const crumbs = [
				{
					label: normalizedRoot.replace(/\/$/, ''),
					path: normalizedRoot,
				},
			];
			let cursor = normalizedRoot;
			for (const part of parts) {
				cursor += `${part}/`;
				crumbs.push({ label: part, path: cursor });
			}
			return crumbs;
		}, [currentFolder, normalizedRoot]);

		const navigateTo = useCallback(
			(folder: string) => {
				const normalized =
					normalizeAssetFolderPath(folder, normalizedRoot) ??
					normalizedRoot;
				setCurrentFolder(normalized);
				setSelectedPaths(new Set());
			},
			[normalizedRoot]
		);

		const uploadFiles = useCallback(
			async (
				files: FileList | File[] | null,
				targetFolder = currentFolder
			) => {
				if (!files || files.length === 0) return;
				const normalizedTarget =
					normalizeAssetFolderPath(targetFolder, normalizedRoot) ??
					currentFolder;

				for (const file of Array.from(files)) {
					if (!file.name) continue;
					const safeName = normalizeAssetFilename(file.name);
					const path = joinAssetPath(normalizedTarget, safeName);
					if (
						assetUrls[path] &&
						!confirm(`已存在同名文件 ${path}，是否覆盖？`)
					) {
						continue;
					}
					const blob = new Blob([await file.arrayBuffer()], {
						type: file.type,
					});
					onUpload(path, blob);
				}
			},
			[assetUrls, currentFolder, normalizedRoot, onUpload]
		);

		const handleCreateFolder = useCallback(() => {
			const raw = newFolderName.trim();
			const name = normalizeAssetFilename(raw);
			if (!raw) return;
			const folder = normalizeAssetFolderPath(
				`${currentFolder}${name}`,
				normalizedRoot
			);
			if (!folder) {
				alert('请输入有效目录名');
				return;
			}
			onCreateFolder?.(folder);
			setNewFolderName('');
			setIsCreateFolderOpen(false);
			navigateTo(folder);
		}, [
			currentFolder,
			navigateTo,
			newFolderName,
			normalizedRoot,
			onCreateFolder,
		]);

		const selectEntry = useCallback(
			(entry: AssetEntry, additive: boolean) => {
				setSelectedPaths((prev) => {
					const next = additive ? new Set(prev) : new Set<string>();
					if (additive && next.has(entry.path)) {
						next.delete(entry.path);
					} else {
						next.add(entry.path);
					}
					return next;
				});
			},
			[]
		);

		const handleConfirmSelect = useCallback(() => {
			const filePath = Array.from(selectedPaths).find(
				(p) => !p.endsWith('/')
			);
			if (filePath) onSelectFile?.(filePath);
		}, [selectedPaths, onSelectFile]);

		const handleEntryOpen = useCallback(
			(entry: AssetEntry) => {
				if (entry.kind === 'folder') {
					navigateTo(entry.path);
					return;
				}
				onSelectFile?.(entry.path);
			},
			[navigateTo, onSelectFile]
		);

		const handleCopyPaths = useCallback(() => {
			const text =
				selectedPaths.size > 0
					? Array.from(selectedPaths).join('\n')
					: currentFolder;
			navigator.clipboard?.writeText(text).catch(() => {});
		}, [currentFolder, selectedPaths]);

		const copyText = useCallback((key: string, value: string) => {
			navigator.clipboard?.writeText(value).catch(() => {});
			setCopiedKey(key);
			window.setTimeout(() => {
				setCopiedKey((current) => (current === key ? null : current));
			}, 1200);
		}, []);

		const handleDelete = useCallback(() => {
			if (selectedPaths.size === 0) return;
			const expanded = expandAssetSelection(selectedPaths, assetPaths);
			if (expanded.length === 0) {
				const folders = Array.from(selectedPaths).filter((path) =>
					path.endsWith('/')
				);
				if (folders.length > 0) onRemoveFolders?.(folders);
				setSelectedPaths(new Set());
				return;
			}
			if (!confirm(`确定删除选中的 ${expanded.length} 个文件吗？`))
				return;
			onRemove(expanded);
			onRemoveFolders?.(
				Array.from(selectedPaths).filter((path) => path.endsWith('/'))
			);
			setSelectedPaths(new Set());
		}, [assetPaths, onRemove, onRemoveFolders, selectedPaths]);

		const handleClipboardPaste = useCallback(() => {
			if (!clipboard) return;
			const operations = buildAssetPathOperations(
				clipboard.paths,
				assetPaths,
				currentFolder,
				clipboard.mode
			);
			if (!operations) {
				alert('目标路径无效或存在冲突，请选择其他目录。');
				return;
			}
			if (operations.length === 0) {
				setClipboard(null);
				return;
			}
			const existingTargets = operations.filter((operation) =>
				Boolean(assetUrls[operation.to])
			);
			if (
				existingTargets.length > 0 &&
				!confirm(
					`将覆盖 ${existingTargets.length} 个同名文件，是否继续？`
				)
			) {
				return;
			}
			if (clipboard.mode === 'copy') onCopy(operations);
			else onMove(operations);
			if (clipboard.mode === 'move') setClipboard(null);
			setSelectedPaths(new Set());
		}, [assetPaths, assetUrls, clipboard, currentFolder, onCopy, onMove]);

		const handleMoveToFolder = useCallback(
			(target: string) => {
				const operations = buildAssetPathOperations(
					selectedPaths,
					assetPaths,
					target,
					'move'
				);
				if (!operations) {
					alert('无法移动到自身或子目录。');
					return;
				}
				const existingTargets = operations.filter((operation) =>
					Boolean(assetUrls[operation.to])
				);
				if (
					existingTargets.length > 0 &&
					!confirm(
						`将覆盖 ${existingTargets.length} 个同名文件，是否继续？`
					)
				) {
					return;
				}
				onMove(operations);
				setSelectedPaths(new Set());
			},
			[assetPaths, assetUrls, onMove, selectedPaths]
		);

		const handleCopyToFolder = useCallback(
			(target: string) => {
				const operations = buildAssetPathOperations(
					selectedPaths,
					assetPaths,
					target,
					'copy'
				);
				if (!operations) {
					alert('目标路径无效或存在冲突，请选择其他目录。');
					return;
				}
				const existingTargets = operations.filter((operation) =>
					Boolean(assetUrls[operation.to])
				);
				if (
					existingTargets.length > 0 &&
					!confirm(
						`将覆盖 ${existingTargets.length} 个同名文件，是否继续？`
					)
				) {
					return;
				}
				onCopy(operations);
				setSelectedPaths(new Set());
			},
			[assetPaths, assetUrls, onCopy, selectedPaths]
		);

		const handleDragEnter = useCallback((e: React.DragEvent) => {
			if (!Array.from(e.dataTransfer?.types ?? []).includes('Files'))
				return;
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(true);
		}, []);

		const handleDragOver = useCallback((e: React.DragEvent) => {
			if (!Array.from(e.dataTransfer?.types ?? []).includes('Files'))
				return;
			e.preventDefault();
			e.stopPropagation();
			e.dataTransfer.dropEffect = 'copy';
		}, []);

		const handleDragLeave = useCallback((e: React.DragEvent) => {
			if (e.currentTarget === e.target) setIsDragging(false);
		}, []);

		const handleDrop = useCallback(
			(e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(false);
				uploadFiles(e.dataTransfer?.files ?? null);
			},
			[uploadFiles]
		);

		const isSelectOnly = selectionMode === 'select';

		useEffect(() => {
			if (!isCreateFolderOpen) return;
			const timer = window.setTimeout(() => {
				document.getElementById('asset-new-folder-name')?.focus();
			}, 0);
			return () => window.clearTimeout(timer);
		}, [isCreateFolderOpen]);

		return (
			<div
				onDragEnter={handleDragEnter}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					'relative flex min-h-[520px] flex-col gap-4 rounded-lg bg-white/10 p-4 shadow-md backdrop-blur',
					isDragging && 'ring-2 ring-primary',
					className
				)}
			>
				{isDragging && (
					<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-lg bg-primary/10 backdrop-blur-sm">
						<span className="rounded-md bg-white/80 px-4 py-2 text-sm font-medium text-foreground shadow dark:bg-black/60">
							松开鼠标以上传到{' '}
							<code className="font-mono">{currentFolder}</code>
						</span>
					</div>
				)}

				<div className="flex flex-col gap-3 border-b border-black/5 pb-4 dark:border-white/5">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<div>
							<h2 className="text-xl font-semibold">资产文件</h2>
							<p className="text-xs opacity-60">
								{currentFolder} · {stats.folders} 个目录 ·{' '}
								{stats.files} 个文件
							</p>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<Button
								variant="light"
								size="sm"
								onPress={() =>
									navigateTo(
										getAssetParentFolder(
											currentFolder,
											normalizedRoot
										)
									)
								}
								isDisabled={currentFolder === normalizedRoot}
								className="h-8 rounded-md px-3 text-xs"
							>
								上一级
							</Button>
							<Button
								color={
									viewMode === 'grid' ? 'primary' : 'default'
								}
								variant={viewMode === 'grid' ? 'flat' : 'light'}
								size="sm"
								onPress={() => setViewMode('grid')}
								className="h-8 rounded-md px-3 text-xs"
							>
								网格
							</Button>
							<Button
								color={
									viewMode === 'list' ? 'primary' : 'default'
								}
								variant={viewMode === 'list' ? 'flat' : 'light'}
								size="sm"
								onPress={() => setViewMode('list')}
								className="h-8 rounded-md px-3 text-xs"
							>
								列表
							</Button>
						</div>
					</div>

					<div className="flex flex-col gap-2">
						<div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
							<div className="flex min-w-0 flex-wrap items-center gap-1 text-xs">
								{breadcrumbs.map((crumb, index) => (
									<div
										key={crumb.path}
										className="flex min-w-0 items-center gap-1"
									>
										{index > 0 && (
											<ChevronRight className="h-3 w-3 shrink-0 opacity-40" />
										)}
										<button
											onClick={() =>
												navigateTo(crumb.path)
											}
											className={cn(
												'max-w-[10rem] truncate rounded px-1.5 py-1 font-mono transition-colors hover:bg-black/5 sm:max-w-[14rem] dark:hover:bg-white/5',
												crumb.path === currentFolder
													? 'text-foreground'
													: 'text-primary'
											)}
											title={crumb.path}
										>
											{crumb.label}
										</button>
									</div>
								))}
							</div>

							<div className="flex shrink-0 flex-wrap items-center gap-2 xl:justify-end">
								<Button
									color={
										isCreateFolderOpen
											? 'primary'
											: 'default'
									}
									variant={
										isCreateFolderOpen ? 'flat' : 'light'
									}
									size="sm"
									startContent={
										<PlusIcon className="h-3.5 w-3.5" />
									}
									onPress={() =>
										setIsCreateFolderOpen((v) => !v)
									}
									className="h-8 rounded-md px-3 text-xs"
								>
									新建文件夹
								</Button>
								<Button
									color="primary"
									size="sm"
									startContent={<UploadIcon />}
									onPress={() =>
										fileInputRef.current?.click()
									}
									className="h-8 rounded-md px-3 text-xs"
								>
									上传文件
								</Button>
								<Button
									variant="flat"
									size="sm"
									onPress={() =>
										folderInputRef.current?.click()
									}
									className="h-8 rounded-md px-3 text-xs"
								>
									上传目录
								</Button>
								<input
									ref={fileInputRef}
									type="file"
									accept={acceptedFileTypes}
									multiple
									className="hidden"
									onChange={(e) => {
										uploadFiles(e.target.files);
										e.target.value = '';
									}}
								/>
								<input
									ref={folderInputRef}
									type="file"
									multiple
									className="hidden"
									onChange={(e) => {
										uploadFiles(e.target.files);
										e.target.value = '';
									}}
									{...{ webkitdirectory: '', directory: '' }}
								/>
							</div>
						</div>
						{isCreateFolderOpen && (
							<div className="flex flex-col gap-2 rounded-lg border border-dashed border-black/10 bg-black/5 p-3 sm:flex-row sm:items-end dark:border-white/10 dark:bg-white/5">
								<div className="flex flex-1 flex-col gap-1">
									<label
										htmlFor="asset-new-folder-name"
										className="text-[11px] font-medium opacity-70"
									>
										在当前目录下新建
									</label>
									<TextInput
										id="asset-new-folder-name"
										value={newFolderName}
										onChange={(e) =>
											setNewFolderName(e.target.value)
										}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												handleCreateFolder();
											}
											if (e.key === 'Escape') {
												setIsCreateFolderOpen(false);
											}
										}}
										placeholder="FolderName"
										className="font-mono"
									/>
								</div>
								<div className="flex gap-2">
									<Button
										color="primary"
										size="sm"
										onPress={handleCreateFolder}
										isDisabled={!newFolderName.trim()}
										className="h-9 rounded-md px-3 text-xs"
									>
										创建并进入
									</Button>
									<Button
										variant="light"
										size="sm"
										onPress={() => {
											setNewFolderName('');
											setIsCreateFolderOpen(false);
										}}
										className="h-9 rounded-md px-3 text-xs"
									>
										取消
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-black/5 bg-black/[0.03] p-2 dark:border-white/5 dark:bg-white/[0.03]">
					<div className="text-xs opacity-60">
						已选择 {selectedPaths.size} 项
						{selectedAssetPaths.length > 0 &&
							`，包含 ${selectedAssetPaths.length} 个文件`}
					</div>
					<div className="flex flex-wrap gap-1">
						{isSelectOnly &&
							selectedPaths.size === 1 &&
							!Array.from(selectedPaths).some((p) =>
								p.endsWith('/')
							) && (
								<Button
									color="primary"
									size="sm"
									onPress={handleConfirmSelect}
									className="h-7 rounded px-3 text-xs font-semibold"
								>
									确定选择
								</Button>
							)}
						<Button
							variant="light"
							size="sm"
							startContent={<CopyIcon />}
							onPress={handleCopyPaths}
							className="h-7 rounded px-2 text-xs"
						>
							复制路径
						</Button>
						{!isSelectOnly && (
							<>
								<Button
									variant="light"
									size="sm"
									startContent={<CopyIcon />}
									onPress={() =>
										setClipboard({
											mode: 'copy',
											paths: new Set(selectedPaths),
										})
									}
									isDisabled={selectedPaths.size === 0}
									className="h-7 rounded px-2 text-xs"
								>
									复制
								</Button>
								<Button
									variant="light"
									size="sm"
									startContent={<ScissorsIcon />}
									onPress={() =>
										setClipboard({
											mode: 'move',
											paths: new Set(selectedPaths),
										})
									}
									isDisabled={selectedPaths.size === 0}
									className="h-7 rounded px-2 text-xs"
								>
									移动
								</Button>
								<Button
									color="primary"
									variant="flat"
									size="sm"
									startContent={<PasteIcon />}
									onPress={handleClipboardPaste}
									isDisabled={!clipboard}
									className="h-7 rounded px-2 text-xs"
								>
									粘贴
								</Button>
								<Select<string>
									value={undefined}
									onChange={handleCopyToFolder}
									items={moveTargetItems}
									ariaLabel="复制到"
									placeholder="复制到..."
									size="sm"
									isDisabled={selectedPaths.size === 0}
									className="h-7 w-36 rounded px-2 py-0 text-xs"
									menuMaxHeightClass="max-h-80"
								/>
								<Select<string>
									value={undefined}
									onChange={handleMoveToFolder}
									items={moveTargetItems}
									ariaLabel="移动到"
									placeholder="移动到..."
									size="sm"
									isDisabled={selectedPaths.size === 0}
									className="h-7 w-36 rounded px-2 py-0 text-xs"
									menuMaxHeightClass="max-h-80"
								/>
								<Button
									color="danger"
									variant="flat"
									size="sm"
									startContent={
										<TrashIcon className="h-3.5 w-3.5" />
									}
									onPress={handleDelete}
									isDisabled={selectedPaths.size === 0}
									className="h-7 rounded px-2 text-xs"
								>
									删除
								</Button>
							</>
						)}
					</div>
				</div>

				{entries.length === 0 ? (
					<EmptyState
						title="此目录为空"
						description="点击上传文件、上传目录，或将文件拖拽到本面板。"
						className="my-auto"
					/>
				) : viewMode === 'grid' ? (
					<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6">
						{entries.map((entry) => (
							<div
								key={entry.path}
								onClick={(e) =>
									selectEntry(entry, e.ctrlKey || e.metaKey)
								}
								onDoubleClick={() => handleEntryOpen(entry)}
								className={cn(
									'group flex min-h-0 cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all',
									selectedPaths.has(entry.path)
										? 'border-primary bg-primary/20 shadow-inner'
										: 'border-black/10 bg-white/40 hover:border-primary/40 hover:bg-white/60 dark:border-white/10 dark:bg-black/10 dark:hover:bg-white/10'
								)}
								title={entry.path}
							>
								<div
									className={cn(
										'flex h-28 items-center justify-center overflow-hidden',
										entry.kind === 'image' ||
											entry.kind === 'file'
											? 'bg-checkerboard'
											: ''
									)}
								>
									<FilePreview entry={entry} />
								</div>
								<div className="flex min-w-0 flex-col gap-1 p-2">
									<div className="flex min-w-0 items-center gap-1.5">
										<FileIcon kind={entry.kind} />
										<span className="truncate text-xs font-semibold">
											{entry.name}
										</span>
									</div>
									<span className="truncate font-mono text-[10px] opacity-50">
										{entry.path}
									</span>
									<div className="mt-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
										{entry.kind !== 'folder' && (
											<>
												<Button
													variant="light"
													size="sm"
													onPress={() =>
														copyText(
															`path:${entry.path}`,
															entry.path
														)
													}
													onClick={(e) =>
														e.stopPropagation()
													}
													className={cn(
														'h-6 min-w-0 rounded border border-black/10 px-2 font-mono text-[10px] dark:border-white/10',
														copiedKey ===
															`path:${entry.path}` &&
															'border-success text-success'
													)}
													title="复制 assets/... 路径"
												>
													{copiedKey ===
													`path:${entry.path}`
														? '已复制'
														: 'path'}
												</Button>
												<Button
													variant="light"
													size="sm"
													onPress={() =>
														copyText(
															`uri:${entry.path}`,
															buildRexUri(
																packLabel,
																entry.path
															)
														)
													}
													onClick={(e) =>
														e.stopPropagation()
													}
													className={cn(
														'h-6 min-w-0 rounded border border-black/10 px-2 font-mono text-[10px] dark:border-white/10',
														copiedKey ===
															`uri:${entry.path}` &&
															'border-success text-success'
													)}
													title="复制 rex:// URI"
												>
													{copiedKey ===
													`uri:${entry.path}`
														? '已复制'
														: 'URI'}
												</Button>
											</>
										)}
										<Button
											variant="light"
											size="sm"
											onPress={() =>
												handleEntryOpen(entry)
											}
											onClick={(e) => e.stopPropagation()}
											className="h-6 min-w-0 flex-1 rounded px-2 text-[11px]"
										>
											{entry.kind === 'folder'
												? '打开'
												: '选择'}
										</Button>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="overflow-hidden rounded-lg border border-black/10 bg-white/30 dark:border-white/10 dark:bg-black/10">
						{entries.map((entry) => (
							<div
								key={entry.path}
								onClick={(e) =>
									selectEntry(entry, e.ctrlKey || e.metaKey)
								}
								onDoubleClick={() => handleEntryOpen(entry)}
								className={cn(
									'grid w-full cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-black/5 px-3 py-2 text-left text-sm last:border-b-0 dark:border-white/5',
									selectedPaths.has(entry.path)
										? 'bg-primary/20'
										: 'hover:bg-black/5 dark:hover:bg-white/5'
								)}
								title={entry.path}
							>
								<div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded bg-black/5 dark:bg-white/5">
									{entry.kind === 'image' && entry.url ? (
										<img
											src={entry.url}
											alt=""
											className="h-full w-full object-contain"
											draggable={false}
										/>
									) : (
										<FileIcon kind={entry.kind} />
									)}
								</div>
								<div className="min-w-0">
									<div className="truncate font-medium">
										{entry.name}
									</div>
									<div className="truncate font-mono text-[10px] opacity-50">
										{entry.path}
									</div>
								</div>
								<div className="flex items-center gap-1">
									{entry.kind !== 'folder' ? (
										<>
											<Button
												variant="light"
												size="sm"
												onPress={() =>
													copyText(
														`path:${entry.path}`,
														entry.path
													)
												}
												onClick={(e) =>
													e.stopPropagation()
												}
												className={cn(
													'h-6 min-w-0 rounded border border-black/10 px-2 font-mono text-[10px] dark:border-white/10',
													copiedKey ===
														`path:${entry.path}` &&
														'border-success text-success'
												)}
												title="复制 assets/... 路径"
											>
												{copiedKey ===
												`path:${entry.path}`
													? '已复制'
													: 'path'}
											</Button>
											<Button
												variant="light"
												size="sm"
												onPress={() =>
													copyText(
														`uri:${entry.path}`,
														buildRexUri(
															packLabel,
															entry.path
														)
													)
												}
												onClick={(e) =>
													e.stopPropagation()
												}
												className={cn(
													'h-6 min-w-0 rounded border border-black/10 px-2 font-mono text-[10px] dark:border-white/10',
													copiedKey ===
														`uri:${entry.path}` &&
														'border-success text-success'
												)}
												title="复制 rex:// URI"
											>
												{copiedKey ===
												`uri:${entry.path}`
													? '已复制'
													: 'URI'}
											</Button>
										</>
									) : (
										<span className="text-xs opacity-50">
											目录
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		);
	}
);
