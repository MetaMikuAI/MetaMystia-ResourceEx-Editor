import { memo, useCallback, useState } from 'react';

import { Label } from '@/features/resourceEditor/client/components/fields/Label';
import { WarningNotice } from '@/features/resourceEditor/client/components/status/WarningNotice';
import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { readImageDimensions } from '@/infrastructure/browser/images/readImageDimensions';

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
	const { getAssetUrl } = useResourceEditor();
	const [uploadError, setUploadError] = useState<string | null>(null);

	const handleUpload = useCallback(
		async (index: number, file: File) => {
			let dimensions;
			try {
				dimensions = await readImageDimensions(file);
			} catch {
				setUploadError('无法读取衣服小人贴图尺寸。');
				return;
			}
			if (dimensions.width !== 64 || dimensions.height !== 64) {
				setUploadError(
					`错误：衣服小人贴图尺寸必须为64×64，当前为${dimensions.width}×${dimensions.height}。`
				);
				return;
			}
			setUploadError(null);

			const row = Math.floor(index / cols);
			const col = index % cols;
			const filename = `${prefix}_${row}, ${col}.png`;
			const path = `${basePath}/${filename}`;
			onUpload(index, path, file);
		},
		[cols, prefix, basePath, onUpload]
	);

	return (
		<div className="flex flex-col gap-4">
			<Label tip={tip} wrapperClassName="ml-1">
				{label}
			</Label>
			{uploadError !== null && (
				<WarningNotice>{uploadError}</WarningNotice>
			)}
			<div
				className="grid gap-3"
				style={{
					gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
				}}
			>
				{paths.map((path, i) => (
					<div
						key={i}
						className="group relative flex flex-col gap-2 rounded-large border border-divider bg-content1/50 p-2 transition-colors hover:bg-default/30"
					>
						<label
							className="bg-checkerboard relative aspect-square cursor-pointer overflow-hidden rounded-medium border border-divider transition-colors hover:border-primary/50"
							onDragOver={(e) => e.preventDefault()}
							onDrop={(e) => {
								e.preventDefault();
								const file = e.dataTransfer.files?.[0];
								if (file && file.type === 'image/png') {
									handleUpload(i, file);
								}
							}}
						>
							<span className="absolute left-1 top-1 z-10 rounded-small bg-content1/80 px-1 text-[10px] text-foreground-700">
								{i}
							</span>
							{getAssetUrl(path) ? (
								<img
									src={getAssetUrl(path)}
									className="image-rendering-pixelated h-full w-full object-contain"
									alt=""
								/>
							) : (
								<div className="flex h-full w-full flex-col items-center justify-center text-foreground-500">
									<span className="text-xs">上传</span>
								</div>
							)}
							<div className="absolute inset-0 flex items-center justify-center bg-background/75 opacity-0 transition-opacity group-hover:opacity-100">
								<span className="text-xs font-semibold text-foreground">
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
						<p className="truncate text-center text-[10px] text-foreground-600">
							{path.split('/').pop()}
						</p>
					</div>
				))}
			</div>
		</div>
	);
});
