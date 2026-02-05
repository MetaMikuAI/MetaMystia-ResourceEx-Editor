import { memo, useCallback, useState } from 'react';
import { cn } from '@/lib';

interface SpriteUploaderProps {
	spriteUrl: string | null;
	spritePath: string;
	recommendedSize?: { width: number; height: number };
	onUpload: (blob: Blob) => void;
	className?: string;
}

export const SpriteUploader = memo<SpriteUploaderProps>(
	function SpriteUploader({
		spriteUrl,
		spritePath,
		recommendedSize = { width: 26, height: 26 },
		onUpload,
		className,
	}) {
		const [isDragging, setIsDragging] = useState(false);

		const processFile = useCallback(
			async (file: File) => {
				const img = new Image();
				const url = URL.createObjectURL(file);
				img.src = url;

				await new Promise<void>((resolve, reject) => {
					img.onload = () => {
						if (
							img.width !== recommendedSize.width ||
							img.height !== recommendedSize.height
						) {
							const proceed = confirm(
								`当前图片尺寸为 ${img.width}x${img.height}，建议尺寸为 ${recommendedSize.width}x${recommendedSize.height} 像素。\n\n是否继续上传？`
							);
							if (!proceed) {
								URL.revokeObjectURL(url);
								reject(new Error('Cancelled'));
								return;
							}
						}
						resolve();
					};
					img.onerror = () => resolve();
				});

				URL.revokeObjectURL(url);

				const blob = new Blob([await file.arrayBuffer()], {
					type: file.type,
				});
				onUpload(blob);
			},
			[recommendedSize, onUpload]
		);

		const handleSpriteUpload = useCallback(
			async (e: React.ChangeEvent<HTMLInputElement>) => {
				const file = e.target.files?.[0];
				if (!file) return;
				try {
					await processFile(file);
				} catch {}
				e.target.value = '';
			},
			[processFile]
		);

		const handleDrop = useCallback(
			async (e: React.DragEvent) => {
				e.preventDefault();
				e.stopPropagation();
				setIsDragging(false);

				const file = e.dataTransfer.files?.[0];
				if (file && file.type.startsWith('image/')) {
					try {
						await processFile(file);
					} catch {}
				}
			},
			[processFile]
		);

		const handleDragOver = useCallback((e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(true);
		}, []);

		const handleDragLeave = useCallback((e: React.DragEvent) => {
			e.preventDefault();
			e.stopPropagation();
			setIsDragging(false);
		}, []);

		return (
			<div className={cn('flex flex-col gap-4 md:flex-row', className)}>
				{/* 预览/上传区 */}
				<label
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					className={cn(
						'bg-checkerboard group relative flex h-32 w-32 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all',
						isDragging
							? 'border-primary bg-primary/10'
							: spriteUrl
								? 'border-primary/30 hover:border-primary/50'
								: 'border-black/10 hover:border-black/30 dark:border-white/10 dark:hover:border-white/30'
					)}
				>
					{spriteUrl ? (
						<>
							<img
								src={spriteUrl}
								alt="贴图预览"
								className="image-rendering-pixelated h-16 w-16 object-contain"
								draggable="false"
							/>
							<div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
								<span className="text-xs font-medium text-white">
									点击更换
								</span>
							</div>
						</>
					) : (
						<div className="flex flex-col items-center gap-2 text-black/40 dark:text-white/40">
							<span className="text-2xl">🖼️</span>
							<span className="text-xs font-medium">
								点击设置贴图
							</span>
						</div>
					)}
					<input
						type="file"
						accept="image/*"
						onChange={handleSpriteUpload}
						className="hidden"
					/>
				</label>
				<div className="flex flex-col justify-end gap-1 pb-1">
					<p className="text-xs font-medium opacity-60">
						贴图建议尺寸: {recommendedSize.width} ×{' '}
						{recommendedSize.height} 像素
					</p>
					<p className="text-[10px] opacity-40">
						资源路径: {spritePath}
					</p>
				</div>
			</div>
		);
	}
);
