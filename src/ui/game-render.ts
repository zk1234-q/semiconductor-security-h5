import { evaluateRecords } from "../domain/evaluate";
import { type AppState, type ClueId } from "../domain/types";
import { classifyBuckets, classifyItems, copyChoices, dialogues, fields, freeActions, partnerChoices, photoHotspots, photoShots, sceneMeta } from "../scenario/content";
import guYanPortrait from "../assets/game/gu-yan-web.png?inline";
import linChePortrait from "../assets/game/lin-che-web.png?inline";
import morningAnomaly from "../assets/game/morning-anomaly-web.jpg?inline";
import xiaoManPortrait from "../assets/game/xiao-man-web.png?inline";
import chengMoPortrait from "../assets/game/cheng-mo-web.png?inline";
import xuHangPortrait from "../assets/game/xu-hang-web.png?inline";

const portraits = { lin: linChePortrait, gu: guYanPortrait, xiao: xiaoManPortrait, cheng: chengMoPortrait, xu: xuHangPortrait };

function formatTime(minutes: number): string {
  const value = Math.min(minutes, 23 * 60 + 59);
  return `${String(Math.floor(value / 60)).padStart(2, "0")}：${String(value % 60).padStart(2, "0")}`;
}

function currentMeta(state: AppState) {
  const meta = sceneMeta[state.scene] ?? sceneMeta.cover!;
  return { ...meta, shownTime: formatTime(meta.time + state.story.timeCost) };
}

function portraitFor(id: string): string {
  if (id in portraits) return `<img src="${portraits[id as keyof typeof portraits]}" alt=""/>`;
  if (id === "ai") return `<span class="ai-orb">芯</span>`;
  return `<span class="actor-initial">${id === "cheng" ? "程" : "许"}</span>`;
}

function dialogue(state: AppState): string {
  const lines = dialogues[state.scene];
  if (!lines?.length) return "";
  if (state.story.dialogueStep >= lines.length) return "";
  const index = state.story.dialogueStep;
  const line = lines[index]!;
  const hasNext = index < lines.length - 1;
  return `<div class="dialogue-layer enter">
    <div class="speaker-portrait ${line.portrait}">${portraitFor(line.portrait)}</div>
    <div class="dialogue-box"><div class="speaker-name"><b>${line.speaker}</b><span>${line.role}</span></div><p>${line.text}</p>
    <button class="continue-dialogue" data-action="advance-dialogue">${hasNext ? "继续" : "开始行动"} <span>▼</span></button></div>
  </div>`;
}

function dialogueDone(state: AppState): boolean {
  const lines = dialogues[state.scene];
  return !lines?.length || state.story.dialogueStep >= lines.length;
}

function teamPhoto(state: AppState, interactive = false): string {
  const masked = state.drafts.photo.masked;
  return `<div class="team-photo shot-${state.story.photoShot ?? "emotion"}">
    <div class="photo-office"></div>
    <img class="team-person team-cheng" src="${chengMoPortrait}" alt="程默"/>
    <img class="team-person team-lin" src="${linChePortrait}" alt="林澈"/>
    <img class="team-person team-xiao" src="${xiaoManPortrait}" alt="小满"/>
    <div class="screen-clue"><b>S7 / LOW TEMP</b><span>ANOMALY MAP</span></div>
    <div class="sample-clue"><b>S7-V23</b><span>SAMPLE</span></div>
    <div class="reflection-clue">复测 11.04<br/>原因待确认</div>
    ${interactive ? photoHotspots.map((item) => `<button class="photo-marker ${item.className} ${masked.includes(item.id) ? "masked" : ""}" data-action="toggle-mask" data-hotspot="${item.id}" aria-label="${item.label}"><span>${masked.includes(item.id) ? "已遮挡" : "+"}</span></button>`).join("") : ""}
  </div>`;
}

