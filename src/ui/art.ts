import type { AppState, Evaluation } from "../domain/types";
import { fields, photoHotspots, sceneMeta } from "../scenario/content";
import guYanPortrait from "../assets/game/gu-yan-web.png?inline";
import linChePortrait from "../assets/game/lin-che-web.png?inline";
import morningAnomaly from "../assets/game/morning-anomaly-web.jpg?inline";
import xiaoManPortrait from "../assets/game/xiao-man-web.png?inline";

const chipSvg = `
<svg class="chip-svg" viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2">
<rect x="25" y="25" width="70" height="70" rx="12"/><rect x="36" y="36" width="48" height="48" rx="7" stroke-dasharray="4 4"/>
<path d="M14 42h11M14 60h11M14 78h11M95 42h11M95 60h11M95 78h11M42 14v11M60 14v11M78 14v11M42 95v11M60 95v11M78 95v11"/><circle cx="60" cy="60" r="14" fill="currentColor" opacity=".12"/></g></svg>`;

function coverArt(): string {
  return `<div class="wafer-stage" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>
  <div class="wafer-disc"><div class="wafer-grid"></div>${chipSvg}</div><div class="scan-beam"></div>
  <div class="cover-cast"><img src="${guYanPortrait}" alt=""/><img src="${linChePortrait}" alt=""/><img src="${xiaoManPortrait}" alt=""/></div>
  <span class="telemetry tele-1">LOT S7-V23</span><span class="telemetry tele-2">PROJECT / STELLAR BRIDGE</span><span class="telemetry tele-3">DELIVERY DAY</span></div>`;
}

function mailArt(state: AppState): string {
  const authorization = state.records.authorization;
  const risky = Boolean(authorization?.readRaw || authorization?.backupRecipient);
  return `<div class="cinematic-frame mail-scene"><div class="office-glow"></div><img class="scene-character cold-open-character" src="${linChePortrait}" alt="林澈"/><div class="mail-window">
  <div class="window-bar"><span></span><b>交付邮件 / 等待授权</b><small>16:58</small></div>
  <div class="mail-row"><span>收件人</span><strong>远岚封测 · 许航</strong></div><div class="mail-row"><span>主题</span><strong>星桥 S7 复测安排</strong></div>
  <div class="mail-body"><p>您好，以下是下一轮复测时间与对接安排。</p><div class="attachment ${risky ? "warning" : ""}"><i>PDF</i><span>${risky ? "S7_内部异常记录.pdf" : "S7_复测通知.pdf"}</span></div></div>
  <div class="authorize-button">确认并${authorization?.action === "draft" ? "保存草稿" : "发送"}</div></div>
  <div class="message-bubble"><small>顾言 · 项目负责人</small>合作方需要的是复测安排。把范围核清楚，再发。</div><div class="cursor-hold"></div></div>`;
}

function reportArt(state: AppState): string {
  const draft = state.drafts.report;
  return `<div class="workstation report-stage"><img class="scene-image" src="${morningAnomaly}" alt="林澈与顾言查看异常测试结果"/><div class="scene-image-shade"></div><div class="data-screen story-overlay"><div class="window-bar"><span></span><b>星桥 S7 / 异常记录</b><small>INTERNAL</small></div>
  <div class="yield-chart"><div class="chart-grid"></div><svg viewBox="0 0 360 130" preserveAspectRatio="none" aria-hidden="true"><path d="M0 105 L55 88 L110 92 L168 64 L224 71 L285 43 L360 32"/><path class="line-two" d="M0 116 L62 109 L125 111 L182 91 L246 95 L310 69 L360 75"/></svg></div>
  <div class="data-table">${fields.map((field) => `<div class="data-row ${draft.fields.includes(field.id) ? "selected" : ""}"><span>${field.label}</span><b>${field.value}</b><i>${field.classification}</i></div>`).join("")}</div></div>
  <div class="destination-node ${draft.tool}"><span>${draft.tool === "internal" ? "批准工作区" : "外部 AI 服务"}</span><b>${draft.fields.length} 个字段待处理</b></div>
  <svg class="data-flow" viewBox="0 0 600 500" preserveAspectRatio="none" aria-hidden="true"><path class="${draft.tool === "external" ? "risk-path" : ""}" d="M270 290 C390 300 410 395 520 400"/></svg></div>`;
}

function photoArt(state: AppState): string {
  const masked = state.drafts.photo.masked;
  return `<div class="photo-stage"><div class="phone-camera"><div class="camera-bar"><span>12:36</span><b>发布预览</b><small>完成</small></div>
  <div class="office-photo"><div class="ceiling-lights"></div><div class="team-portrait team-gu"><img src="${guYanPortrait}" alt="顾言"/></div><div class="team-portrait team-lin"><img src="${linChePortrait}" alt="林澈"/></div><div class="team-portrait team-xiao"><img src="${xiaoManPortrait}" alt="小满"/></div>
  <div class="project-screen"><strong>S7 / LOW TEMP</strong><span>ANOMALY MAP · REVIEW</span></div><div class="sample-box"><b>S7-V23</b><span>SAMPLE</span></div><div class="glass-reflection">复测 / 11.04<br/>内部分析待确认</div>
  ${photoHotspots.map((hotspot) => `<button class="photo-hotspot ${hotspot.className} ${masked.includes(hotspot.id) ? "masked" : ""}" data-action="toggle-mask" data-hotspot="${hotspot.id}" aria-pressed="${masked.includes(hotspot.id)}" aria-label="${masked.includes(hotspot.id) ? "取消遮挡" : "遮挡"}${hotspot.label}"><span>${masked.includes(hotspot.id) ? "已遮挡" : "+"}</span></button>`).join("")}</div>
  <div class="social-copy"><b>和这群人一起，把难题往前推了一步。</b><span>星桥项目阶段记录 · 发布前预览</span></div></div><div class="mask-counter"><strong>${masked.length}</strong><span>/ 3 个区域已处理</span></div></div>`;
}

