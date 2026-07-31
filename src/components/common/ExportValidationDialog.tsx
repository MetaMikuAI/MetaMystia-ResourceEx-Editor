'use client';

import { cn } from '@heroui/theme';
import { memo, useMemo, useState } from 'react';

import Button from '@/design/ui/components/button';
import Modal from '@/design/ui/components/modal';

import { type IResourcePackValidationIssue } from '@/domain/resourcePack/validation';

interface ExportValidationDialogProps {
	issues: IResourcePackValidationIssue[];
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

		const groupedErrors = useMemo(() => groupByCategory(errors), [errors]);
		const groupedWarnings = useMemo(
			() => groupByCategory(warnings),
			[warnings]
		);

		const showErrors = filter === 'all' || filter === 'error';
		const showWarnings = filter === 'all' || filter === 'warning';

		return (
			<Modal
				isOpen
				onClose={onCancel}
				size="2xl"
				classNames={{ content: 'gap-4' }}
			>
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3">
						<span className="text-2xl">
							{errors.length > 0 ? '⚠️' : '📋'}
						</span>
						<div>
							<h2 className="text-xl font-bold">
								资源包导出检查
							</h2>
							<p className="text-sm text-foreground/60">
								{errors.length > 0
									? '存在以下问题，建议修正后再导出'
									: '存在部分建议项，可确认后继续导出'}
							</p>
						</div>
					</div>

					<div className="flex gap-3">
						{errors.length > 0 && (
							<Button
								size="sm"
								color={
									filter === 'error' ? 'danger' : 'default'
								}
								variant={filter === 'error' ? 'solid' : 'flat'}
								onPress={() =>
									setFilter((f) =>
										f === 'error' ? 'all' : 'error'
									)
								}
							>
								{errors.length} 个错误
							</Button>
						)}
						{warnings.length > 0 && (
							<Button
								size="sm"
								color={
									filter === 'warning' ? 'warning' : 'default'
								}
								variant={
									filter === 'warning' ? 'solid' : 'flat'
								}
								onPress={() =>
									setFilter((f) =>
										f === 'warning' ? 'all' : 'warning'
									)
								}
							>
								{warnings.length} 个警告
							</Button>
						)}
					</div>

					<div className="flex flex-col gap-4 overflow-y-auto pr-1">
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

					<div className="flex items-center justify-end gap-3 border-t border-divider pt-4">
						<Button variant="light" onPress={onCancel}>
							返回修改
						</Button>
						<Button
							color={errors.length > 0 ? 'danger' : 'primary'}
							onPress={onConfirm}
						>
							{errors.length > 0
								? '忽略问题，仍然导出'
								: '确认导出'}
						</Button>
					</div>
				</div>
			</Modal>
		);
	}
);

function IssueGroup({
	category,
	items,
	severity,
}: {
	category: string;
	items: IResourcePackValidationIssue[];
	severity: 'error' | 'warning';
}) {
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-2">
				<span
					className={cn(
						'h-2 w-2 rounded-full',
						severity === 'error' ? 'bg-danger' : 'bg-warning'
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
								: 'text-warning-600 dark:text-warning-400'
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
	items: IResourcePackValidationIssue[]
): Record<string, IResourcePackValidationIssue[]> {
	const groups: Record<string, IResourcePackValidationIssue[]> = {};
	for (const item of items) {
		if (!groups[item.category]) groups[item.category] = [];
		groups[item.category]!.push(item);
	}
	return groups;
}
