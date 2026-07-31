'use client';

import { cn } from '@heroui/theme';
import { useCallback, useEffect, useState } from 'react';

import { useResourceEditor } from '@/features/resourceEditor/client/state/useResourceEditor';

import { readImageDimensions } from '@/infrastructure/browser/images/readImageDimensions';

interface IProps {
	spritePath: string;
	onUpload: (file: File) => void;
	width?: number;
	height?: number;
	className?: string;
}

export function PortraitUploader({
	className,
	height = 359,
	onUpload,
	spritePath,
	width = 256,
}: IProps) {
	const { getAssetUrl } = useResourceEditor();
	const [warning, setWarning] = useState('');
	const assetUrl = getAssetUrl(spritePath);

	const handleFile = useCallback(
		(file: File | undefined) => {
			if (!file) return;
			void readImageDimensions(file)
				.then((dimensions) => {
					setWarning(
						dimensions.width === width &&
							dimensions.height === height
							? ''
							: `尺寸警告: ${dimensions.width}x${dimensions.height} (期望 ${width}x${height})`
					);
				})
				.catch(() => setWarning('无法读取图片尺寸'));
			onUpload(file);
		},
		[height, onUpload, width]
	);

	useEffect(() => setWarning(''), [spritePath]);

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<div className="flex items-center justify-between">
				<label className="ml-1 text-[10px] font-bold opacity-50">
					预览 (点击/拖拽上传)
				</label>
				{warning && (
					<span className="text-xs text-warning" role="status">
						{warning}
					</span>
				)}
			</div>
			<input
				type="file"
				accept="image/png"
				className="hidden"
				id={`upload-portrait-${spritePath}`}
				onChange={(event) => {
					handleFile(event.target.files?.[0]);
					event.target.value = '';
				}}
			/>
			<label
				htmlFor={`upload-portrait-${spritePath}`}
				className={cn(
					'bg-checkerboard flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all hover:border-primary/50 hover:opacity-90',
					warning ? 'border-warning/50' : 'border-divider'
				)}
				style={{ height: `${height}px`, width: `${width}px` }}
				onDragOver={(event) => event.preventDefault()}
				onDrop={(event) => {
					event.preventDefault();
					const file = event.dataTransfer.files?.[0];
					if (file?.type === 'image/png') handleFile(file);
				}}
			>
				{assetUrl ? (
					<img
						src={assetUrl}
						className="image-rendering-pixelated h-full w-full object-contain"
						alt="立绘预览"
					/>
				) : (
					<div className="flex flex-col items-center gap-2 text-foreground/30">
						<span className="text-2xl">📷</span>
						<span className="text-[10px]">
							{width} x {height}
						</span>
					</div>
				)}
			</label>
		</div>
	);
}
