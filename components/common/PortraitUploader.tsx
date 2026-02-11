import { useState, useEffect } from 'react';
import { cn } from '@/lib';
import { useData } from '@/components/context/DataContext';

interface PortraitUploaderProps {
	spritePath: string;
	onUpload: (file: File) => void;
	width?: number;
	height?: number;
	className?: string;
}

export function PortraitUploader({
	spritePath,
	onUpload,
	width = 256,
	height = 359,
	className,
}: PortraitUploaderProps) {
	const { getAssetUrl } = useData();
	const [warning, setWarning] = useState<string>('');

	const checkImageSize = (file: File) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			if (img.width !== width || img.height !== height) {
				setWarning(
					`尺寸警告: ${img.width}x${img.height} (期望 ${width}x${height})`
				);
			} else {
				setWarning('');
			}
			URL.revokeObjectURL(img.src);
		};
	};

	const handleFileChange = (file: File | undefined) => {
		if (file) {
			checkImageSize(file);
			onUpload(file);
		}
	};

	useEffect(() => {
		// Clear warning when sprite path changes
		setWarning('');
	}, [spritePath]);

	return (
		<div className={cn('flex flex-col gap-1', className)}>
			<div className="flex items-center justify-between">
				<label className="ml-1 text-[10px] font-bold opacity-50">
					预览 (点击/拖拽上传)
				</label>
				{warning && (
					<span
						className="text-[16px] text-yellow-400"
						title={warning}
					>
						⚠️ 尺寸不符
					</span>
				)}
			</div>
			<div className="relative">
				<input
					type="file"
					accept="image/png"
					className="hidden"
					id={`upload-portrait-${spritePath}`}
					onChange={(e) => {
						handleFileChange(e.target.files?.[0]);
						// Reset value to allow same file upload
						e.target.value = '';
					}}
				/>
				<label
					htmlFor={`upload-portrait-${spritePath}`}
					className={cn(
						'bg-checkerboard flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all hover:border-primary/50 hover:opacity-90',
						warning ? 'border-yellow-500/50' : 'border-white/10'
					)}
					style={{ width: `${width}px`, height: `${height}px` }}
					onDragOver={(e) => e.preventDefault()}
					onDrop={(e) => {
						e.preventDefault();
						const file = e.dataTransfer.files?.[0];
						if (file && file.type === 'image/png') {
							handleFileChange(file);
						}
					}}
				>
					{getAssetUrl(spritePath) ? (
						<img
							src={getAssetUrl(spritePath)}
							className="image-rendering-pixelated h-full w-full object-contain"
							alt="Preview"
						/>
					) : (
						<div className="flex flex-col items-center gap-2 text-black/30">
							<span className="text-2xl">📷</span>
							<span className="text-[10px]">
								{width} x {height}
							</span>
						</div>
					)}
				</label>
			</div>
		</div>
	);
}