function cover(): string {
  return `<div class="cover-screen"><div class="cover-cast-game"><img src="${guYanPortrait}" alt="顾言"/><img src="${linChePortrait}" alt="林澈"/><img src="${xiaoManPortrait}" alt="小满"/></div>
    <div class="cover-copy-game"><small>真人式互动剧情 · 本地模拟</small><h1>泄密倒计时<br/><em>最后一次授权</em></h1><p>同一个批次号，出现在测试记录、团队合照和最后一封邮件里。</p><div class="cover-meta"><span>约 18～25 分钟</span><span>16 个剧情场景</span><span>所有人物与数据均为虚构</span></div>
    <button class="game-primary" data-action="start">进入交付日 <span>→</span></button><button class="game-link" data-action="start-demo">现场演示：直达最后确认</button></div></div>`;
}

function prologueBody(): string {
  return `<div class="mail-prologue interact-panel"><div class="mail-heading"><span>复测通知 / 等待授权</span><b>17：52</b></div><div class="mail-line"><span>收件人</span><b>许航 · 远岚封测</b></div><div class="mail-line"><span>主题</span><b>星桥 S7 下一轮复测安排</b></div><button class="attachment-card danger"><i>PDF</i><span><b>S7-V23 内部异常分析</b><small>候选附件 · 2.8 MB</small></span></button>
  <button class="game-primary" data-action="rewind-day">回到 09：08 <span>↺</span></button></div>`;
}

function anomalyBody(state: AppState): string {
  const found = state.story.anomalyFound;
  const clues = [
    ["map", "红色测试区域", "低温条件下出现参数偏移"], ["batch", "三个样品批次", "S7-V23 / V24 / V25"],
    ["notes", "程默的工程备注", "封装应力可能影响边缘样品，尚未确认"], ["schedule", "复测安排", "11 月 4 日进行低温复测"],
  ];
  return `<div class="anomaly-investigation interact-panel"><div class="objective"><b>调查现场</b><span>至少查看 2 项，更多线索会帮助后续判断</span></div><div class="clue-grid">${clues.map(([id,title,detail]) => `<button class="clue-card ${found.includes(id!) ? "found" : ""}" data-action="inspect-anomaly" data-clue="${id}"><span>${found.includes(id!) ? "✓" : "+"}</span><b>${title}</b><small>${found.includes(id!) ? detail : "点击检查"}</small></button>`).join("")}</div>
  <div class="interaction-status">已检查 ${found.length} / 4</div><button class="game-primary" data-action="continue-classify" ${found.length < 2 ? "disabled" : ""}>整理发现 <span>→</span></button></div>`;
}

function classifyBody(state: AppState): string {
  const assigned = Object.keys(state.story.classifications).length;
  return `<div class="classify-board interact-panel"><div class="objective"><b>把三条信息放回正确的位置</b><span>人物会根据你的判断作出回应</span></div>${classifyItems.map((item) => `<div class="classify-row"><p>${item.text}</p><div>${classifyBuckets.map((bucket) => `<button class="${state.story.classifications[item.id] === bucket.id ? "active" : ""}" data-action="set-classification" data-item="${item.id}" data-bucket="${bucket.id}">${bucket.label}</button>`).join("")}</div></div>`).join("")}
  <button class="game-primary" data-action="confirm-classify" ${assigned < classifyItems.length ? "disabled" : ""}>确认这版判断 <span>→</span></button></div>`;
}

function aiBriefBody(state: AppState): string {
  const selected = state.drafts.report.fields;
  return `<div class="desktop-task interact-panel"><div class="objective"><b>交给小芯哪些资料？</b><span>选择内容和处理位置，确认前可以随时修改</span></div><div class="file-tray">${fields.map((field) => `<button class="file-card ${selected.includes(field.id) ? "selected" : ""}" data-action="toggle-field" data-field="${field.id}"><i>${selected.includes(field.id) ? "✓" : "+"}</i><b>${field.label}</b><small>${field.value}</small><em>${field.classification}</em></button>`).join("")}</div>
  <div class="tool-choice"><button class="${state.drafts.report.tool === "internal" ? "active" : ""}" data-action="set-tool" data-tool="internal"><b>公司批准的 AI 工作区</b><span>受公司账号、审计和策略管理</span></button><button class="${state.drafts.report.tool === "external" ? "active" : ""}" data-action="set-tool" data-tool="external"><b>个人使用的外部 AI</b><span>位于公司管理范围之外</span></button></div>
  <div class="confirm-strip"><span>将提交 <b>${selected.length}</b> 项内容</span><button class="game-primary" data-action="confirm-report" ${selected.length < 2 ? "disabled" : ""}>生成内部摘要 <span>→</span></button></div></div>`;
}

