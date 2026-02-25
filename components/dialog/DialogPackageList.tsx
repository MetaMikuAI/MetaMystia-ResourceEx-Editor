import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EmptyState } from '@/components/common/EmptyState';
import { WarningBadge } from '@/components/common/WarningBadge';
import { ChevronRight } from '@/components/icons/ChevronRight';
import { cn } from '@/lib';
import type { DialogPackage } from '@/types/resource';
import { usePackLabelPrefix } from '@/components/common/useLabelPrefixValidation';

// ─── Types ───────────────────────────────────────────────

interface PackageTreeItem {
	pkg: DialogPackage;
	index: number;
	displayName: string;
}

interface TreeNode {
	items: PackageTreeItem[];
	children: Map<string, TreeNode>;
}

// ─── Constants ───────────────────────────────────────────

const CONFORMING_KEY = '__conforming__';
const OTHER_KEY = '__other__';

// ─── Tree helpers ────────────────────────────────────────

/**
 * 将对话包列表按命名规范构建为两层分组树。
 * 符合 `_{label}_` 前缀的，去掉前缀后按 `_` 分割，取前两段作为分组层级，余下部分作为显示名。
 * 不符合前缀的归入 nonConforming。
 */
function buildDialogTree(
	packages: DialogPackage[],
	prefix: string
): { conforming: TreeNode; nonConforming: PackageTreeItem[] } {
	const conforming: TreeNode = { items: [], children: new Map() };
	const nonConforming: PackageTreeItem[] = [];

	for (let index = 0; index < packages.length; index++) {
		const pkg = packages[index];
		if (!pkg) continue;

		if (prefix && prefix !== '_' && pkg.name.startsWith(prefix)) {
			const remaining = pkg.name.slice(prefix.length);
			const parts = remaining.split('_').filter(Boolean);

			let currentNode = conforming;
			const groupDepth = Math.min(2, parts.length);

			for (let i = 0; i < groupDepth; i++) {
				const part = parts[i]!;
				if (!currentNode.children.has(part)) {
					currentNode.children.set(part, {
						items: [],
						children: new Map(),
					});
				}
				currentNode = currentNode.children.get(part)!;
			}

			const tailParts = parts.slice(groupDepth);
			currentNode.items.push({
				pkg,
				index,
				displayName:
					tailParts.length > 0 ? tailParts.join('_') : pkg.name,
			});
		} else {
			nonConforming.push({ pkg, index, displayName: pkg.name });
		}
	}

	return { conforming, nonConforming };
}

function countTreeItems(node: TreeNode): number {
	let count = node.items.length;
	for (const child of node.children.values()) {
		count += countTreeItems(child);
	}
	return count;
}

/** 收集树中所有分组的路径（用 `/` 拼接），用于初始化展开状态 */
function collectAllGroupPaths(node: TreeNode, parentPath: string): string[] {
	const paths: string[] = [];
	for (const [key, child] of node.children) {
		const path = parentPath ? `${parentPath}/${key}` : key;
		paths.push(path);
		paths.push(...collectAllGroupPaths(child, path));
	}
	return paths;
}

/** 将一个完整路径拆成所有祖先路径（含自身） */
function pathToAncestors(fullPath: string): string[] {
	return fullPath.split('/').reduce<string[]>((acc, seg) => {
		const prev = acc.length > 0 ? acc[acc.length - 1] : '';
		acc.push(prev ? `${prev}/${seg}` : seg);
		return acc;
	}, []);
}

/** 在树中查找某个 index 所属的所有需要展开的路径 */
function findItemGroupPaths(
	node: TreeNode,
	targetIndex: number,
	parentPath: string
): string[] | null {
	if (node.items.some((item) => item.index === targetIndex)) {
		return parentPath ? pathToAncestors(parentPath) : [];
	}
	for (const [key, child] of node.children) {
		const path = parentPath ? `${parentPath}/${key}` : key;
		const result = findItemGroupPaths(child, targetIndex, path);
		if (result) return result;
	}
	return null;
}

// ─── Sub-components ──────────────────────────────────────