function agentArt(state: AppState): string {
  const draft = state.drafts.authorization;
  return `<div class="agent-stage"><img class="scene-character agent-character" src="${linChePortrait}" alt="林澈"/><svg class="agent-links" viewBox="0 0 600 520" preserveAspectRatio="none" aria-hidden="true">
  <path class="safe-link" d="M300 250 C220 220 175 145 100 112"/><path class="${draft.readRaw ? "risk-link" : "blocked-link"}" d="M300 250 C225 295 180 380 95 410"/>
  <path class="safe-link" d="M300 250 C390 210 435 150 518 112"/><path class="${draft.backupRecipient ? "risk-link" : "blocked-link"}" d="M300 250 C390 300 440 390 520 410"/></svg>
  <div class="agent-core"><span>AI</span><b>小芯</b><small>执行计划</small></div>
  <div class="agent-node node-summary"><small>READ</small><b>核准复测通知</b><span>允许</span></div><div class="agent-node node-raw ${draft.readRaw ? "danger" : "blocked"}"><small>READ</small><b>整个项目目录</b><span>${draft.readRaw ? "允许" : "阻断"}</span></div>
  <div class="agent-node node-verified"><small>RECIPIENT</small><b>许航 · 已核验</b><span>允许</span></div><div class="agent-node node-backup ${draft.backupRecipient ? "danger" : "blocked"}"><small>RECIPIENT</small><b>旧邮件抄送地址</b><span>${draft.backupRecipient ? "允许" : "移除"}</span></div>
  <div class="untrusted-card"><small>“相关背景”被展开后的计划</small><p>检索项目目录，建议关联资料，并复用旧邮件收件范围。</p></div></div>`;
}

function evidenceArt(evaluation: Evaluation): string {
  return `<div class="evidence-stage"><svg class="evidence-links" viewBox="0 0 600 520" preserveAspectRatio="none" aria-hidden="true"><path d="M120 112 C180 210 230 230 300 260"/><path d="M480 112 C420 210 370 230 300 260"/><path d="M300 445 C300 380 300 330 300 260"/></svg>
  <div class="evidence-core">${chipSvg}<b>S7-V23</b><span>同一批次的信息线索</span></div>
  ${evaluation.evidence.map((item, index) => `<button class="evidence-card evidence-${index + 1} ${item.status}" data-action="focus-evidence" data-target="${item.id}"><small>FRAGMENT ${item.index}</small><b>${item.label}</b><span>${item.status === "exposed" ? "存在外部路径" : item.status === "not-shared" ? "未公开" : "边界内"}</span></button>`).join("")}</div>`;
}

function replayArt(state: AppState): string {
  const comparison = state.replay.comparison;
  return `<div class="replay-stage"><div class="timeline-line"></div><div class="timeline-card before"><small>ORIGINAL RECORD</small><b>原始操作</b><p>${comparison?.before ?? "选择一个节点，模拟修改当时的决定。"}</p></div>
  <div class="rewind-symbol">↺</div><div class="timeline-card after"><small>SIMULATED ALTERNATIVE</small><b>修改后的路径</b><p>${comparison?.after ?? "原始记录将被保留，不会被覆盖。"}</p></div></div>`;
}

export function visualForScene(state: AppState, evaluation: Evaluation): string {
  const meta = sceneMeta[state.scene] ?? sceneMeta.cover!;
  let artwork = coverArt();
  if (state.scene === "cold-open") artwork = mailArt(state);
  if (state.scene === "report" || state.scene === "report-result") artwork = reportArt(state);
  if (state.scene === "photo" || state.scene === "photo-result") artwork = photoArt(state);
  if (state.scene === "authorization" || state.scene === "execution") artwork = agentArt(state);
  if (state.scene === "evidence" || state.scene === "debrief") artwork = evidenceArt(evaluation);
  if (state.scene === "replay") artwork = replayArt(state);
  return `<section class="visual-panel" aria-label="${meta.label}"><div class="frame-corner corner-tl"></div><div class="frame-corner corner-tr"></div><div class="frame-corner corner-bl"></div><div class="frame-corner corner-br"></div>
  <div class="visual-meta"><span>● ${meta.code}</span><span>${meta.time}</span></div>${artwork}<div class="visual-footer"><span>${meta.label}</span><span>LOCAL SIMULATION / S7</span></div></section>`;
}
