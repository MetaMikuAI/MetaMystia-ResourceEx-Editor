'use client';

import { useMemo, useRef, useEffect } from 'react';

import { useData } from '@/components/context/DataContext';
import { Header } from '@/components/common/Header';
import { cn } from '@/lib';
import { Label } from '@/components/common/Label';
import type { PackInfo } from '@/types/resource';

export default function InfoPage() {
	const { data, setData, setHasUnsavedChanges } = useData();
	const packInfo = data.packInfo || {};

	const isVersionValid = useMemo(() => {
		if (!packInfo.version) return true;
		const semVerRegex =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		return semVerRegex.test(packInfo.version);
	}, [packInfo.version]);

	// Auto-resize license textarea
	const licenseRef = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		if (licenseRef.current) {
			licenseRef.current.style.height = 'auto';
			licenseRef.current.style.height = `${licenseRef.current.scrollHeight}px`;
		}
	}, [packInfo.license]);

	// Handlers
	const updatePackInfo = (updates: Partial<PackInfo>) => {
		const newPackInfo = { ...packInfo, ...updates };
		setData({ ...data, packInfo: newPackInfo });
		setHasUnsavedChanges(true);
	};

	const addAuthor = () => {
		const newAuthors = [...(packInfo.authors || []), ''];
		updatePackInfo({ authors: newAuthors });
	};

	const updateAuthor = (index: number, val: string) => {
		const newAuthors = [...(packInfo.authors || [])];
		newAuthors[index] = val;
		updatePackInfo({ authors: newAuthors });
	};

	const removeAuthor = (index: number) => {
		const newAuthors = [...(packInfo.authors || [])];
		newAuthors.splice(index, 1);
		updatePackInfo({ authors: newAuthors });
	};

	return (
		<main className="flex min-h-screen flex-col">
			<Header />
			<div className="container mx-auto w-full max-w-4xl px-6 py-8">
				<div className="flex flex-col gap-6 rounded-lg bg-white/10 p-6 shadow-md backdrop-blur">
					<div className="flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
						<h2 className="text-2xl font-bold">
							资源包基础信息 (Pack Info)
						</h2>
					</div>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
						{/* Name */}
						<div className="flex flex-col gap-1">
							<Label>资源包名称 (Name)</Label>
							<input
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={packInfo.name || ''}
								onChange={(e) =>
									updatePackInfo({ name: e.target.value })
								}
								placeholder="例如: MetaMystia 示例资源包"
							/>
						</div>

						{/* Label */}
						<div className="flex flex-col gap-1">
							<Label>资源包唯一标识符 (Label)</Label>
							<input
								className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
								value={packInfo.label || ''}
								onChange={(e) =>
									updatePackInfo({ label: e.target.value })
								}
								placeholder="例如: ResourceEx"
							/>
						</div>
					</div>

					{/* Version */}
					<div className="flex flex-col gap-1">
						<div className="flex items-center justify-between">
							<Label>版本 (Version)</Label>
							{!isVersionValid && (
								<span className="text-[10px] text-danger">
									版本格式不符合语义化版本规范 (例如: 1.0.0)
								</span>
							)}
						</div>
						<input
							className={cn(
								'h-9 w-full rounded-lg border bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10',
								isVersionValid
									? 'border-black/10 dark:border-white/10'
									: 'border-danger focus:border-danger focus:ring-danger/20'
							)}
							value={packInfo.version || ''}
							onChange={(e) =>
								updatePackInfo({ version: e.target.value })
							}
							placeholder="例如: 1.0.0"
						/>
					</div>

					{/* Authors */}
					<div className="flex flex-col gap-2">
						<div className="flex items-center justify-between">
							<Label>作者列表 (Authors)</Label>
							<button
								onClick={addAuthor}
								className="btn-mystia h-6 px-2 text-xs"
							>
								+ 添加
							</button>
						</div>
						<div className="flex flex-col gap-2">
							{(packInfo.authors || []).map((author, index) => (
								<div key={index} className="flex gap-2">
									<input
										className="h-9 w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
										value={author}
										onChange={(e) =>
											updateAuthor(index, e.target.value)
										}
										placeholder="Author Name"
									/>
									<button
										onClick={() => removeAuthor(index)}
										className="btn-mystia text-xs text-danger hover:bg-danger/10"
									>
										删除
									</button>
								</div>
							))}
							{(packInfo.authors || []).length === 0 && (
								<div className="rounded border border-dashed border-black/10 p-4 text-center text-xs opacity-40 dark:border-white/10">
									暂无作者
								</div>
							)}
						</div>
					</div>

					{/* Description */}
					<div className="flex flex-col gap-1">
						<Label>描述 (Description)</Label>
						<textarea
							className="min-h-[120px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
							value={packInfo.description || ''}
							onChange={(e) =>
								updatePackInfo({ description: e.target.value })
							}
							placeholder="资源包的详细描述..."
						/>
					</div>

					{/* License */}
					<div className="flex flex-col gap-1">
						<Label>许可证 (License)</Label>
						<textarea
							ref={licenseRef}
							className="min-h-[120px] w-full rounded-lg border border-black/10 bg-white/40 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/30 dark:focus:ring-white/10"
							value={packInfo.license || ''}
							onChange={(e) =>
								updatePackInfo({ license: e.target.value })
							}
							placeholder="在此处粘贴许可证文本..."
						/>
					</div>
				</div>
			</div>
		</main>
	);
}