function GroupHeader({
	label,
	count,
	expanded,
	onToggle,
	isTopLevel,
}: {
	label: string;
	count: number;
	expanded: boolean;
	onToggle: () => void;
	isTopLevel?: boolean;
}) {
	return (
		<button
			onClick={onToggle}
			className={cn(
				'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5',
				isTopLevel
					? 'text-sm font-semibold'
					: 'text-xs font-medium opacity-80'
			)}
		>
			<ChevronRight
				className={cn(
					'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
					expanded && 'rotate-90'
				)}
			/>
			<span className="truncate">{label}</span>
			<span className="ml-auto shrink-0 text-xs opacity-40">{count}</span>
		</button>
	);
}

function DialogTreeItem({
	item,
	isSelected,
	isDuplicate,
	hasPrefixWarning,
	onSelect,
	onRemove,
}: {
	item: PackageTreeItem;
	isSelected: boolean;
	isDuplicate: boolean;
	hasPrefixWarning: boolean;
	onSelect: () => void;
	onRemove: () => void;
}) {
	return (
		<div
			className={cn(
				'btn-mystia-primary group border px-3 py-2',
				isSelected
					? isDuplicate
						? 'border-danger bg-danger/20 shadow-inner'
						: 'border-primary bg-primary/20 shadow-inner'
					: isDuplicate
						? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
						: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
			)}
		>
			<div className="flex w-full items-start justify-between gap-2">
				<button
					onClick={onSelect}
					className="flex min-w-0 flex-1 flex-col gap-1 text-left"
					title={item.pkg.name}
				>
					<div className="flex items-center gap-2">
						<span className="truncate text-sm font-bold text-foreground">
							{item.displayName}
						</span>
						{isDuplicate && (
							<span className="shrink-0 rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium">
								命名重复
							</span>
						)}
						{hasPrefixWarning && (
							<WarningBadge>前缀不规范</WarningBadge>
						)}
					</div>
					<div className="font-mono text-xs text-foreground opacity-80">
						{item.pkg.dialogList.length}条对话
					</div>
				</button>
				<button
					onClick={(e) => {
						e.stopPropagation();
						if (confirm('确定要删除这个对话包吗？')) {
							onRemove();
						}
					}}
					className="btn-mystia-danger pointer-events-none shrink-0 rounded-full px-2 py-0.5 text-xs opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
				>
					删除
				</button>
			</div>
		</div>
	);
}

function TreeGroup({
	node,
	parentPath,
	depth,
	expandedGroups,
	onToggleGroup,
	selectedIndex,
	isNameDuplicate,
	isNamePrefixInvalid,
	onSelect,
	onRemove,
}: {
	node: TreeNode;
	parentPath: string;
	depth: number;
	expandedGroups: Set<string>;
	onToggleGroup: (path: string) => void;
	selectedIndex: number | null;
	isNameDuplicate: (name: string, index: number) => boolean;
	isNamePrefixInvalid: (name: string) => boolean;
	onSelect: (index: number) => void;
	onRemove: (index: number) => void;
}) {
	const sortedChildren = Array.from(node.children.entries()).sort(
		([a], [b]) => a.localeCompare(b)
	);

	return (
		<div className="ml-3 flex flex-col gap-0.5 border-l border-black/10 pl-2 dark:border-white/10">
			{sortedChildren.map(([key, childNode]) => {
				const path = parentPath ? `${parentPath}/${key}` : key;
				const isExpanded = expandedGroups.has(path);
				const count = countTreeItems(childNode);

				return (
					<div key={key}>
						<GroupHeader
							label={key}
							count={count}
							expanded={isExpanded}
							onToggle={() => onToggleGroup(path)}
						/>
						{isExpanded && (
							<TreeGroup
								node={childNode}
								parentPath={path}
								depth={depth + 1}
								expandedGroups={expandedGroups}
								onToggleGroup={onToggleGroup}
								selectedIndex={selectedIndex}
								isNameDuplicate={isNameDuplicate}
								isNamePrefixInvalid={isNamePrefixInvalid}
								onSelect={onSelect}
								onRemove={onRemove}
							/>
						)}
					</div>
				);
			})}

			{node.items.map((item) => (
				<DialogTreeItem
					key={item.index}
					item={item}
					isSelected={selectedIndex === item.index}
					isDuplicate={isNameDuplicate(item.pkg.name, item.index)}
					hasPrefixWarning={isNamePrefixInvalid(item.pkg.name)}
					onSelect={() => onSelect(item.index)}
					onRemove={() => onRemove(item.index)}
				/>
			))}
		</div>
	);
}

