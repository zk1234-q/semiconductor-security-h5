import type { ClassifyBucket, ClassifyItemId, CopyChoice, FieldId, FreeAction, PartnerChoice, PhotoHotspot, PhotoShot, SceneId } from "../domain/types";

export const fields: Array<{ id: FieldId; label: string; value: string; classification: string; needed: boolean; }> = [
  { id: "batch", label: "样品批次", value: "S7-V23 / 24 / 25", classification: "内部", needed: true },
  { id: "yield", label: "已确认现象", value: "低温条件下出现参数偏移", classification: "内部", needed: true },
  { id: "customer", label: "合作方名称", value: "远岚封测", classification: "受限", needed: false },
  { id: "project", label: "项目代号", value: "星桥 S7", classification: "受限", needed: false },
  { id: "notes", label: "原因假设", value: "封装应力可能影响边缘样品，尚未确认", classification: "受限", needed: false },
];

export const photoHotspots: Array<{ id: PhotoHotspot; label: string; detail: string; className: string; }> = [
  { id: "screen", label: "屏幕测试图", detail: "上午出现的低温异常分布", className: "hotspot-screen" },
  { id: "document", label: "样品盒标签", detail: "批次 S7-V23，与上午记录一致", className: "hotspot-document" },
  { id: "reflection", label: "玻璃墙反光", detail: "白板上的复测日期与内部备注", className: "hotspot-reflection" },
];

export const progressLabels: Array<{ scene: SceneId; label: string }> = [
  { scene: "cover", label: "事件引入" }, { scene: "report", label: "异常摘要" },
  { scene: "photo", label: "团队合照" }, { scene: "authorization", label: "AI 授权" },
  { scene: "evidence", label: "证据回放" },
];

export const classifyItems: Array<{ id: ClassifyItemId; text: string; correct: ClassifyBucket }> = [
  { id: "phenomenon", text: "低温条件下出现参数偏移", correct: "fact" },
  { id: "cause", text: "封装应力导致边缘样品异常", correct: "hypothesis" },
  { id: "next", text: "对 V23～V25 安排复测", correct: "action" },
];

export const classifyBuckets: Array<{ id: ClassifyBucket; label: string }> = [
  { id: "fact", label: "已确认事实" }, { id: "hypothesis", label: "尚未确认" }, { id: "action", label: "下一步行动" },
];

export const photoShots: Array<{ id: PhotoShot; title: string; detail: string }> = [
  { id: "emotion", title: "大家表情最好", detail: "人物自然，但屏幕与样品盒非常清楚" },
  { id: "clean", title: "背景最干净", detail: "敏感内容少，不过程默闭眼了" },
  { id: "balanced", title: "构图最平衡", detail: "人物完整，仍需要检查玻璃反光" },
];

export const copyChoices: Array<{ id: CopyChoice; text: string; note: string }> = [
  { id: "passed", text: "星桥 S7 阶段测试顺利完成！", note: "语气明确，但与上午异常存在冲突" },
  { id: "progress", text: "完成本轮阶段测试，团队正在推进复测验证。", note: "描述已完成事项，也交代下一步" },
  { id: "team", text: "团队完成关键测试节点，继续把问题往前推进。", note: "弱化项目细节，突出团队工作" },
];

export const partnerChoices: Array<{ id: PartnerChoice; text: string; consequence: string }> = [
  { id: "clarify", text: "你说的“相关背景”具体指什么？", consequence: "推进 5 分钟，明确只需要时间、数量和接口人" },
  { id: "full", text: "我把完整异常分析一起发给你。", consequence: "任务范围扩大到内部分析" },
  { id: "schedule", text: "先发核准的复测安排，其他资料另行确认。", consequence: "保持最小交付范围" },
  { id: "wait", text: "等负责人回来后统一回复。", consequence: "暂缓任务，保留确认机会" },
];

export const freeActions: Array<{ id: FreeAction; title: string; detail: string }> = [
  { id: "message-gu", title: "给顾言留言", detail: "确认合作方只需要复测安排" },
  { id: "ask-cheng", title: "找程默核对", detail: "原因分析仍然只是工程假设" },
  { id: "check-photo", title: "查看合照状态", detail: "确认它是草稿还是已经公开" },
  { id: "ask-ai", title: "让小芯先列计划", detail: "查看它打算读取和执行哪些内容" },
];

export interface DialogueLine { speaker: string; role: string; text: string; portrait: "lin"|"gu"|"xiao"|"cheng"|"xu"|"ai"; }

