import { collectResourcePackAssetReferences } from './assetReferences';
import { isImageAssetPath } from './assetTypes';
import {
	GAME_ID_MAX,
	isValidPackLabel,
	KNOWN_DEPENDENCIES,
	PACK_LABEL_ALLOWED_DESCRIPTION,
	UNMANAGED_ID_MAX,
	UNMANAGED_ID_MIN,
} from './constants';
import type { ResourceEx } from './contracts/resourceEx';

export type IssueSeverity = 'error' | 'warning';

export interface IResourcePackValidationIssue {
	severity: IssueSeverity;
	category: string;
	message: string;
}

export interface IValidateResourcePackRulesOptions {
	availableAssetPaths?: ReadonlySet<string>;
	isIdSignatureValid?: boolean;
}

/**
 * 对整个资源包进行全面验证，返回所有问题列表。
 * 只执行同步领域规则；签名验证结果由 feature orchestration 预先计算。
 *
 * @param data 待校验的资源包数据。
 * @param options 可选资产路径集合与预先计算的签名有效性。
 */
export function validateResourcePackRules(
	data: ResourceEx,
	options: IValidateResourcePackRulesOptions = {}
): IResourcePackValidationIssue[] {
	const issues: IResourcePackValidationIssue[] = [];
	const assetSet = options.availableAssetPaths ?? null;
	const checkedAssetReferences = new Set<string>();
	const packLabel = data.packInfo.label;
	const prefix = packLabel ? `_${packLabel}_` : '';

	// ── Pack Info ──────────────────────────────────────────
	if (!packLabel) {
		issues.push({
			severity: 'warning',
			category: '基础信息',
			message: '资源包标识符（Label）未设置',
		});
	} else if (
		KNOWN_DEPENDENCIES.some((dependency) => dependency === packLabel)
	) {
		issues.push({
			severity: 'error',
			category: '基础信息',
			message: `资源包标识符（Label）不能使用保留关键字“${packLabel}”`,
		});
	} else if (!isValidPackLabel(packLabel)) {
		issues.push({
			severity: 'error',
			category: '基础信息',
			message: `资源包标识符（Label）“${packLabel}”含非法字符。${PACK_LABEL_ALLOWED_DESCRIPTION}。`,
		});
	}

	const version = data.packInfo.version;
	if (version) {
		const semVerRegex =
			/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
		if (!semVerRegex.test(version)) {
			issues.push({
				severity: 'warning',
				category: '基础信息',
				message: `版本号“${version}”不符合语义化版本规范（SemVer）`,
			});
		}
	}

	// ── ID Signature ──────────────────────────────────────
	const { idRangeStart, idRangeEnd, idSignature } = data.packInfo;
	const hasIdRange = idRangeStart != null && idRangeEnd != null;

	if (hasIdRange) {
		if (!idSignature) {
			issues.push({
				severity: 'warning',
				category: '基础信息',
				message: '已设置ID分配段，但缺少签名，ID合法性无法被游戏验证',
			});
		} else if (packLabel) {
			if (options.isIdSignatureValid === false) {
				issues.push({
					severity: 'error',
					category: '基础信息',
					message: `ID段签名无效（资源包标识符（Label）：${packLabel}，分配段：${idRangeStart}～${idRangeEnd}）`,
				});
			}
		}
	}

	// ── Helper: ID validation ─────────────────────────────

	function checkId(id: number, entityType: string, entityName: string): void {
		if (id < 0 || id > UNMANAGED_ID_MAX) {
			issues.push({
				severity: 'error',
				category: entityType,
				message: `${entityName}的ID（${id}）超出有效范围`,
			});
		} else if (id <= GAME_ID_MAX) {
			issues.push({
				severity: 'error',
				category: entityType,
				message: `${entityName}的ID（${id}）位于游戏保留段（0～${GAME_ID_MAX}）`,
			});
		} else if (
			id < UNMANAGED_ID_MIN &&
			hasIdRange &&
			(id < idRangeStart! || id > idRangeEnd!)
		) {
			issues.push({
				severity: 'error',
				category: entityType,
				message: `${entityName}的ID（${id}）超出已分配的ID段（${idRangeStart}～${idRangeEnd}）`,
			});
		} else if (id >= UNMANAGED_ID_MIN) {
			issues.push({
				severity: 'warning',
				category: entityType,
				message: `${entityName}的ID（${id}）位于不受管理区域`,
			});
		}
	}

	function checkIdDuplicate(
		ids: number[],
		entityType: string,
		getLabel: (index: number) => string
	): void {
		const seen = new Map<number, number>();
		ids.forEach((id, i) => {
			if (seen.has(id)) {
				issues.push({
					severity: 'error',
					category: entityType,
					message: `${getLabel(i)}与${getLabel(seen.get(id)!)}的ID（${id}）重复`,
				});
			} else {
				seen.set(id, i);
			}
		});
	}

	// ── Helper: string label/name prefix validation ───────
	function checkLabelPrefix(
		label: string,
		entityType: string,
		entityName: string
	): void {
		if (!prefix) return; // no pack label to check
		if (!label) return;
		if (!label.startsWith(prefix)) {
			issues.push({
				severity: 'warning',
				category: entityType,
				message: `${entityName}的标识“${label}”未以“${prefix}”开头`,
			});
		}
	}

	function checkAssetPath(
		path: string,
		entityType: string,
		entityName: string,
		assetPathName: string
	): void {
		if (!path.trim()) {
			issues.push({
				severity: 'error',
				category: entityType,
				message: `${entityName}的${assetPathName}不能为空`,
			});
			return;
		}
		if (!isImageAssetPath(path)) {
			issues.push({
				severity: 'warning',
				category: entityType,
				message: `${entityName}的${assetPathName}“${path}”不是受支持的图片文件`,
			});
		}
	}

	function checkAssetPaths(
		paths: readonly string[],
		expectedCount: number,
		entityType: string,
		entityName: string,
		assetName: string
	): void {
		if (paths.length !== expectedCount) {
			issues.push({
				severity: 'error',
				category: entityType,
				message: `${entityName}的${assetName}应为${expectedCount}张，当前为${paths.length}张`,
			});
		}
		paths.forEach((path, index) =>
			checkAssetPath(
				path,
				entityType,
				entityName,
				`${assetName}#${index + 1}路径`
			)
		);
	}

	// ── Characters ────────────────────────────────────────
	const charNames = (i: number) =>
		data.characters[i]?.name || `角色#${i + 1}`;

	checkIdDuplicate(
		data.characters.map((c) => c.id),
		'角色',
		charNames
	);

	data.characters.forEach((char, i) => {
		const name = char.name || `角色#${i + 1}`;

		checkId(char.id, '角色', name);

		// Label must start with _
		if (!char.label.startsWith('_')) {
			issues.push({
				severity: 'error',
				category: '角色',
				message: `${name}的标签“${char.label}”必须以_开头`,
			});
		}

		checkLabelPrefix(char.label, '角色', name);
		char.portraits?.forEach((portrait, portraitIndex) =>
			checkAssetPath(
				portrait.path,
				'角色',
				name,
				`立绘#${portraitIndex + 1}路径`
			)
		);

		// Sprite set name
		if (char.characterSpriteSetCompact) {
			const {
				eyeSprite,
				mainSprite,
				name: spriteName,
			} = char.characterSpriteSetCompact;
			checkLabelPrefix(spriteName, '角色小人', `${name}的小人名称`);
			checkAssetPaths(mainSprite, 12, '角色小人', name, '主身体贴图');
			checkAssetPaths(eyeSprite, 24, '角色小人', name, '眼睛贴图');
		}
	});

	// ── Dialog Packages ───────────────────────────────────
	const dialogNamesSeen = new Map<string, number>();
	data.dialogPackages.forEach((pkg, i) => {
		const displayName = pkg.name || `对话包#${i + 1}`;

		// Duplicate check
		if (pkg.name && dialogNamesSeen.has(pkg.name)) {
			issues.push({
				severity: 'error',
				category: '对话包',
				message: `${displayName}与对话包#${dialogNamesSeen.get(pkg.name)! + 1}的名称重复`,
			});
		} else if (pkg.name) {
			dialogNamesSeen.set(pkg.name, i);
		}

		checkLabelPrefix(pkg.name, '对话包', displayName);
	});

	// ── Dialog Action Sprites ─────────────────────────────
	data.dialogPackages.forEach((pkg, pkgIndex) => {
		const pkgName = pkg.name || `对话包#${pkgIndex + 1}`;
		pkg.dialogList.forEach((dlg, dlgIndex) => {
			(dlg.actions ?? []).forEach((act, actIndex) => {
				const where = `${pkgName}第${dlgIndex + 1}条对话的动作#${actIndex + 1}`;
				const maxJump = pkg.dialogList.length + 1;

				if (act.actionType === 'Branch') {
					if (!act.options || act.options.length === 0) {
						issues.push({
							severity: 'error',
							category: '对话动作',
							message: `${where}（Branch）至少需要一个选项`,
						});
						return;
					}

					act.options.forEach((option, optionIndex) => {
						const optionWhere = `${where}（Branch）选项#${optionIndex + 1}`;
						const jump = option.jump ?? 1;
						if (!option.text?.trim()) {
							issues.push({
								severity: 'error',
								category: '对话动作',
								message: `${optionWhere}未设置选项文字`,
							});
						}
						if (
							!Number.isInteger(jump) ||
							jump < 1 ||
							jump > maxJump
						) {
							issues.push({
								severity: 'error',
								category: '对话动作',
								message: `${optionWhere}的跳转目标${jump}无效，应为1～${maxJump}`,
							});
						}
						if (
							option.price !== undefined &&
							(!Number.isInteger(option.price) ||
								option.price < 0)
						) {
							issues.push({
								severity: 'error',
								category: '对话动作',
								message: `${optionWhere}的价格必须为空或非负整数`,
							});
						}
					});
					return;
				}

				if (act.actionType === 'Goto') {
					if (
						!Number.isInteger(act.index) ||
						(act.index ?? -1) < 1 ||
						(act.index ?? -1) > maxJump
					) {
						issues.push({
							severity: 'error',
							category: '对话动作',
							message: `${where}（Goto）的跳转目标${act.index ?? '未设置'}无效，应为1～${maxJump}`,
						});
					}
					return;
				}

				if (act.actionType === 'End') {
					if (
						act.exitCode !== undefined &&
						!Number.isInteger(act.exitCode)
					) {
						issues.push({
							severity: 'error',
							category: '对话动作',
							message: `${where}（End）的退出码必须是整数或留空`,
						});
					}
					return;
				}

				if (act.actionType === 'Sound') {
					if (!act.sound) {
						issues.push({
							severity: 'error',
							category: '对话动作',
							message: `${where}（Sound）未设置音频路径（sound）`,
						});
						return;
					}
					if (!act.sound.startsWith('assets/Audio/')) {
						issues.push({
							severity: 'warning',
							category: '对话动作',
							message: `${where}的音频路径（sound）“${act.sound}”未位于推荐目录assets/Audio/`,
						});
					}
					if (!act.sound.toLowerCase().endsWith('.wav')) {
						issues.push({
							severity: 'warning',
							category: '对话动作',
							message: `${where}的音频路径（sound）“${act.sound}”不是.wav文件，MOD目前仅支持.wav`,
						});
					}
					checkedAssetReferences.add(act.sound);
					if (assetSet && !assetSet.has(act.sound)) {
						issues.push({
							severity: 'error',
							category: '对话动作',
							message: `${where}引用的音频“${act.sound}”在当前项目中不存在`,
						});
					}
					return;
				}

				const isSpriteAction =
					act.actionType === 'CG' || act.actionType === 'BG';
				if (!isSpriteAction) return;

				const isClearing = act.shouldSet === false;
				if (isClearing) {
					if (act.sprite) {
						issues.push({
							severity: 'warning',
							category: '对话动作',
							message: `${where}（${act.actionType}）标记为清空但仍带有贴图路径（sprite）字段，导出时将会丢弃`,
						});
					}
					return;
				}

				if (!act.sprite) {
					issues.push({
						severity: 'error',
						category: '对话动作',
						message: `${where}（${act.actionType}）既未设置贴图路径（sprite）也未标记清空`,
					});
					return;
				}

				const expectedFolder =
					act.actionType === 'CG' ? 'assets/CG/' : 'assets/BG/';
				if (!act.sprite.startsWith(expectedFolder)) {
					issues.push({
						severity: 'warning',
						category: '对话动作',
						message: `${where}的贴图路径（sprite）“${act.sprite}”未位于推荐目录${expectedFolder}`,
					});
				}
				if (!isImageAssetPath(act.sprite)) {
					issues.push({
						severity: 'warning',
						category: '对话动作',
						message: `${where}的贴图路径（sprite）“${act.sprite}”不是受支持的图片文件`,
					});
				}
				if (assetSet && !assetSet.has(act.sprite)) {
					checkedAssetReferences.add(act.sprite);
					issues.push({
						severity: 'error',
						category: '对话动作',
						message: `${where}引用的资产“${act.sprite}”在当前项目中不存在`,
					});
				}
			});
		});
	});

	// ── Mission Nodes ─────────────────────────────────────
	data.missionNodes.forEach((mission, i) => {
		const displayName =
			mission.title || mission.debugLabel || `任务#${i + 1}`;

		checkLabelPrefix(mission.label, '任务节点', displayName);
	});

	// ── Event Nodes ───────────────────────────────────────
	(data.eventNodes || []).forEach((event, i) => {
		const displayName = event.debugLabel || `事件#${i + 1}`;

		checkLabelPrefix(event.label, '事件节点', displayName);
	});

	// ── Ingredients ───────────────────────────────────────
	const ingNames = (i: number) =>
		data.ingredients[i]?.name || `食材#${i + 1}`;
	checkIdDuplicate(
		data.ingredients.map((it) => it.id),
		'食材',
		ingNames
	);
	data.ingredients.forEach((it, i) => {
		const name = it.name || `食材#${i + 1}`;
		checkId(it.id, '食材', name);
		checkAssetPath(it.spritePath, '食材', name, '贴图路径（spritePath）');
	});

	// ── Foods ─────────────────────────────────────────────
	const foodNames = (i: number) => data.foods[i]?.name || `料理#${i + 1}`;
	checkIdDuplicate(
		data.foods.map((f) => f.id),
		'料理',
		foodNames
	);
	data.foods.forEach((f, i) => {
		const name = f.name || `料理#${i + 1}`;
		checkId(f.id, '料理', name);
		checkAssetPath(f.spritePath, '料理', name, '贴图路径（spritePath）');
	});

	// ── Beverages ─────────────────────────────────────────
	const bevNames = (i: number) =>
		(data.beverages || [])[i]?.name || `酒水#${i + 1}`;
	checkIdDuplicate(
		(data.beverages || []).map((b) => b.id),
		'酒水',
		bevNames
	);
	(data.beverages || []).forEach((b, i) => {
		const name = b.name || `酒水#${i + 1}`;
		checkId(b.id, '酒水', name);
		checkAssetPath(b.spritePath, '酒水', name, '贴图路径（spritePath）');
	});

	// ── Recipes ───────────────────────────────────────────
	const recipeNames = (i: number) =>
		`食谱#${i + 1}（ID：${data.recipes[i]?.id}）`;
	checkIdDuplicate(
		data.recipes.map((r) => r.id),
		'食谱',
		recipeNames
	);
	data.recipes.forEach((r, i) => {
		checkId(r.id, '食谱', `食谱#${i + 1}`);
	});

	// ── Clothes ───────────────────────────────────────────
	const clothesNames = (i: number) =>
		(data.clothes || [])[i]?.name || `衣服#${i + 1}`;
	checkIdDuplicate(
		(data.clothes || []).map((c) => c.id),
		'衣服',
		clothesNames
	);
	(data.clothes || []).forEach((c, i) => {
		const name = c.name || `衣服#${i + 1}`;
		checkId(c.id, '衣服', name);
		checkAssetPath(c.spritePath, '衣服', name, '图标路径（spritePath）');
		checkAssetPath(
			c.portraitPath,
			'衣服',
			name,
			'立绘路径（portraitPath）'
		);
		checkAssetPaths(
			c.pixelFullConfig.mainSprite,
			12,
			'衣服小人',
			name,
			'主身体贴图'
		);
		checkAssetPaths(
			c.pixelFullConfig.eyeSprite,
			24,
			'衣服小人',
			name,
			'眼睛贴图'
		);
		checkAssetPaths(
			c.pixelFullConfig.hairSprite,
			12,
			'衣服小人',
			name,
			'头发贴图'
		);
		checkAssetPaths(
			c.pixelFullConfig.backSprite,
			12,
			'衣服小人',
			name,
			'背部贴图'
		);
	});

	if (assetSet) {
		for (const path of collectResourcePackAssetReferences(data)) {
			if (checkedAssetReferences.has(path) || assetSet.has(path))
				continue;
			issues.push({
				severity: 'error',
				category: '资产引用',
				message: `引用的资产“${path}”在当前项目中不存在`,
			});
		}
	}

	return issues;
}
