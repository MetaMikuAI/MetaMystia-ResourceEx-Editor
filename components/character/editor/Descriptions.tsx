import { memo } from 'react';
import { Label } from '@/components/common/Label';

interface DescriptionsProps {
	descriptions: string[];
	onUpdate: (index: number, value: string) => void;
}

export const Descriptions = memo<DescriptionsProps>(function Descriptions({
	descriptions,
	onUpdate,
}) {
	return (
		<div className="flex flex-col gap-3">
			<Label tip="稀客羁绊分别提升至 LV1, LV3, LV5 时出现在小碎骨的笔记本图鉴">
				角色图鉴描述
			</Label>
			{descriptions.map((desc, i) => (
				<div key={i} className="relative">
					<span className="absolute -left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
						lv {2 * i + 1}
					</span>
					<textarea
						placeholder={`请输入第${i + 1}条描述...`}
						value={desc}
						onChange={(e) => {
							onUpdate(i, e.target.value);
						}}
						className="min-h-20 w-full resize-none rounded-lg border border-black/10 bg-white/40 py-2 pl-5 pr-3 text-sm text-foreground outline-none transition-all focus:border-black/30 focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/10 dark:focus:border-white/10 dark:focus:ring-white/10"
					/>
				</div>
			))}
		</div>
	);
});
