import { memo, useId } from 'react';

import Input from '@/design/ui/components/input';

import type { Character } from '@/domain/resourcePack/contracts/character';

import { Label } from '@/features/resourceEditor/client/components/fields/Label';
import { EditorSection } from '@/features/resourceEditor/client/components/layout/EditorSection';
import { ErrorBadge } from '@/features/resourceEditor/client/components/status/ErrorBadge';
import { WarningBadge } from '@/features/resourceEditor/client/components/status/WarningBadge';
import { IdRangeBadge } from '@/features/resourceEditor/client/editors/info/IdRangeBadge';
import { useLabelPrefixValidation } from '@/features/resourceEditor/client/hooks/useLabelPrefixValidation';

interface BasicInfoProps {
	character: Character;
	isIdDuplicate: boolean;
	onUpdate: (updates: Partial<Character>) => void;
}

export const BasicInfo = memo<BasicInfoProps>(function BasicInfo({
	character,
	isIdDuplicate,
	onUpdate,
}) {
	const idId = useId();
	const idLabel = useId();
	const idName = useId();
	const idType = useId();

	const isIdTooSmall = character.id < 9000;
	const isLabelInvalid = !character.label.startsWith('_');
	const {
		isValid: isLabelPrefixValid,
		prefix: expectedPrefix,
		hasPackLabel,
	} = useLabelPrefixValidation(character.label);
	const showPrefixWarning =
		hasPackLabel && !isLabelPrefixValid && !isLabelInvalid;

	return (
		<EditorSection title="基本信息">
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between">
						<Label
							htmlFor={idId}
							tip={
								'必须保证全局唯一\n0～5999为游戏原有稀客，6000～8999为游戏保留段，9000～11999为MetaMystia使用段，其他资源包请使用12000及以上的ID\n全局：游戏以及全部资源包'
							}
						>
							角色ID
						</Label>
						<div className="flex gap-2">
							{isIdDuplicate && <ErrorBadge>ID重复</ErrorBadge>}
							{isIdTooSmall && (
								<ErrorBadge>ID需&ge;9000</ErrorBadge>
							)}
							<IdRangeBadge id={character.id} />
						</div>
					</div>
					<Input
						id={idId}
						type="number"
						value={String(character.id)}
						onChange={(e) => {
							onUpdate({ id: parseInt(e.target.value) || 0 });
						}}
						isInvalid={isIdDuplicate || isIdTooSmall}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<Label htmlFor={idType} tip="角色类型，固定为Special">
						角色类型（固定）
					</Label>
					<Input
						isDisabled
						id={idType}
						type="text"
						value="Special（稀客）"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<Label htmlFor={idName} tip="角色名称，例如：大妖精">
						角色名称
					</Label>
					<Input
						id={idName}
						type="text"
						value={character.name}
						onChange={(e) => {
							onUpdate({ name: e.target.value });
						}}
					/>
				</div>
				<div className="flex flex-col gap-1">
					<div className="flex items-center justify-between">
						<Label
							htmlFor={idLabel}
							tip={
								'必须保证全局唯一\n必须以下划线_开头\n建议以_{资源包label}_开头，例如：_MyPack_Daiyousei\n全局：游戏以及全部资源包'
							}
						>
							标签（Label）
						</Label>
						<div className="flex gap-2">
							{isLabelInvalid && (
								<ErrorBadge>必须以_开头</ErrorBadge>
							)}
							{showPrefixWarning && (
								<WarningBadge>
									建议以{expectedPrefix}开头
								</WarningBadge>
							)}
						</div>
					</div>
					<Input
						id={idLabel}
						type="text"
						value={character.label}
						onChange={(e) => {
							onUpdate({ label: e.target.value });
						}}
						isInvalid={isLabelInvalid}
					/>
				</div>
			</div>
		</EditorSection>
	);
});