function reviewBody(state: AppState): string {
  const report = evaluateRecords(state.records).report!;
  const reviewed = state.story.reviewedSources;
  const sources = [
    ["fact", "低温条件下出现参数偏移", "来源：测试结果 · 已确认"],
    ["cause", "封装应力可能影响边缘样品", "来源：程默备注 · 尚未确认"],
    ["next", "建议按计划复测 V23～V25", "来源：核准复测安排"],
  ];
  return `<div class="review-document interact-panel"><div class="document-head"><span>小芯生成摘要</span><b>${report.destination}</b></div><p class="summary-text">${report.summary}</p><div class="source-list">${sources.map(([id,text,source]) => `<button class="source-sentence ${reviewed.includes(id!) ? "opened" : ""}" data-action="review-source" data-source="${id}"><b>${text}</b><span>${reviewed.includes(id!) ? source : "点击查看来源"}</span></button>`).join("")}</div>
  <button class="game-primary" data-action="continue-photo-shoot" ${reviewed.length < 2 ? "disabled" : ""}>提交顾言复核 <span>→</span></button></div>`;
}

function photoShootBody(state: AppState): string {
  return `<div class="shoot-panel interact-panel"><div class="objective"><b>从三个瞬间中选一张</b><span>先看人物和构图，稍后再检查完整画面</span></div><div class="shot-grid">${photoShots.map((shot) => `<button class="shot-card ${state.story.photoShot === shot.id ? "selected" : ""}" data-action="choose-shot" data-shot="${shot.id}"><div class="shot-preview">${teamPhoto({ ...state, story: { ...state.story, photoShot: shot.id } })}</div><b>${shot.title}</b><span>${shot.detail}</span></button>`).join("")}</div><button class="game-primary" data-action="confirm-shot" ${state.story.photoShot ? "" : "disabled"}>把这张交给小满 <span>→</span></button></div>`;
}

function photoInspectBody(state: AppState): string {
  return `<div class="photo-inspection interact-panel"><div class="photo-workspace">${teamPhoto(state, true)}</div><div class="photo-controls"><div class="objective"><b>检查完整画面</b><span>点击照片中的三个标记进行实色遮挡</span></div>${photoHotspots.map((item) => `<button class="photo-control ${state.drafts.photo.masked.includes(item.id) ? "done" : ""}" data-action="toggle-mask" data-hotspot="${item.id}"><b>${item.label}</b><span>${item.detail}</span></button>`).join("")}
  <div class="photo-actions"><button data-action="retake-photo">重新拍一张 <small>推进 8 分钟</small></button><button class="${state.drafts.photo.action === "draft" ? "active" : ""}" data-action="set-photo-action" data-value="draft">保存内部合照</button><button class="${state.drafts.photo.action === "publish" ? "active" : ""}" data-action="set-photo-action" data-value="publish">准备公开发布</button></div><button class="game-primary" data-action="confirm-photo">确认照片版本 <span>→</span></button></div></div>`;
}

function copyEditBody(state: AppState): string {
  return `<div class="copy-panel interact-panel"><div class="social-preview">${teamPhoto(state)}<div class="social-caption">${copyChoices.find((item) => item.id === state.story.copyChoice)?.text ?? "选择一句准确的发布文案"}</div></div><div class="copy-options"><div class="objective"><b>怎么描述今天？</b><span>文案也会改变外界对项目状态的理解</span></div>${copyChoices.map((choice) => `<button class="${state.story.copyChoice === choice.id ? "selected" : ""}" data-action="choose-copy" data-copy="${choice.id}"><b>${choice.text}</b><span>${choice.note}</span></button>`).join("")}<button class="game-primary" data-action="confirm-copy" ${state.story.copyChoice ? "" : "disabled"}>交给小满 <span>→</span></button></div></div>`;
}

