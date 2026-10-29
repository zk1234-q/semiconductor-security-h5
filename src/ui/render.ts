import { evaluateRecords } from "../domain/evaluate";
import { fieldLabels, hotspotLabels, type AppState, type EvidenceItem, type FieldId, type PhotoHotspot, type ReplayTarget } from "../domain/types";
import { fields, originalBrief, photoHotspots, progressLabels, untrustedInstruction } from "../scenario/content";
import { visualForScene } from "./art";
import guYanPortrait from "../assets/game/gu-yan-web.png?inline";
import linChePortrait from "../assets/game/lin-che-web.png?inline";
import xiaoManPortrait from "../assets/game/xiao-man-web.png?inline";

function characterDialogue(image:string,name:string,role:string,text:string,tone=""): string {
  return `<div class="character-dialogue ${tone}"><div class="portrait-crop"><img src="${image}" alt="${name}"/></div><div><small>${name} · ${role}</small><p>${text}</p></div></div>`;
}

function progressIndex(state: AppState): number {
  if (state.scene === "cover" || state.scene === "cold-open") return 0;
  if (state.scene === "report" || state.scene === "report-result") return 1;
  if (state.scene === "photo" || state.scene === "photo-result") return 2;
  if (state.scene === "authorization" || state.scene === "execution") return 3;
  return 4;
}
function progress(state: AppState): string {
  const active = progressIndex(state);
  return `<nav class="progress" aria-label="体验进度">${progressLabels.map((item,index)=>`${index?'<span class="progress-rule"></span>':""}<div class="progress-item ${index===active?"active":index<active?"done":""}"><span class="progress-number">${index<active?"✓":String(index+1).padStart(2,"0")}</span><span class="progress-label">${item.label}</span></div>`).join("")}</nav>`;
}
function cover(): string {
  return `<div class="content-inner cover-copy enter"><div class="eyebrow">INTERACTIVE SECURITY THRILLER</div><div class="incident-chip"><span></span>未发布芯片项目 / 等待回溯</div>
  <h1>泄密倒计时<br/><em>最后一次授权</em></h1><p class="lead">一场交付前的异常，把测试记录、团队合照和 AI 授权连到了一起。</p>
  <div class="story-callout"><strong>今天没有人想泄密。</strong><span>每个人都只是想快一点、完整一点，在 18:00 前把复测通知发出去。</span></div>
  <div class="case-meta"><span><small>PROJECT</small>星桥 S7</span><span><small>DURATION</small>约 12 分钟</span><span><small>ROLE</small>产品工程师 · 林澈</span></div>
  <div class="action-stack"><button class="primary-button" data-action="start">进入交付日 <span>→</span></button><button class="text-button" data-action="start-demo">现场演示：直达最后一次授权</button></div></div>`;
}
function coldOpen(): string {
  return `<div class="content-inner cinematic-copy enter"><div class="eyebrow">17:52:18 / 最后一次授权</div><h1>复测通知已经准备好。<br/><em>只差你的确认。</em></h1>
  ${characterDialogue(linChePortrait,"林澈","产品工程师","这份附件……为什么会出现在这里？","player")}
  <div class="dialogue"><div class="avatar ai-avatar">芯</div><div><small>AI 助手 · 小芯</small><p>我根据“相关背景”找到了一份项目记录。确认后，将按当前授权执行。</p></div></div>
  <div class="message-card"><small>顾言 · 17:51</small><p>合作方需要的是复测安排。把范围核清楚，再发。</p></div><p class="lead">今天早上，你交给小芯的第一个任务，只是“帮我整理一份摘要”。</p>
  <div class="action-stack"><button class="primary-button" data-action="begin-day">回到 09:08 <span>↺</span></button></div></div>`;
}
function fieldRow(id: FieldId,state: AppState): string {
  const field=fields.find((item)=>item.id===id)!;const checked=state.drafts.report.fields.includes(id);
  return `<button class="field-row ${checked?"selected":""}" data-action="toggle-field" data-field="${id}" aria-pressed="${checked}"><span class="field-check">${checked?"✓":""}</span><span class="field-copy"><b>${field.label}</b><small>${field.value}</small></span><span class="classification ${field.classification==="受限"?"restricted":""}">${field.classification}</span></button>`;
}
function report(state: AppState): string {
  const selected=state.drafts.report.fields.length;
  return `<div class="content-inner enter"><div class="eyebrow">CHAPTER 01 / 那一块红色</div><div class="scene-time">09:08 · 测试区外的工位</div><h2>先分清事实。<br/><em>再让 AI 帮忙。</em></h2>
  ${characterDialogue(guYanPortrait,"顾言","项目负责人",originalBrief.text)}<div class="section-label"><span>01</span>翻开记录，选择写入摘要的内容</div>
  <div class="field-list">${fields.map((field)=>fieldRow(field.id,state)).join("")}</div><div class="section-label"><span>02</span>选择处理环境</div>
  <div class="segmented"><button class="${state.drafts.report.tool==="internal"?"active":""}" data-action="set-tool" data-tool="internal"><b>公司批准的 AI 工作区</b><small>受公司账号、审计和数据策略管理</small></button>
  <button class="${state.drafts.report.tool==="external"?"active":""}" data-action="set-tool" data-tool="external"><b>个人使用的外部 AI</b><small>位于公司管理范围之外</small></button></div>
  <div class="selection-summary"><span>本次会实际提交</span><b>${selected} 项内容</b></div><button class="primary-button" data-action="confirm-report" ${selected?"":"disabled"}>提交所选内容并生成摘要 <span>→</span></button></div>`;
}
function reportResult(state: AppState): string {
  const r=evaluateRecords(state.records).report!;const selected=r.submittedFields.map((id)=>fieldLabels[id]).join("、");
  return `<div class="content-inner enter"><div class="eyebrow">CHAPTER 02 / 给它多少资料</div><h2>${r.complete?"摘要已经生成。":"还缺少完成任务的数据。"}<br/><em>${r.destination}</em></h2>
  <div class="result-card ${r.externalBoundary?"risk":"safe"}"><small>${r.externalBoundary?"BOUNDARY CROSSED":"BOUNDARY CONFIRMED"}</small><b>${r.externalBoundary?"数据进入了公司管理范围外的服务":"数据留在批准的处理环境内"}</b><p>实际提交字段：${selected||"无"}。</p></div>
  <div class="summary-document"><small>小芯生成摘要 / 等待顾言复核</small><p>${r.summary}</p></div><p class="explain">摘要很短，不代表提交给处理服务的原始内容很少。记录的是资料到达的处理边界。</p>
  <button class="primary-button" data-action="${r.complete?"continue-photo":"back-report"}">${r.complete?"去吃午饭":"补充摘要内容"} <span>→</span></button></div>`;
}
function hotspotControl(hotspot: PhotoHotspot,state: AppState): string {
  const item=photoHotspots.find((entry)=>entry.id===hotspot)!;const masked=state.drafts.photo.masked.includes(hotspot);
  return `<button class="hotspot-control ${masked?"done":""}" data-action="toggle-mask" data-hotspot="${hotspot}"><span>${masked?"✓":"+"}</span><b>${item.label}</b><small>${item.detail}</small></button>`;
}
function photo(state: AppState): string {
  return `<div class="content-inner enter"><div class="eyebrow">CHAPTER 03 / 合照里还有谁</div><div class="scene-time">12:20 · 茶水间</div><h2>这张照片很好。<br/><em>背景也说了很多。</em></h2>
  ${characterDialogue(xiaoManPortrait,"小满","品牌传播","大家好不容易拍齐一次。我想把这张留下来，也想让更多人看到我们做成了一件事。","warm")}
  <div class="section-label"><span>01</span>点击照片中的标记，检查并遮挡线索</div><div class="hotspot-list">${photoHotspots.map((item)=>hotspotControl(item.id,state)).join("")}</div>
  <div class="section-label"><span>02</span>决定如何处理</div><div class="segmented compact-options"><button class="${state.drafts.photo.action==="publish"?"active":""}" data-action="set-photo-action" data-value="publish"><b>模拟发布处理后的照片</b><small>进入公开内容预览</small></button>
  <button class="${state.drafts.photo.action==="draft"?"active":""}" data-action="set-photo-action" data-value="draft"><b>保存为草稿</b><small>合照保留，暂时不公开</small></button></div><button class="primary-button" data-action="confirm-photo">生成最终发布预览 <span>→</span></button></div>`;
}
function photoResult(state: AppState): string {
  const r=evaluateRecords(state.records).photo!;const visible=r.visible.map((id)=>hotspotLabels[id]).join("、");const safe=!r.published||r.visible.length===0;
  return `<div class="content-inner enter"><div class="eyebrow">DECISION AUDIT / 02</div><h2>${r.published?"发布预览已生成。":"照片保存在草稿中。"}<br/><em>${safe?"画面边界清晰":"仍有信息留在画面里"}</em></h2>
  <div class="result-card ${safe?"safe":"risk"}"><small>${safe?"PUBLIC VIEW CHECKED":"VISIBLE CLUES FOUND"}</small><b>${!r.published?"本次没有产生公开内容":r.visible.length===0?"三个预设敏感区域均已处理":`仍可识别：${visible}`}</b><p>处理区域：${r.protectedCount} / 3。系统只记录本次模拟发布结果。</p></div>
  ${characterDialogue(xiaoManPortrait,"小满","品牌传播",!r.published?"那就先把合照留作内部纪念。等素材核准后，我们再发。":r.visible.length===0?"合照留下了。你提醒的那些位置，我以后拍之前就会先看。":"原来一张照片里会留下这么多项目线索，我先记下来。","warm")}
  <p class="explain">照片里的屏幕、标签和反光，也都是资料。相同的批次号还能把不同信息关联起来。</p><button class="primary-button" data-action="continue-authorization">查看合作方的新消息 <span>→</span></button></div>`;
}
function permissionToggle(label:string,detail:string,active:boolean,action:string,fixed=false): string {
  return `<button class="permission-row ${active?"enabled":"disabled"} ${fixed?"fixed":""}" data-action="${fixed?"":action}" ${fixed?"disabled":""} aria-pressed="${active}"><span class="permission-icon">${active?"✓":"×"}</span><span><b>${label}</b><small>${detail}</small></span><i>${active?"允许":"不允许"}</i></button>`;
}
function authorization(state: AppState): string {
  const d=state.drafts.authorization;
  return `<div class="content-inner enter"><div class="eyebrow">CHAPTER 04 / “相关资料一起带上”</div><div class="scene-time">15:35 · 评审结束后</div><h2>一句“相关资料”，<br/><em>到底包括多少？</em></h2>
  <div class="brief-card warning-brief"><small>许航 · 合作方联系人</small><p>${untrustedInstruction.text}</p><button class="inline-link" data-action="toggle-source">${d.sourceOpen?"收起任务对照":"查看原始要求与这句话的差异"} →</button></div>
  ${d.sourceOpen?`<div class="source-compare"><div><small>原始工作要求</small><p>${originalBrief.text}</p></div><div class="untrusted"><small>${untrustedInstruction.source}</small><p>${untrustedInstruction.text}</p></div></div>`:""}
  <div class="section-label"><span>01</span>小芯可以读取什么</div><div class="permission-list">${permissionToggle("已核准的复测通知","包含时间与对接安排",true,"",true)}${permissionToggle("整个项目目录","可能找到内部异常分析与原始记录",d.readRaw,"toggle-read-raw")}</div>
  <div class="section-label"><span>02</span>发给谁</div><div class="permission-list">${permissionToggle("许航 · 已核验项目联系人","本次复测任务对接人",true,"",true)}${permissionToggle("旧邮件中的抄送地址","不属于本次任务的核验联系人",d.backupRecipient,"toggle-backup")}</div>
  <div class="section-label"><span>03</span>执行方式</div><div class="segmented compact-options"><button class="${d.action==="draft"?"active":""}" data-action="set-agent-action" data-value="draft"><b>生成草稿，人工审核</b></button><button class="${d.action==="send"?"active":""}" data-action="set-agent-action" data-value="send"><b>确认后直接模拟发送</b></button></div>
  <button class="primary-button" data-action="confirm-authorization">确认这份执行计划 <span>→</span></button></div>`;
}
function execution(state: AppState): string {
  const r=evaluateRecords(state.records).authorization!;const steps=[["读取已核准的复测通知","done"],["检索整个项目目录",r.readRaw?"done-risk":"blocked"],["生成复测邮件","done"],["加入旧邮件中的抄送地址",r.recipients.length>1?"done-risk":"blocked"],[r.sent?"模拟发送邮件":"停在人工审核前",r.sent?"done":"blocked"]];
  return `<div class="content-inner enter"><div class="eyebrow">CHAPTER 05 / 这个编号又出现了</div><h2>上午的批次号，<br/><em>出现在最后一份附件里。</em></h2>
  <div class="execution-list">${steps.map((step,index)=>`<div class="execution-step ${step[1]}"><span>${String(index+1).padStart(2,"0")}</span><b>${step[0]}</b><i>${step[1]==="blocked"?"已阻断":step[1]==="done-risk"?"已执行":"完成"}</i></div>`).join("")}</div>
  ${characterDialogue(guYanPortrait,"顾言","项目负责人","合作方需要的是复测安排。把范围核清楚，再发。")}
  <div class="result-card ${r.rawSent||r.recipients.length>1?"risk":"safe"}"><small>ACTUAL RESULT</small><b>收件范围：${r.recipients.join("、")}</b><p>${r.rawSent?"执行内容包含上午的内部异常记录与同一批次编号。":"执行内容不包含上午的内部原始记录。"}</p></div>
  <button class="primary-button" data-action="show-evidence">回看这一天的数据去向 <span>→</span></button></div>`;
}
function evidenceDetail(item: EvidenceItem|undefined): string {
  if(!item)return `<div class="empty-detail"><span>⌁</span><p>选择左侧或下方的一块证据，查看它来自哪次操作。</p></div>`;
  return `<div class="evidence-detail enter"><small>FRAGMENT ${item.index} / 操作事实</small><h3>${item.label}</h3><p>${item.fact}</p><div class="inference"><small>可能推断</small><p>${item.inference}</p></div><div class="control-note"><small>关键控制</small><p>${item.control}</p></div></div>`;
}
function evidence(state: AppState): string {
  const e=evaluateRecords(state.records);const focused=e.evidence.find((item)=>item.id===state.replay.target);
  return `<div class="content-inner enter"><div class="eyebrow">CHAPTER 06 / 拼起今天</div><h2>没人要求你泄密。<br/><em>信息却可能一步步越过边界。</em></h2><p class="lead">点击三张证据卡，看看同一个批次号如何出现在摘要、合照和邮件中。只展示真实发生的流转。</p>
  <div class="evidence-tabs">${e.evidence.map((item)=>`<button class="${state.replay.target===item.id?"active":""}" data-action="focus-evidence" data-target="${item.id}"><span class="${item.status}"></span><b>${item.index}</b>${item.label}</button>`).join("")}</div>${evidenceDetail(focused)}
  <div class="evidence-summary"><span><b>${e.exposureCount}</b> 条外部路径</span><span><b>${e.containedCount}</b> 条受控／未公开路径</span></div><button class="primary-button" data-action="continue-replay">回到一个决定之前 <span>↺</span></button></div>`;
}
function replay(state: AppState): string {
  const targets:Array<{id:ReplayTarget;label:string}>=[{id:"report",label:"测试摘要"},{id:"photo",label:"项目照片"},{id:"authorization",label:"智能体授权"}];
  return `<div class="content-inner enter"><div class="eyebrow">DECISION REPLAY / 模拟另一种选择</div><h2>只改一个决定。<br/><em>看看路径在哪里停止。</em></h2><p class="lead">这是一次假设回放。原始操作记录会保留，其他节点不会随之消失。</p>
  <div class="replay-options">${targets.map((target,index)=>`<button class="${state.replay.target===target.id&&state.replay.comparison?"active":""}" data-action="apply-replay" data-target="${target.id}"><span>0${index+1}</span><b>${target.label}</b><small>模拟安全边界</small></button>`).join("")}</div>
  ${state.replay.comparison?`<div class="comparison"><div><small>原始记录</small><p>${state.replay.comparison.before}</p></div><div><small>修改后</small><p>${state.replay.comparison.after}</p></div></div>`:`<div class="empty-comparison">选择一个节点，生成前后对照。</div>`}
  <button class="primary-button" data-action="show-debrief" ${state.replay.comparison?"":"disabled"}>查看个人复盘 <span>→</span></button></div>`;
}
function debrief(state: AppState): string {
  const e=evaluateRecords(state.records);const title=e.exposureCount===0?"任务完成，信息停在了应有的位置。":e.exposureCount===1?"一条路径越过了原定边界。":"多个碎片形成了可关联的线索。";
  return `<div class="content-inner enter"><div class="eyebrow">FINAL REPORT / 体验复盘</div><h2>${title}<br/><em>记录来自你的实际操作。</em></h2>
  <div class="debrief-stats"><div><small>业务任务</small><b>${e.taskComplete?"已完成":"未完成"}</b></div><div><small>外部路径</small><b class="${e.exposureCount?"danger-text":""}">${e.exposureCount}</b></div><div><small>受控路径</small><b>${e.containedCount}</b></div></div>
  <div class="report-list">${e.evidence.map((item)=>`<div class="report-row"><span><i class="${item.status}"></i><b>${item.label}</b><small>${item.fact}</small></span><em>${item.status==="exposed"?"需复核":item.status==="not-shared"?"未公开":"边界内"}</em></div>`).join("")}</div>
  ${characterDialogue(linChePortrait,"林澈","产品工程师",e.exposureCount===0?"该交付的内容到了，该留下的内容还在。":"最后一次确认阻止不了已经发生的流转，但能阻止下一步，也能让后续处置从真实记录开始。","player")}
  <div class="final-quote">半导体安全不只在设备和参数里，<strong>也在每一次资料选择、公开发布和 AI 授权里。</strong></div><div class="button-grid"><button class="secondary-button" data-action="restart">重新体验</button><button class="primary-button" data-action="print">保存／打印复盘</button></div></div>`;
}
function contentForScene(state: AppState): string {
  switch(state.scene){case"cover":return cover();case"cold-open":return coldOpen();case"report":return report(state);case"report-result":return reportResult(state);case"photo":return photo(state);case"photo-result":return photoResult(state);case"authorization":return authorization(state);case"execution":return execution(state);case"evidence":return evidence(state);case"replay":return replay(state);case"debrief":return debrief(state);default:return cover();}
}
export function renderApp(state: AppState): string {
  const evaluation=evaluateRecords(state.records);
  return `<div class="app-shell"><header class="topbar"><div class="brand"><span class="brand-mark"><i></i><i></i><i></i><i></i></span><span><b>澄芯科技 · 信息安全互动实验</b><small>SEMICONDUCTOR SECURITY STORY</small></span></div>
  <div class="top-actions">${state.mode==="demo"?'<span class="demo-badge">演示模式</span>':'<span class="live-badge"><i></i>互动记录中</span>'}<button class="icon-button" data-action="toggle-sound" aria-label="切换声音">${state.sound?"声音：开":"声音：关"}</button><button class="icon-button" data-action="restart">重新开始</button></div></header>
  ${progress(state)}<main class="experience-stage scene-${state.scene}">${visualForScene(state,evaluation)}<section class="content-panel" aria-live="polite">${contentForScene(state)}</section></main>
  <footer><span>原创虚构情景 · 所有数据均为演示内容</span><span>本地运行 · 不上传、不发布、不发送任何数据</span></footer></div>`;
}
