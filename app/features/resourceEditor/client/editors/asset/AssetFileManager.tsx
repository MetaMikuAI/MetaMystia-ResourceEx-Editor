'use client';

import { cn } from '@heroui/theme';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Button from '@/design/ui/components/button';
import Input from '@/design/ui/components/input';
import PressElement from '@/design/ui/components/pressElement';

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
} from '@/features/resourceEditor/client/assets/assetPaths';
import type { IAssetPathOperation } from '@/features/resourceEditor/client/assets/contracts';
import { PlusIcon } from '@/features/resourceEditor/client/components/actions/PlusIcon';
import { TrashIcon } from '@/features/resourceEditor/client/components/actions/TrashIcon';
import { ConfirmDialog } from '@/features/resourceEditor/client/components/confirm/ConfirmDialog';
import { Label } from '@/features/resourceEditor/client/components/fields/Label';
import { ChevronRight } from '@/features/resourceEditor/client/components/icons/ChevronRight';
import { EditorPanel } from '@/features/resourceEditor/client/components/layout/EditorPanel';
import { EmptyState } from '@/features/resourceEditor/client/components/layout/EmptyState';
import {
	Select,
	type SelectItem as SelectItemSpec,
} from '@/features/resourceEditor/client/components/select/Select';
import { WarningNotice } from '@/features/resourceEditor/client/components/status/WarningNotice';

import { safeStorage } from '@/infrastructure/browser/storage/safeStorage';

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
interface IConfirmationRequest {
	title: string;
	description: string;
	confirmLabel: string;
}

interface IConfirmationResolver {
	operationId: number;
	resolve: (isConfirmed: boolean) => void;
}

const DEFAULT_ROOT = 'assets/';
const VIEW_MODE_STORAGE_KEY = 'assetFileManager.viewMode';

const ASSET_KIND_LABELS = {
	audio: '音频',
	file: '文件',
	folder: '目录',
	image: '图片',
} as const satisfies Record<AssetEntry['kind'], string>;

function FileKindBadge({ kind }: { kind: AssetEntry['kind'] }) {
	return (
		<span className="inline-flex min-w-10 items-center justify-center rounded-small bg-default/40 px-2 py-1 text-xs font-semibold text-foreground-600">
			{ASSET_KIND_LABELS[kind]}
		</span>
	);
}

function FilePreview({ entry }: { entry: AssetEntry }) {
	if (entry.kind === 'folder') {
		return (
			<div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
				<FileKindBadge kind="folder" />
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
					className="pointer-events-auto h-8 w-full"
				/>
			</div>
		);
	}
	return (
		<div className="flex h-full w-full items-center justify-center bg-content2/30">
			<FileKindBadge kind={entry.kind} />
		</div>
	);
}

interface IAssetEntrySelectionButtonProps {
	className?: string;
	entry: AssetEntry;
	isSelected: boolean;
	onOpen?: () => void;
	onSelect: (isAdditive: boolean) => void;
}