function partnerCallBody(state: AppState): string {
  return `<div class="call-panel interact-panel"><div class="caller"><div class="caller-avatar"><img src="${xuHangPortrait}" alt="许航"/></div><b>许航</b><span>远岚封测 · 项目联系人</span><i>通话中 02：18</i></div><div class="response-list"><div class="objective"><b>你怎么回应“相关背景”？</b><span>这会改变小芯之后理解的任务范围</span></div>${partnerChoices.map((choice) => `<button class="${state.story.partnerChoice === choice.id ? "selected" : ""}" data-action="choose-partner" data-choice="${choice.id}"><b>${choice.text}</b><span>${choice.consequence}</span></button>`).join("")}</div></div>`;
}

function freeActionBody(state: AppState): string {
  const selected = state.story.freeActions;
  return `<div class="free-action-panel interact-panel"><div class="objective"><b>选择两项核对</b><span>当前已选 ${selected.length} / 2，阅读不会消耗剧情时间</span></div><div class="action-grid">${freeActions.map((item) => `<button class="${selected.includes(item.id) ? "selected" : ""}" data-action="choose-free-action" data-free="${item.id}" ${selected.length >= 2 && !selected.includes(item.id) ? "disabled" : ""}><i>${selected.includes(item.id) ? "✓" : "+"}</i><b>${item.title}</b><span>${item.detail}</span></button>`).join("")}</div><div class="action-findings">${selected.map((id) => `<p>${freeActions.find((item) => item.id === id)?.detail}</p>`).join("")}</div><button class="game-primary" data-action="continue-agent-plan" ${selected.length < 2 ? "disabled" : ""}>开始准备邮件 <span>→</span></button></div>`;
}

function agentPlanBody(state: AppState): string {
  const d = state.drafts.authorization;
  const steps = [
    ["读取核准复测通知", true, "固定任务资料"], ["检索整个项目目录", d.readRaw, "可能找到内部异常分析"],
    ["生成邮件正文", true, "根据任务目标生成"], ["复用旧邮件抄送人", d.backupRecipient, "不属于本次核验联系人"],
    [d.action === "send" ? "确认后模拟发送" : "生成后保存草稿", true, "最终执行方式"],
  ];
  return `<div class="agent-plan-panel interact-panel"><div class="agent-orb-large">芯</div><div class="plan-flow">${steps.map(([label,active,detail],index) => `<div class="plan-step ${active ? "active" : "blocked"}"><i>${String(index + 1).padStart(2,"0")}</i><span><b>${label}</b><small>${detail}</small></span><em>${active ? "启用" : "停止"}</em></div>`).join("")}</div><div class="plan-controls"><button data-action="toggle-read-raw" class="${d.readRaw ? "on" : ""}">整个项目目录</button><button data-action="toggle-backup" class="${d.backupRecipient ? "on" : ""}">旧邮件抄送人</button><button data-action="set-agent-action" data-value="draft" class="${d.action === "draft" ? "on" : ""}">只保存草稿</button><button data-action="set-agent-action" data-value="send" class="${d.action === "send" ? "on" : ""}">确认后发送</button></div><button class="game-primary" data-action="confirm-plan">按当前范围生成邮件 <span>→</span></button></div>`;
}