// ─── Main component ──────────────────────────────────────

interface DialogPackageListProps {
	packages: DialogPackage[];
	selectedIndex: number | null;
	onSelect: (index: number) => void;
	onAdd: () => void;
	onRemove: (index: number) => void;
}

export const DialogPackageList = memo<DialogPackageListProps>(
	function DialogPackageList({
		packages,
		selectedIndex,
		onSelect,
		onAdd,
		onRemove,
	}) {
		const packLabelPrefix = usePackLabelPrefix();
		const hasPrefix = Boolean(packLabelPrefix && packLabelPrefix !== '_');

		const { conforming, nonConforming } = useMemo(
			() => buildDialogTree(packages, packLabelPrefix),
			[packages, packLabelPrefix]
		);

		// 追踪已知的分组路径，只对新增分组自动展开
		const knownPathsRef = useRef<Set<string>>(new Set());

		const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
			() => new Set([CONFORMING_KEY, OTHER_KEY])
		);

		// 仅对真正新出现的分组自动展开，已有折叠状态不受影响
		useEffect(() => {
			const currentPaths = new Set([
				CONFORMING_KEY,
				OTHER_KEY,
				...collectAllGroupPaths(conforming, ''),
			]);

			const newPaths: string[] = [];
			for (const path of currentPaths) {
				if (!knownPathsRef.current.has(path)) {
					newPaths.push(path);
				}
			}

			knownPathsRef.current = currentPaths;

			if (newPaths.length > 0) {
				setExpandedGroups((prev) => {
					const next = new Set(prev);
					for (const path of newPaths) {
						next.add(path);
					}
					return next;
				});
			}

			// 清理已不存在的分组路径，避免状态堆积
			setExpandedGroups((prev) => {
				let changed = false;
				const next = new Set<string>();
				for (const path of prev) {
					if (currentPaths.has(path)) {
						next.add(path);
					} else {
						changed = true;
					}
				}
				return changed ? next : prev;
			});
		}, [conforming]);

		// 选中条目时自动展开其所在分组
		useEffect(() => {
			if (selectedIndex === null) return;

			const paths = findItemGroupPaths(conforming, selectedIndex, '');
			if (paths && paths.length > 0) {
				setExpandedGroups((prev) => {
					const next = new Set(prev);
					next.add(CONFORMING_KEY);
					for (const path of paths) {
						next.add(path);
					}
					if (
						next.size !== prev.size ||
						[...next].some((p) => !prev.has(p))
					) {
						return next;
					}
					return prev;
				});
			} else if (
				nonConforming.some((item) => item.index === selectedIndex)
			) {
				setExpandedGroups((prev) => {
					if (prev.has(OTHER_KEY)) return prev;
					const next = new Set(prev);
					next.add(OTHER_KEY);
					return next;
				});
			}
		}, [selectedIndex, conforming, nonConforming]);

		const toggleGroup = useCallback((path: string) => {
			setExpandedGroups((prev) => {
				const next = new Set(prev);
				if (next.has(path)) {
					next.delete(path);
				} else {
					next.add(path);
				}
				return next;
			});
		}, []);

		const isNameDuplicate = useCallback(
			(name: string, index: number) => {
				return packages.some(
					(p, i) => i !== index && p.name === name && name.length > 0
				);
			},
			[packages]
		);

		const isNamePrefixInvalid = useCallback(
			(name: string) => {
				if (!packLabelPrefix || packLabelPrefix === '_') return false;
				return !name.startsWith(packLabelPrefix);
			},
			[packLabelPrefix]
		);

		const hasConforming =
			conforming.items.length > 0 || conforming.children.size > 0;
		const hasNonConforming = nonConforming.length > 0;

		return (
			<div className="flex h-min flex-col gap-4 overflow-y-auto rounded-lg bg-white/10 p-4 shadow-md backdrop-blur lg:sticky lg:top-24">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold">对话包列表</h2>
					<button
						onClick={onAdd}
						className="btn-mystia h-8 w-8 text-lg hover:bg-black/5 dark:hover:bg-white/5"
					>
						+
					</button>
				</div>

				<div className="flex flex-col gap-1">
					{hasPrefix ? (
						<>
							{/* 符合命名规范的分组树 */}
							{hasConforming && (
								<div>
									<GroupHeader
										label={packLabelPrefix}
										count={countTreeItems(conforming)}
										expanded={expandedGroups.has(
											CONFORMING_KEY
										)}
										onToggle={() =>
											toggleGroup(CONFORMING_KEY)
										}
										isTopLevel
									/>
									{expandedGroups.has(CONFORMING_KEY) && (
										<TreeGroup
											node={conforming}
											parentPath=""
											depth={0}
											expandedGroups={expandedGroups}
											onToggleGroup={toggleGroup}
											selectedIndex={selectedIndex}
											isNameDuplicate={isNameDuplicate}
											isNamePrefixInvalid={
												isNamePrefixInvalid
											}
											onSelect={onSelect}
											onRemove={onRemove}
										/>
									)}
								</div>
							)}

							{/* 不符合命名规范的条目 */}
							{hasNonConforming && (
								<div>
									{hasConforming && (
										<div className="my-1 border-t border-black/10 dark:border-white/10" />
									)}
									<GroupHeader
										label="其他"
										count={nonConforming.length}
										expanded={expandedGroups.has(OTHER_KEY)}
										onToggle={() => toggleGroup(OTHER_KEY)}
										isTopLevel
									/>
									{expandedGroups.has(OTHER_KEY) && (
										<div className="ml-3 flex flex-col gap-0.5 border-l border-black/10 pl-2 dark:border-white/10">
											{nonConforming.map((item) => (
												<DialogTreeItem
													key={item.index}
													item={item}
													isSelected={
														selectedIndex ===
														item.index
													}
													isDuplicate={isNameDuplicate(
														item.pkg.name,
														item.index
													)}
													hasPrefixWarning={isNamePrefixInvalid(
														item.pkg.name
													)}
													onSelect={() =>
														onSelect(item.index)
													}
													onRemove={() =>
														onRemove(item.index)
													}
												/>
											))}
										</div>
									)}
								</div>
							)}
						</>
					) : (
						/* 无前缀时保持扁平列表 */
						<div className="flex flex-col gap-2">
							{packages.map((pkg, index) => {
								const isDuplicate = isNameDuplicate(
									pkg.name,
									index
								);
								const hasPrefixWarning = isNamePrefixInvalid(
									pkg.name
								);
								return (
									<div
										key={index}
										className={cn(
											'btn-mystia-primary group border p-4',
											selectedIndex === index
												? isDuplicate
													? 'border-danger bg-danger/20 shadow-inner'
													: 'border-primary bg-primary/20 shadow-inner'
												: isDuplicate
													? 'border-danger/50 bg-danger/10 hover:bg-danger/20'
													: 'border-transparent bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10'
										)}
									>
										<div className="flex w-full items-start justify-between gap-2">
											<button
												onClick={() => onSelect(index)}
												className="flex flex-1 flex-col gap-2 text-left"
											>
												<div className="flex items-center gap-2">
													<span className="text-lg font-bold text-foreground">
														{pkg.name}
													</span>
													{isDuplicate && (
														<span className="rounded bg-danger px-1.5 py-0.5 text-[10px] font-medium">
															命名重复
														</span>
													)}{' '}
													{hasPrefixWarning && (
														<WarningBadge>
															前缀不规范
														</WarningBadge>
													)}{' '}
												</div>
												<div className="font-mono text-xs text-foreground opacity-80">
													{pkg.dialogList.length}
													条对话
												</div>
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													if (
														confirm(
															'确定要删除这个对话包吗？'
														)
													) {
														onRemove(index);
													}
												}}
												className="btn-mystia-danger pointer-events-none rounded-full px-3 py-1 text-sm opacity-0 group-hover:pointer-events-auto group-hover:opacity-100"
											>
												删除
											</button>
										</div>
									</div>
								);
							})}
						</div>
					)}

					{packages.length === 0 && (
						<EmptyState
							title="暂无对话包"
							description="点击上方 + 按钮创建"
						/>
					)}
				</div>
			</div>
		);
	}
);