function AssetEntrySelectionButton({
	className,
	entry,
	isSelected,
	onOpen,
	onSelect,
}: IAssetEntrySelectionButtonProps) {
	return (
		<PressElement
			as="div"
			role="button"
			tabIndex={0}
			aria-label={`选择${ASSET_KIND_LABELS[entry.kind]}${entry.name}`}
			aria-pressed={isSelected}
			onPress={(event) => onSelect(event.ctrlKey || event.metaKey)}
			{...(onOpen === undefined ? {} : { onDoubleClick: onOpen })}
			className={cn(
				'absolute inset-0 z-0 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus motion-reduce:transition-none',
				isSelected
					? 'data-[pressed=true]:bg-primary/10'
					: 'hover:bg-default/30 data-[pressed=true]:bg-default/40',
				className
			)}
		/>
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

function buildUploadPath(
	file: File,
	targetFolder: string,
	normalizedRoot: string
): string {
	const relativePath = file.webkitRelativePath?.trim() || file.name;
	const pathSegments = relativePath
		.replace(/\\/g, '/')
		.split('/')
		.filter(Boolean)
		.map((segment) => {
			const normalized = normalizeAssetFilename(segment);
			return normalized === '.' || normalized === '..'
				? 'untitled'
				: normalized;
		});
	const filename = pathSegments.pop() ?? normalizeAssetFilename(file.name);
	const uploadFolder =
		pathSegments.length > 0
			? normalizeAssetFolderPath(
					`${targetFolder}${pathSegments.join('/')}`,
					normalizedRoot
				)
			: targetFolder;

	return joinAssetPath(uploadFolder ?? targetFolder, filename);
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
		const [operationError, setOperationError] = useState<string | null>(
			null
		);
		const [confirmation, setConfirmation] =
			useState<IConfirmationRequest | null>(null);

		const fileInputRef = useRef<HTMLInputElement>(null);
		const folderInputRef = useRef<HTMLInputElement>(null);
		const confirmationResolverRef = useRef<IConfirmationResolver | null>(
			null
		);
		const isDisposedRef = useRef(false);
		const operationIdRef = useRef(0);

		const isOperationActive = useCallback((operationId: number) => {
			return (
				!isDisposedRef.current && operationIdRef.current === operationId
			);
		}, []);

		const beginOperation = useCallback(() => {
			const operationId = operationIdRef.current + 1;
			operationIdRef.current = operationId;
			confirmationResolverRef.current?.resolve(false);
			confirmationResolverRef.current = null;
			if (!isDisposedRef.current) setConfirmation(null);
			return operationId;
		}, []);

		const requestConfirmation = useCallback(
			(request: IConfirmationRequest, operationId: number) => {
				if (!isOperationActive(operationId)) {
					return Promise.resolve(false);
				}

				return new Promise<boolean>((resolve) => {
					if (!isOperationActive(operationId)) {
						resolve(false);
						return;
					}
					confirmationResolverRef.current = { operationId, resolve };
					setConfirmation(request);
				});
			},
			[isOperationActive]
		);

		const finishConfirmation = useCallback(
			(isConfirmed: boolean) => {
				const resolver = confirmationResolverRef.current;
				confirmationResolverRef.current = null;
				if (!isDisposedRef.current) setConfirmation(null);
				if (resolver) {
					resolver.resolve(
						isConfirmed && isOperationActive(resolver.operationId)
					);
				}
			},
			[isOperationActive]
		);

		useEffect(() => {
			isDisposedRef.current = false;
			return () => {
				isDisposedRef.current = true;
				operationIdRef.current += 1;
				confirmationResolverRef.current?.resolve(false);
				confirmationResolverRef.current = null;
			};
		}, []);

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
				const operationId = beginOperation();
				const normalizedTarget =
					normalizeAssetFolderPath(targetFolder, normalizedRoot) ??
					currentFolder;

				for (const file of Array.from(files)) {
					if (!isOperationActive(operationId)) return;
					if (!file.name) continue;
					const path = buildUploadPath(
						file,
						normalizedTarget,
						normalizedRoot
					);
					if (assetUrls[path]) {
						if (!isOperationActive(operationId)) return;
						const shouldOverwrite = await requestConfirmation(
							{
								title: '覆盖同名文件？',
								description: `已存在同名文件 ${path}。`,
								confirmLabel: '确认覆盖',
							},
							operationId
						);
						if (!isOperationActive(operationId)) return;
						if (!shouldOverwrite) continue;
					}
					const arrayBuffer = await file.arrayBuffer();
					if (!isOperationActive(operationId)) return;
					const blob = new Blob([arrayBuffer], { type: file.type });
					if (!isOperationActive(operationId)) return;
					onUpload(path, blob);
				}
			},
			[
				assetUrls,
				beginOperation,
				currentFolder,
				isOperationActive,
				normalizedRoot,
				onUpload,
				requestConfirmation,
			]
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
				setOperationError('请输入有效目录名。');
				return;
			}
			setOperationError(null);
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
					if (!additive) {
						return prev.size === 1 && prev.has(entry.path)
							? new Set()
							: new Set([entry.path]);
					}

					const next = new Set(prev);
					if (next.has(entry.path)) next.delete(entry.path);
					else next.add(entry.path);

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
				if (selectionMode === 'select') {
					onSelectFile?.(entry.path);
				}
			},
			[navigateTo, onSelectFile, selectionMode]
		);

		const writeClipboardText = useCallback(async (value: string) => {
			try {
				if (!navigator.clipboard)
					throw new Error('Clipboard unavailable');
				await navigator.clipboard.writeText(value);
				setOperationError(null);
				return true;
			} catch {
				setOperationError('复制失败，请检查浏览器剪贴板权限后重试。');
				return false;
			}
		}, []);

		const handleCopyPaths = useCallback(async () => {
			const text =
				selectedPaths.size > 0
					? Array.from(selectedPaths).join('\n')
					: currentFolder;
			await writeClipboardText(text);
		}, [currentFolder, selectedPaths, writeClipboardText]);

		const copyText = useCallback(
			async (key: string, value: string) => {
				if (!(await writeClipboardText(value))) return;
				setCopiedKey(key);
				window.setTimeout(() => {
					setCopiedKey((current) =>
						current === key ? null : current
					);
				}, 1200);
			},
			[writeClipboardText]
		);

		const handleDelete = useCallback(async () => {
			if (selectedPaths.size === 0) return;
			const operationId = beginOperation();
			const expanded = expandAssetSelection(selectedPaths, assetPaths);
			const folders = Array.from(selectedPaths).filter((path) =>
				path.endsWith('/')
			);
			if (!isOperationActive(operationId)) return;
			const shouldDelete = await requestConfirmation(
				{
					title: '确定删除选中的资产吗？',
					description: `将删除${expanded.length}个文件和${folders.length}个目录。此操作不可撤销。`,
					confirmLabel: '确认删除',
				},
				operationId
			);
			if (!isOperationActive(operationId)) return;
			if (!shouldDelete) return;
			if (!isOperationActive(operationId)) return;
			if (expanded.length > 0) onRemove(expanded);
			if (!isOperationActive(operationId)) return;
			if (folders.length > 0) onRemoveFolders?.(folders);
			if (!isOperationActive(operationId)) return;
			setSelectedPaths(new Set());
		}, [
			assetPaths,
			beginOperation,
			isOperationActive,
			onRemove,
			onRemoveFolders,
			requestConfirmation,
			selectedPaths,
		]);

		const handleClipboardPaste = useCallback(async () => {
			if (!clipboard) return;
			const operationId = beginOperation();
			const operations = buildAssetPathOperations(
				clipboard.paths,
				assetPaths,
				currentFolder,
				clipboard.mode
			);
			if (!operations) {
				setOperationError('目标路径无效或存在冲突，请选择其他目录。');
				return;
			}
			if (operations.length === 0) {
				setClipboard(null);
				return;
			}
			const existingTargets = operations.filter((operation) =>
				Boolean(assetUrls[operation.to])
			);
			if (existingTargets.length > 0) {
				if (!isOperationActive(operationId)) return;
				const shouldOverwrite = await requestConfirmation(
					{
						title: '覆盖同名文件？',
						description: `将覆盖${existingTargets.length}个同名文件。`,
						confirmLabel: '继续粘贴',
					},
					operationId
				);
				if (!isOperationActive(operationId)) return;
				if (!shouldOverwrite) return;
			}
			if (!isOperationActive(operationId)) return;
			setOperationError(null);
			if (!isOperationActive(operationId)) return;
			if (clipboard.mode === 'copy') onCopy(operations);
			else onMove(operations);
			if (!isOperationActive(operationId)) return;
			if (clipboard.mode === 'move') setClipboard(null);
			setSelectedPaths(new Set());
		}, [
			assetPaths,
			assetUrls,
			beginOperation,
			clipboard,
			currentFolder,
			isOperationActive,
			onCopy,
			onMove,
			requestConfirmation,
		]);

		const handleMoveToFolder = useCallback(
			async (target: string) => {
				const operationId = beginOperation();
				const operations = buildAssetPathOperations(
					selectedPaths,
					assetPaths,
					target,
					'move'
				);
				if (!operations) {
					setOperationError('无法移动到自身或子目录。');
					return;
				}
				const existingTargets = operations.filter((operation) =>
					Boolean(assetUrls[operation.to])
				);
				if (existingTargets.length > 0) {
					if (!isOperationActive(operationId)) return;
					const shouldOverwrite = await requestConfirmation(
						{
							title: '覆盖同名文件？',
							description: `将覆盖${existingTargets.length}个同名文件。`,
							confirmLabel: '继续移动',
						},
						operationId
					);
					if (!isOperationActive(operationId)) return;
					if (!shouldOverwrite) return;
				}
				if (!isOperationActive(operationId)) return;
				setOperationError(null);
				if (!isOperationActive(operationId)) return;
				onMove(operations);
				if (!isOperationActive(operationId)) return;
				setSelectedPaths(new Set());
			},
			[
				assetPaths,
				assetUrls,
				beginOperation,
				isOperationActive,
				onMove,
				requestConfirmation,
				selectedPaths,
			]
		);

		const handleCopyToFolder = useCallback(
			async (target: string) => {
				const operationId = beginOperation();
				const operations = buildAssetPathOperations(
					selectedPaths,
					assetPaths,
					target,
					'copy'
				);
				if (!operations) {
					setOperationError(
						'目标路径无效或存在冲突，请选择其他目录。'
					);
					return;
				}
				const existingTargets = operations.filter((operation) =>
					Boolean(assetUrls[operation.to])
				);
				if (existingTargets.length > 0) {
					if (!isOperationActive(operationId)) return;
					const shouldOverwrite = await requestConfirmation(
						{
							title: '覆盖同名文件？',
							description: `将覆盖${existingTargets.length}个同名文件。`,
							confirmLabel: '继续复制',
						},
						operationId
					);
					if (!isOperationActive(operationId)) return;
					if (!shouldOverwrite) return;
				}
				if (!isOperationActive(operationId)) return;
				setOperationError(null);
				if (!isOperationActive(operationId)) return;
				onCopy(operations);
				if (!isOperationActive(operationId)) return;
				setSelectedPaths(new Set());
			},
			[
				assetPaths,
				assetUrls,
				beginOperation,
				isOperationActive,
				onCopy,
				requestConfirmation,
				selectedPaths,
			]
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
			<EditorPanel
				className={cn(
					'min-h-[520px] overflow-hidden p-0',
					isDragging && 'ring-2 ring-primary',
					className
				)}
			>
				<div
					onDragEnter={handleDragEnter}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className="relative flex min-h-[520px] flex-1 flex-col gap-4 p-4"
				>
					<ConfirmDialog
						isOpen={confirmation !== null}
						title={confirmation?.title ?? ''}
						description={confirmation?.description}
						confirmLabel={confirmation?.confirmLabel}
						onCancel={() => finishConfirmation(false)}
						onConfirm={() => finishConfirmation(true)}
					/>
					{isDragging && (
						<div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
							<span className="rounded-medium border border-divider bg-content1/90 px-4 py-2 text-sm font-medium text-foreground shadow-sm">
								松开鼠标以上传到{' '}
								<code className="font-mono">
									{currentFolder}
								</code>
							</span>
						</div>
					)}

					<div className="flex flex-col gap-3 border-b border-divider pb-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div>
								<h2 className="text-xl font-semibold">
									资产文件
								</h2>
								<p className="text-xs leading-relaxed text-foreground-600">
									{currentFolder} · {stats.folders}个目录 ·{' '}
									{stats.files}个文件
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
									isDisabled={
										currentFolder === normalizedRoot
									}
									className="min-h-11 rounded-medium px-3 text-xs sm:min-h-8"
								>
									上一级
								</Button>
								<Button
									color={
										viewMode === 'grid'
											? 'primary'
											: 'default'
									}
									variant={
										viewMode === 'grid' ? 'flat' : 'light'
									}
									size="sm"
									onPress={() => setViewMode('grid')}
									className="min-h-11 rounded-medium px-3 text-xs sm:min-h-8"
								>
									网格
								</Button>
								<Button
									color={
										viewMode === 'list'
											? 'primary'
											: 'default'
									}
									variant={
										viewMode === 'list' ? 'flat' : 'light'
									}
									size="sm"
									onPress={() => setViewMode('list')}
									className="min-h-11 rounded-medium px-3 text-xs sm:min-h-8"
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
												<ChevronRight className="h-3 w-3 shrink-0 text-foreground-400" />
											)}
											<Button
												variant="light"
												size="sm"
												onPress={() =>
													navigateTo(crumb.path)
												}
												className={cn(
													'h-8 min-w-0 max-w-[10rem] truncate rounded-medium px-2 font-mono text-xs sm:max-w-[14rem]',
													crumb.path === currentFolder
														? 'bg-default/40 text-foreground'
														: 'text-primary-600'
												)}
												title={crumb.path}
											>
												{crumb.label}
											</Button>
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
											isCreateFolderOpen
												? 'flat'
												: 'light'
										}
										size="sm"
										startContent={
											<PlusIcon className="h-3.5 w-3.5" />
										}
										onPress={() =>
											setIsCreateFolderOpen((v) => !v)
										}
										className="min-h-11 rounded-medium px-3 text-xs sm:min-h-8"
									>
										新建文件夹
									</Button>
									<Button
										color="primary"
										size="sm"
										onPress={() =>
											fileInputRef.current?.click()
										}
										className="min-h-11 rounded-medium px-3 text-xs sm:min-h-8"
									>
										上传文件
									</Button>
									<Button
										variant="flat"
										size="sm"
										onPress={() =>
											folderInputRef.current?.click()
										}
										className="min-h-11 rounded-medium px-3 text-xs sm:min-h-8"
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
										{...{
											webkitdirectory: '',
											directory: '',
										}}
									/>
								</div>
							</div>
							{isCreateFolderOpen && (
								<div className="flex flex-col gap-3 rounded-large border border-dashed border-divider bg-content2/30 p-3 sm:flex-row sm:items-end">
									<div className="flex flex-1 flex-col gap-1">
										<Label
											htmlFor="asset-new-folder-name"
											size="sm"
										>
											在当前目录下新建
										</Label>
										<Input
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
													setIsCreateFolderOpen(
														false
													);
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
											className="h-10 rounded-medium px-3 text-xs"
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
											className="h-10 rounded-medium px-3 text-xs"
										>
											取消
										</Button>
									</div>
								</div>
							)}
						</div>
					</div>
					{operationError !== null && (
						<WarningNotice>{operationError}</WarningNotice>
					)}

					<div className="flex flex-col items-stretch gap-3 rounded-large border border-divider bg-content2/30 p-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="text-xs leading-relaxed text-foreground-600">
							已选择{selectedPaths.size}项
							{selectedAssetPaths.length > 0 &&
								`，包含${selectedAssetPaths.length}个文件`}
						</div>
						<div className="flex w-full flex-wrap gap-1 sm:w-auto sm:justify-end">
							{isSelectOnly &&
								selectedPaths.size === 1 &&
								!Array.from(selectedPaths).some((p) =>
									p.endsWith('/')
								) && (
									<Button
										color="primary"
										size="sm"
										onPress={handleConfirmSelect}
										className="h-10 rounded-medium px-3 text-xs font-semibold sm:h-8"
									>
										确定选择
									</Button>
								)}
							<Button
								variant="light"
								size="sm"
								onPress={handleCopyPaths}
								className="h-10 rounded-medium px-3 text-xs sm:h-8"
							>
								复制路径
							</Button>
							{!isSelectOnly && (
								<>
									<Button
										variant="light"
										size="sm"
										onPress={() =>
											setClipboard({
												mode: 'copy',
												paths: new Set(selectedPaths),
											})
										}
										isDisabled={selectedPaths.size === 0}
										className="h-10 rounded-medium px-3 text-xs sm:h-8"
									>
										复制
									</Button>
									<Button
										variant="light"
										size="sm"
										onPress={() =>
											setClipboard({
												mode: 'move',
												paths: new Set(selectedPaths),
											})
										}
										isDisabled={selectedPaths.size === 0}
										className="h-10 rounded-medium px-3 text-xs sm:h-8"
									>
										移动
									</Button>
									<Button
										variant="light"
										size="sm"
										onPress={handleClipboardPaste}
										isDisabled={!clipboard}
										className="h-10 rounded-medium px-3 text-xs sm:h-8"
									>
										粘贴
									</Button>
									<Select<string>
										value={undefined}
										onChange={handleCopyToFolder}
										items={moveTargetItems}
										ariaLabel="复制到"
										placeholder="复制到…"
										size="sm"
										isDisabled={selectedPaths.size === 0}
										baseClassName="w-full sm:w-36"
										className="rounded-medium px-2 py-0 text-xs"
										menuMaxHeight={320}
									/>
									<Select<string>
										value={undefined}
										onChange={handleMoveToFolder}
										items={moveTargetItems}
										ariaLabel="移动到"
										placeholder="移动到…"
										size="sm"
										isDisabled={selectedPaths.size === 0}
										baseClassName="w-full sm:w-36"
										className="rounded-medium px-2 py-0 text-xs"
										menuMaxHeight={320}
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
										className="h-10 rounded-medium px-3 text-xs sm:h-8"
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
						<div className="grid grid-cols-1 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 3xl:grid-cols-6">
							{entries.map((entry) => (
								<div
									key={entry.path}
									className={cn(
										'relative flex min-h-0 flex-col overflow-hidden rounded-large border text-left transition-colors',
										selectedPaths.has(entry.path)
											? 'border-primary bg-primary/15'
											: 'border-divider bg-content2/30'
									)}
									title={entry.path}
								>
									<AssetEntrySelectionButton
										className="rounded-large hover:ring-1 hover:ring-inset hover:ring-primary/40"
										entry={entry}
										isSelected={selectedPaths.has(
											entry.path
										)}
										onSelect={(isAdditive) =>
											selectEntry(entry, isAdditive)
										}
										{...(entry.kind === 'folder' ||
										isSelectOnly
											? {
													onOpen: () =>
														handleEntryOpen(entry),
												}
											: {})}
									/>
									<div
										className={cn(
											'pointer-events-none relative z-10 flex h-28 items-center justify-center overflow-hidden',
											entry.kind === 'image' ||
												entry.kind === 'file'
												? 'bg-checkerboard'
												: ''
										)}
									>
										<FilePreview entry={entry} />
									</div>
									<div className="pointer-events-none relative z-10 flex min-w-0 flex-col gap-1 p-2">
										<div className="flex min-w-0 items-center gap-1.5">
											<FileKindBadge kind={entry.kind} />
											<span className="truncate text-xs font-semibold">
												{entry.name}
											</span>
										</div>
										<span className="truncate font-mono text-xs text-foreground-500">
											{entry.path}
										</span>
										<div className="pointer-events-auto mt-1 flex flex-wrap gap-1">
											{entry.kind !== 'folder' && (
												<>
													<Button
														variant="bordered"
														size="sm"
														onPress={() =>
															copyText(
																`path:${entry.path}`,
																entry.path
															)
														}
														className={cn(
															'h-8 min-w-0 rounded-medium border-divider px-2 font-mono text-xs',
															copiedKey ===
																`path:${entry.path}` &&
																'border-success text-success'
														)}
														title="复制assets/...路径"
													>
														{copiedKey ===
														`path:${entry.path}`
															? '已复制'
															: 'path'}
													</Button>
													<Button
														variant="bordered"
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
														className={cn(
															'h-8 min-w-0 rounded-medium border-divider px-2 font-mono text-xs',
															copiedKey ===
																`uri:${entry.path}` &&
																'border-success text-success'
														)}
														title="复制rex:// URI"
													>
														{copiedKey ===
														`uri:${entry.path}`
															? '已复制'
															: 'URI'}
													</Button>
												</>
											)}
											{(entry.kind === 'folder' ||
												isSelectOnly) && (
												<Button
													variant="flat"
													size="sm"
													onPress={() =>
														handleEntryOpen(entry)
													}
													className="h-10 min-w-0 flex-1 rounded-medium px-2 text-xs sm:h-8"
												>
													{entry.kind === 'folder'
														? '打开'
														: '选择'}
												</Button>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="overflow-hidden rounded-large border border-divider bg-content2/20">
							{entries.map((entry) => (
								<div
									key={entry.path}
									className={cn(
										'relative grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-divider px-3 py-3 text-left text-sm last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]',
										selectedPaths.has(entry.path)
											? 'bg-primary/15'
											: ''
									)}
									title={entry.path}
								>
									<AssetEntrySelectionButton
										entry={entry}
										isSelected={selectedPaths.has(
											entry.path
										)}
										onSelect={(isAdditive) =>
											selectEntry(entry, isAdditive)
										}
										{...(entry.kind === 'folder' ||
										isSelectOnly
											? {
													onOpen: () =>
														handleEntryOpen(entry),
												}
											: {})}
									/>
									<div className="pointer-events-none relative z-10 flex h-10 w-10 items-center justify-center overflow-hidden rounded-medium bg-default/30">
										{entry.kind === 'image' && entry.url ? (
											<img
												src={entry.url}
												alt={entry.name}
												className="h-full w-full object-contain"
												draggable={false}
											/>
										) : (
											<FileKindBadge kind={entry.kind} />
										)}
									</div>
									<div className="pointer-events-none relative z-10 min-w-0">
										<div className="truncate font-medium">
											{entry.name}
										</div>
										<div className="truncate font-mono text-xs text-foreground-500">
											{entry.path}
										</div>
									</div>
									<div className="pointer-events-auto relative z-10 col-span-2 flex flex-wrap items-center justify-end gap-1 sm:col-span-1">
										{entry.kind !== 'folder' ? (
											<>
												<Button
													variant="bordered"
													size="sm"
													onPress={() =>
														copyText(
															`path:${entry.path}`,
															entry.path
														)
													}
													className={cn(
														'h-8 min-w-0 rounded-medium border-divider px-2 font-mono text-xs',
														copiedKey ===
															`path:${entry.path}` &&
															'border-success text-success'
													)}
													title="复制assets/...路径"
												>
													{copiedKey ===
													`path:${entry.path}`
														? '已复制'
														: 'path'}
												</Button>
												<Button
													variant="bordered"
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
													className={cn(
														'h-8 min-w-0 rounded-medium border-divider px-2 font-mono text-xs',
														copiedKey ===
															`uri:${entry.path}` &&
															'border-success text-success'
													)}
													title="复制rex:// URI"
												>
													{copiedKey ===
													`uri:${entry.path}`
														? '已复制'
														: 'URI'}
												</Button>
											</>
										) : (
											<span className="text-xs text-foreground-500">
												目录
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</EditorPanel>
		);
	}
);