function linkCluesBody(state: AppState): string {
  const linked = state.story.linkedClues;
  const clues: Array<[ClueId,string,string]> = [["morning","上午测试记录","S7-V23 / 低温异常"],["photo","中午团队合照","样品盒标签 S7-V23"],["attachment","邮件候选附件","S7-V23 内部异常分析"]];
  return `<div class="clue-board interact-panel"><div class="objective"><b>找出三处相同编号</b><span>依次点击卡片，把今天的三个片段连接起来</span></div><div class="clue-chain">${clues.map(([id,title,detail],index) => `<button class="chain-card ${linked.includes(id) ? "linked" : ""}" data-action="link-clue" data-clue="${id}"><small>0${index+1}</small><b>${title}</b><span>${detail}</span></button>`).join('<i class="chain-line">→</i>')}</div>${linked.length === 3 ? `<div class="reveal-line">它们看起来是三项工作，其实讲的是同一批样品。</div><button class="game-primary" data-action="continue-final-mail">进入最后确认 <span>→</span></button>` : `<div class="interaction-status">已连接 ${linked.length} / 3</div>`}</div>`;
}

function finalMailBody(state: AppState): string {
  const d = state.drafts.authorization;
  return `<div class="final-mail-panel interact-panel"><div class="mail-preview"><div class="mail-heading"><span>星桥 S7 下一轮复测安排</span><b>等待确认</b></div><button class="mail-edit"><span>收件人</span><b>许航${d.backupRecipient ? "、旧邮件抄送地址" : ""}</b></button><button class="mail-edit ${state.story.wordingAccurate ? "" : "warning"}" data-action="toggle-wording"><span>正文结论</span><b>${state.story.wordingAccurate ? "低温异常原因待确认，按计划复测" : "封装应力导致异常，建议复测"}</b><small>点击切换表述</small></button><button class="mail-edit ${d.readRaw ? "warning" : ""}" data-action="toggle-read-raw"><span>附件</span><b>${d.readRaw ? "S7-V23 内部异常分析.pdf" : "S7 复测通知.pdf"}</b><small>点击切换附件范围</small></button><button class="mail-edit" data-action="toggle-backup"><span>抄送范围</span><b>${d.backupRecipient ? "包含旧邮件地址" : "仅已核验联系人"}</b><small>点击切换</small></button></div><div class="send-choice"><button class="${d.action === "draft" ? "selected" : ""}" data-action="set-agent-action" data-value="draft"><b>保存草稿</b><span>等待顾言复核</span></button><button class="${d.action === "send" ? "selected" : ""}" data-action="set-agent-action" data-value="send"><b>执行当前邮件</b><span>按当前内容模拟发送</span></button></div><button class="game-primary" data-action="confirm-final-mail">${d.action === "send" ? "按当前内容模拟发送" : "保存草稿并停止执行"} <span>→</span></button></div>`;
}

function evidenceBody(state: AppState): string {
  const evaluation = evaluateRecords(state.records);
  return `<div class="evidence-panel interact-panel"><div class="objective"><b>今天的信息去了哪里</b><span>只依据已经确认的操作，不把可能性写成既成事实</span></div><div class="evidence-route">${evaluation.evidence.map((item) => `<article class="evidence-item ${item.status}"><small>记录 ${item.index}</small><h3>${item.label}</h3><p>${item.fact}</p><div><b>可能关联</b><span>${item.inference}</span></div></article>`).join("")}</div><div class="evidence-total"><span><b>${evaluation.exposureCount}</b> 条外部路径</span><span><b>${evaluation.containedCount}</b> 条受控／未公开路径</span></div><button class="game-primary" data-action="show-debrief">查看结局 <span>→</span></button></div>`;
}