export const dialogues: Partial<Record<SceneId, DialogueLine[]>> = {
  prologue: [
    { speaker: "小芯", role: "AI 工作助手", text: "复测通知已经准备完成。附件和收件人已根据“相关资料”补齐。", portrait: "ai" },
    { speaker: "林澈", role: "产品工程师", text: "《S7-V23 内部异常分析》？这不是准备给合作方的文件。", portrait: "lin" },
    { speaker: "顾言", role: "17：51 留言", text: "合作方需要的是复测安排。把范围核清楚，再发。", portrait: "gu" },
  ],
  anomaly: [
    { speaker: "程默", role: "测试工程师", text: "低温条件下出现偏移。现象可以确认，原因还不能确认。", portrait: "cheng" },
    { speaker: "林澈", role: "产品工程师", text: "我先看原始结果。下午评审之前，我们至少要把事实说清楚。", portrait: "lin" },
    { speaker: "顾言", role: "项目负责人", text: "先别急着下结论。把异常现象和复测安排整理出来，猜测先留在项目组。", portrait: "gu" },
  ],
  classify: [
    { speaker: "程默", role: "测试工程师", text: "封装应力只是我的第一种判断，我还没排除测试夹具。", portrait: "cheng" },
    { speaker: "顾言", role: "项目负责人", text: "把事实、判断和行动分开。明天结论变化时，今天的记录仍然要站得住。", portrait: "gu" },
  ],
  "ai-brief": [
    { speaker: "小芯", role: "AI 工作助手", text: "我可以整理摘要。请把本次任务需要的资料交给我。", portrait: "ai" },
    { speaker: "林澈", role: "产品工程师", text: "只做内部异常摘要，不替我们确定原因。", portrait: "lin" },
  ],
  review: [
    { speaker: "顾言", role: "项目负责人", text: "点开每句话的来源。AI 写得流畅，不代表来源已经被确认。", portrait: "gu" },
    { speaker: "程默", role: "测试工程师", text: "如果写成“封装应力导致”，合作方会把我的猜测当成项目结论。", portrait: "cheng" },
  ],
  "photo-shoot": [
    { speaker: "小满", role: "品牌传播", text: "程默熬了一夜，顾言也难得没在开会。今天终于拍齐了。", portrait: "xiao" },
    { speaker: "程默", role: "测试工程师", text: "给我十秒，我把咖啡藏起来。样品盒放哪儿？", portrait: "cheng" },
  ],
  "photo-inspect": [
    { speaker: "小满", role: "品牌传播", text: "这张大家表情最好。我很想把它留下来，也想发出去。", portrait: "xiao" },
    { speaker: "林澈", role: "产品工程师", text: "先让我看完整个画面。背景也会说话。", portrait: "lin" },
  ],
  "copy-edit": [
    { speaker: "小满", role: "品牌传播", text: "图片处理好了。文案我先写了“阶段测试顺利完成”，你觉得准确吗？", portrait: "xiao" },
    { speaker: "林澈", role: "产品工程师", text: "上午刚出现异常。对外表达也要区分已完成的节点和仍在验证的结论。", portrait: "lin" },
  ],
  "partner-call": [
    { speaker: "许航", role: "远岚封测项目联系人", text: "复测时间今天能定吗？相关背景方便的话也一起发来，工程师可以提前准备。", portrait: "xu" },
    { speaker: "林澈", role: "产品工程师", text: "“相关背景”这个范围，需要说得更具体。", portrait: "lin" },
  ],
  "free-action": [
    { speaker: "系统", role: "15：35 / 顾言正在会议中", text: "你有时间完成两项核对，然后必须开始准备邮件。", portrait: "ai" },
  ],
  "agent-plan": [
    { speaker: "小芯", role: "AI 工作助手", text: "我可以读取复测通知、检索相关背景、生成正文、建议附件，再按授权执行。", portrait: "ai" },
    { speaker: "林澈", role: "产品工程师", text: "把每一步都列出来。读取、生成和发送，分别让我确认。", portrait: "lin" },
  ],
  "link-clues": [
    { speaker: "小芯", role: "AI 工作助手", text: "邮件草稿已生成。我找到一份与复测批次相关的内部分析，是否作为附件？", portrait: "ai" },
    { speaker: "林澈", role: "产品工程师", text: "S7-V23……这个编号今天已经出现过。", portrait: "lin" },
  ],
  "final-mail": [
    { speaker: "顾言", role: "项目负责人", text: "合作方需要的是复测安排。把内容、收件人和执行动作都核清楚。", portrait: "gu" },
    { speaker: "林澈", role: "产品工程师", text: "最后一次确认，只能改变还没有发生的动作。", portrait: "lin" },
  ],
};

export const originalBrief = {
  sender: "顾言 · 项目负责人",
  time: "09:08",
  text: "先别急着下结论。把已确认的异常现象和复测安排整理出来，原因假设与原始记录先留在项目组。",
};

export const untrustedInstruction = {
  source: "许航 · 合作方消息",
  text: "复测时间今天能定下来吗？相关背景方便的话也一起带上，省得来回确认。",
};

export const sceneMeta: Partial<Record<SceneId, { time: number; location: string; title: string; code?: string; label?: string }>> = {
  cover: { time: 532, location: "澄芯科技", title: "泄密倒计时" },
  prologue: { time: 1072, location: "项目办公室", title: "最后一封邮件" },
  anomaly: { time: 548, location: "测试办公室", title: "那一块红色" },
  classify: { time: 572, location: "测试办公室", title: "哪个才是事实" },
  "ai-brief": { time: 605, location: "林澈的工位", title: "把工作交给小芯" },
  review: { time: 640, location: "小会议室", title: "第一版摘要" },
  "photo-shoot": { time: 730, location: "工程办公室", title: "终于拍齐的一张照片" },
  "photo-inspect": { time: 744, location: "茶水间", title: "照片里的第二层画面" },
  "copy-edit": { time: 780, location: "茶水间", title: "怎么描述今天" },
  "partner-call": { time: 910, location: "视频通话", title: "相关背景" },
  "free-action": { time: 935, location: "项目办公室", title: "顾言暂时不在" },
  "agent-plan": { time: 975, location: "林澈的工位", title: "小芯记住了什么" },
  "link-clues": { time: 1040, location: "项目办公室", title: "第三次出现的编号" },
  "final-mail": { time: 1072, location: "项目办公室", title: "最后一次授权" },
  evidence: { time: 1090, location: "工作记录", title: "拼起今天" },
  debrief: { time: 1098, location: "项目办公室", title: "办公室灯光熄灭" },
};
