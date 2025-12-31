interface DescriptionsProps {
	descriptions: string[];
	onUpdate: (index: number, value: string) => void;
}

export function Descriptions({ descriptions, onUpdate }: DescriptionsProps) {
	return (
		<div className="flex flex-col gap-4">
			<label className="ml-1 text-sm font-bold opacity-70">
				角色图鉴描述
			</label>
			{descriptions.map((desc, i) => (
				<div key={i} className="relative">
					<span className="absolute -left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
						{i + 1}
					</span>
					<textarea
						value={desc}
						onChange={(e) => onUpdate(i, e.target.value)}
						placeholder={`请输入第 ${i + 1} 条描述...`}
						className="textarea-mystia"
					/>
				</div>
			))}
		</div>
	);
}
