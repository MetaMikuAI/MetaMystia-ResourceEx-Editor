import { memo, useCallback } from 'react';

import { useData } from '@/components/context/DataContext';
import { InfoTip } from '@/components/common/InfoTip';

interface SpriteGridProps {
	label: string;
	tip: string;
	cols: number;
	prefix: string;
	paths: string[];
	basePath: string;
	onUpload: (index: number, path: string, file: File) => void;
}

export const SpriteGrid = memo<SpriteGridProps>(function SpriteGrid({
	label,
	tip,
	cols,
	prefix,
	paths,
	basePath,
	onUpload,
}) {
	const { getAssetUrl } = useData();

	const handleUpload = useCallback(
		(index: number, file: File) => {
			const img = new Image();
			img.src = URL.createObjectURL(file);
			img.onload = () => {
				URL.revokeObjectURL(img.src);
				if (img.width !== 64 || img.height !== 64) {
					alert(
						`错误: Sprite 贴图尺寸必须为 64x64，当前为 ${img.width}x${img.height}`
					);
					return;
				}

				const row = Math.floor(index / cols);
				const col = index % cols;
				const filename = `${prefix}_${row}, ${col}.png`;
				const path = `${basePath}/${filename}`;
				onUpload(index, path, file);
			};
		},
		[cols, prefix, basePath, onUpload]
	);

	return (
		<div className="flex flex-col gap-4">
			<label className="ml-1 text-sm font-bold opacity-70">
				{label}
				<InfoTip>{tip}</InfoTip>
			</label>
			<div
				className="grid gap-3"
				style={{
					gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				}}
			>
				{paths.map((path, i) => (
					<div
						key={i}
						className="group relative flex flex-col gap-2 rounded-lg border border-white/5 bg-black/10 p-2 transition-colors hover:bg-black/20"
					>
						<label
							className="bg-checkerboard relative aspect-square cursor-pointer overflow-hidden rounded border border-white/10 hover:border-primary/50"
							onDragOver={(e) => e.preventDefault()}
							onDrop={(e) => {
								e.preventDefault();
								const file = e.dataTransfer.files?.[0];
								if (file && file.type === 'image/png') {
									handleUpload(i, file);
								}
							}}
						>
							<span className="absolute left-1 top-1 z-10 rounded bg-black/50 px-1 text-[10px] text-white">
								{i}
							</span>
							{getAssetUrl(path) ? (
								<img
									src={getAssetUrl(path)}
									className="image-rendering-pixelated h-full w-full object-contain"
									alt=""
								/>
							) : (
								<div className="flex h-full w-full flex-col items-center justify-center text-black/30">
									<span className="text-xs">上传</span>
								</div>
							)}
							<div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
								<span className="text-xs font-bold text-white">
									更换
								</span>
							</div>
							<input
								type="file"
								accept="image/png"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleUpload(i, file);
								}}
							/>
						</label>
						<p className="truncate text-center text-[10px] text-black">
							{path.split('/').pop()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
});