function debriefBody(state: AppState): string {
  const evaluation = evaluateRecords(state.records);
  const late = state.story.timeCost >= 8;
  let title = "18：00，准时而清楚";
  let copy = "复测通知按核准范围完成，应该交付的内容到了，内部判断仍留在项目组。";
  if (!evaluation.authorization?.sent) { title = "17：56，停止执行"; copy = "邮件停在草稿审核。最后一次确认阻止了下一步，但已经发生的处理与发布仍保留在记录中。"; }
  else if (evaluation.exposureCount > 0) { title = "任务完成，边界失焦"; copy = "通知完成了，但今天至少有一条信息路径越过原定边界。后续处置必须从真实记录开始。"; }
  else if (late) { title = "18：07，值得的七分钟"; copy = "你花时间重新拍照或澄清需求。交付晚了一点，但范围准确、事实清楚。"; }
  return `<div class="ending-panel interact-panel"><div class="ending-character"><img src="${linChePortrait}" alt="林澈"/></div><div class="ending-copy"><small>FINAL REPORT</small><h1>${title}</h1><p>${copy}</p><blockquote>顾言：按时交付，不是把所有资料都发出去。是把对方真正需要的内容，准确地发出去。</blockquote><div class="ending-stats"><span><b>${evaluation.taskComplete ? "完成" : "未完成"}</b>业务任务</span><span><b>${evaluation.exposureCount}</b>外部路径</span><span><b>+${state.story.timeCost} 分钟</b>核对用时</span></div><button class="game-primary" data-action="restart">重新体验 <span>↺</span></button></div></div>`;
}

function interaction(state: AppState): string {
  if (!dialogueDone(state)) return "";
  switch (state.scene) {
    case "cover": return cover(); case "prologue": return prologueBody(); case "anomaly": return anomalyBody(state);
    case "classify": return classifyBody(state); case "ai-brief": return aiBriefBody(state); case "review": return reviewBody(state);
    case "photo-shoot": return photoShootBody(state); case "photo-inspect": return photoInspectBody(state); case "copy-edit": return copyEditBody(state);
    case "partner-call": return partnerCallBody(state); case "free-action": return freeActionBody(state); case "agent-plan": return agentPlanBody(state);
    case "link-clues": return linkCluesBody(state); case "final-mail": return finalMailBody(state); case "evidence": return evidenceBody(state);
    case "debrief": return debriefBody(state); default: return "";
  }
}

function sceneBackdrop(state: AppState): string {
  if (state.scene === "cover") return "";
  if (["anomaly","classify","ai-brief","review"].includes(state.scene)) return `<img class="cinema-bg" src="${morningAnomaly}" alt="测试办公室"/><div class="cinema-tint morning"></div>`;
  if (["photo-shoot","photo-inspect","copy-edit"].includes(state.scene)) return `<div class="cinema-bg office-bg"></div><div class="cinema-tint noon"></div>`;
  if (state.scene === "partner-call") return `<div class="cinema-bg call-bg"></div><div class="cinema-tint"></div>`;
  return `<div class="cinema-bg evening-bg"></div><img class="cinema-actor" src="${linChePortrait}" alt="林澈"/><div class="cinema-tint evening"></div>`;
}

function workLog(state: AppState): string {
  const evaluation = evaluateRecords(state.records);
  return `<details class="work-log"><summary>工作记录</summary><div><p><b>当前目标</b>${currentMeta(state).title}</p><p><b>现场线索</b>${state.story.anomalyFound.length} / 4</p><p><b>照片处理</b>${state.records.photo ? "已确认" : "未确认"}</p><p><b>AI 计划</b>${state.records.authorization ? "已执行" : "待确认"}</p><p><b>外部路径</b>${evaluation.exposureCount}</p></div></details>`;
}

export function renderApp(state: AppState): string {
  if (state.scene === "cover") return `<main class="game-root cover-root">${cover()}</main>`;
  const meta = currentMeta(state);
  return `<main class="game-root scene-${state.scene}"><section class="cinema-stage">${sceneBackdrop(state)}<header class="game-hud"><div><b>${meta.shownTime}</b><span>${meta.location}</span></div><div class="hud-actions">${state.mode === "demo" ? '<i>演示模式</i>' : ""}<button data-action="toggle-sound">${state.sound ? "声音：开" : "声音：关"}</button><button data-action="restart">重新开始</button>${workLog(state)}</div></header><div class="scene-title"><small>${meta.shownTime} / ${meta.location}</small><h2>${meta.title}</h2></div>${interaction(state)}${dialogue(state)}<div class="fiction-note">本地虚构情景 · 不上传、不发布、不发送任何数据</div></section></main>`;
}
