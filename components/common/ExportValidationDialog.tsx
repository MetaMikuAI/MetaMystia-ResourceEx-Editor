'use client';

import { memo, useMemo, useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib';
import type { ValidationIssue } from './validateResourcePack';

interface ExportValidationDialogProps {
	issues: ValidationIssue[];
	onConfirm: () => void;
	onCancel: () => void;
}

export const ExportValidationDialog = memo<ExportValidationDialogProps>(
	function ExportValidationDialog({ issues, onConfirm, onCancel }) {
		const [filter, setFilter] = useState<'all' | 'error' | 'warning'>(
			'all'
		);

		const errors = useMemo(
			() => issues.filter((i) => i.severity === 'error'),
			[issues]
		);
		const warnings = useMemo(
			() => issues.filter((i) => i.severity === 'warning'),
			[issues]
		);

		// Group by category
		const groupedErrors = useMemo(() => groupByCategory(errors), [errors]);
		const groupedWarnings = useMemo(
			() => groupByCategory(warnings),
			[warnings]
		);

		const showErrors = filter === 'all' || filter === 'error';
		const showWarnings = filter === 'all' || filter === 'warning';

		const handleBackdropClick = useCallback(
			(e: React.MouseEvent) => {
				if (e.target === e.currentTarget) onCancel();
			},
			[onCancel]
		);

		const dialog = (
			<div
				className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm"
				onClick={handleBackdropClick}
			>
				<div className="animate-in fade-in slide-in-from-bottom-4 mx-4 flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 rounded-2xl border border-white/10 bg-white p-6 shadow-2xl duration-200 dark:bg-gray-900">
					{/* Header */}
					<div className="flex items-center gap-3">
						<span className="text-2xl">
							{errors.length > 0 ? '⚠️' : '📋'}
						</span>
						<div>
							<h2 className="text-xl font-bold">
								资源包导出检查
							</h2>
							<p className="text-sm opacity-60">
								{errors.length > 0
									? '存在以下问题，建议修正后再导出'
									: '存在部分建议项，可确认后继续导出'}
							</p>
						</div>
					</div>

					{/* Issue count filter badges */}
					<div className="flex gap-3">
						{errors.length > 0 && (
							<button
								onClick={() =>
									setFilter((f) =>
										f === 'error' ? 'all' : 'error'
									)
								}
								className={cn(
									'rounded-full px-3 py-1 text-sm font-medium transition-colors',
									filter === 'error'
										? 'bg-danger text-white'
										: 'bg-danger/10 text-danger hover:bg-danger/20'
								)}
							>
								{errors.length} 个错误
							</button>
						)}
						{warnings.length > 0 && (
							<button
								onClick={() =>
									setFilter((f) =>
										f === 'warning' ? 'all' : 'warning'
									)
								}
								className={cn(
									'rounded-full px-3 py-1 text-sm font-medium transition-colors',
									filter === 'warning'
										? 'bg-yellow-500 text-white'
										: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400'
								)}
							>
								{warnings.length} 个警告
							</button>
						)}
					</div>

					{/* Scrollable issue list */}
					<div className="flex flex-col gap-4 overflow-y-auto pr-1">
						{/* Errors */}
						{showErrors &&
							Object.entries(groupedErrors).map(
								([category, items]) => (
									<IssueGroup
										key={`err-${category}`}
										category={category}
										items={items}
										severity="error"
									/>
								)
							)}

						{/* Warnings */}
						{showWarnings &&
							Object.entries(groupedWarnings).map(
								([category, items]) => (
									<IssueGroup
										key={`warn-${category}`}
										category={category}
										items={items}
										severity="warning"
									/>
								)
							)}
					</div>

					{/* Actions */}
					<div className="flex items-center justify-end gap-3 border-t border-black/10 pt-4 dark:border-white/10">
						<button
							onClick={onCancel}
							className="btn-mystia rounded-lg px-4 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
						>
							返回修改
						</button>
						<button
							onClick={onConfirm}
							className={cn(
								'rounded-lg px-4 py-2 text-sm font-medium text-white',
								errors.length > 0
									? 'bg-danger hover:bg-danger/80'
									: 'bg-primary hover:bg-primary/80'
							)}
						>
							{errors.length > 0
								? '忽略问题，仍然导出'
								: '确认导出'}
						</button>
					</div>
				</div>
			</div>
		);

		return createPortal(dialog, document.body);
	}
);

function IssueGroup({
	category,
	items,
	severity,
}: {
	category: string;
	items: ValidationIssue[];
	severity: 'error' | 'warning';
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<span
					className={cn(
						'h-2 w-2 rounded-full',
						severity === 'error' ? 'bg-danger' : 'bg-yellow-500'
					)}
				/>
				<span className="text-sm font-semibold">{category}</span>
				<span className="text-xs opacity-40">({items.length})</span>
			</div>
			<div className="ml-4 flex flex-col gap-0.5">
				{items.map((item, i) => (
					<p
						key={i}
						className={cn(
							'text-sm',
							severity === 'error'
								? 'text-danger'
								: 'text-yellow-600 dark:text-yellow-400'
						)}
					>
						• {item.message}
					</p>
				))}
			</div>
		</div>
	);
}

function groupByCategory(
	items: ValidationIssue[]
): Record<string, ValidationIssue[]> {
	const groups: Record<string, ValidationIssue[]> = {};
	for (const item of items) {
		if (!groups[item.category]) groups[item.category] = [];
		groups[item.category]!.push(item);
	}
	return groups;
}
