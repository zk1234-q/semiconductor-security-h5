import { fieldLabels, hotspotLabels, type AuthorizationResult, type Evaluation, type EvidenceItem, type PhotoResult, type Records, type ReplayTarget, type ReportResult } from "./types";

function reportResult(records: Records): ReportResult | undefined {
  const record = records.report;
  if (!record) return undefined;
  const complete = record.fields.includes("batch") && record.fields.includes("yield");
  const externalBoundary = record.tool === "external" && record.fields.length > 0;
  const submitted = record.fields.map((field) => fieldLabels[field]).join("、");
  return {
    complete,
    externalBoundary,
    submittedFields: record.fields,
    destination: record.tool === "internal" ? "公司批准的 AI 工作区" : "公司管理范围外的 AI 服务",
    summary: complete ? `批次 S7-V23 至 V25 在低温条件下出现参数偏移，建议按核准计划复测。处理内容：${submitted}。` : "缺少样品批次或已确认现象，暂时无法形成可复核的异常摘要。",
  };
}

function photoResult(records: Records): PhotoResult | undefined {
  const record = records.photo;
  if (!record) return undefined;
  const hotspots = ["screen", "document", "reflection"] as const;
  return {
    published: record.action === "publish",
    visible: record.action === "publish" ? hotspots.filter((hotspot) => !record.masked.includes(hotspot)) : [],
    protectedCount: record.masked.length,
  };
}

function authorizationResult(records: Records): AuthorizationResult | undefined {
  const record = records.authorization;
  if (!record) return undefined;
  const sent = record.action === "send";
  const blocked: string[] = [];
  if (!record.readRaw) blocked.push("整个项目目录未向本次任务开放");
  if (!record.backupRecipient) blocked.push("旧邮件中的抄送地址被移除");
  if (!sent) blocked.push("外发动作停在人工审核前");
  return {
    readRaw: record.readRaw,
    sent,
    generatedDraft: true,
    recipients: ["许航 · 已核验合作方联系人", ...(record.backupRecipient ? ["旧邮件中的抄送地址"] : [])],
    rawSent: sent && record.readRaw,
    blocked,
  };
}

function evidenceItems(report: ReportResult | undefined, photo: PhotoResult | undefined, authorization: AuthorizationResult | undefined): EvidenceItem[] {
  const evidence: EvidenceItem[] = [];
  if (report) {
    evidence.push({
      id: "report", index: "01", label: "AI 数据处理",
      status: report.externalBoundary ? "exposed" : "contained",
      fact: report.externalBoundary ? `${report.submittedFields.map((field) => fieldLabels[field]).join("、")}进入了公司管理范围外的服务。` : `数据在${report.destination}内处理。`,
      inference: report.externalBoundary ? "若这些内容与照片或邮件中的批次号关联，可能暴露测试表现与项目阶段。" : "本次处理没有产生新的外部数据去向。",
      control: "提交前检查数据内容和处理目的地。",
    });
  }
  if (photo) {
    const visible = photo.visible.map((hotspot) => hotspotLabels[hotspot]);
    evidence.push({
      id: "photo", index: "02", label: "社交内容发布",
      status: !photo.published ? "not-shared" : visible.length > 0 ? "exposed" : "contained",
      fact: !photo.published ? "照片保存在草稿中，没有模拟公开发布。" : visible.length > 0 ? `发布画面仍可见：${visible.join("、")}。` : "发布前已处理三个敏感区域。",
      inference: visible.length > 0 ? "照片中的 S7-V23 批次号可与测试记录关联，并帮助推断异常与复测节点。" : "公开画面中没有保留预设的项目线索。",
      control: "分享前检查整个画面、文字和反射区域。",
    });
  }
  if (authorization) {
    const riskySend = authorization.sent && (authorization.rawSent || authorization.recipients.length > 1);
    evidence.push({
      id: "authorization", index: "03", label: "AI 智能体授权",
      status: riskySend ? "exposed" : "contained",
      fact: riskySend
        ? `邮件已模拟发送；收件范围 ${authorization.recipients.length} 个，${authorization.rawSent ? "包含内部原始明细" : "未包含内部原始明细"}。`
        : authorization.sent ? "邮件只向许航发送核准的复测通知。" : "邮件已生成草稿，尚未模拟发送。",
      inference: riskySend ? "模糊的“相关背景”被展开为更大的读取或发送范围，因而形成外发路径。" : "额外范围被权限或人工审核控制在执行边界内。",
      control: "读取、生成和发送需要分别确定范围。",
    });
  }
  return evidence;
}

export function evaluateRecords(records: Records): Evaluation {
  const report = reportResult(records);
  const photo = photoResult(records);
  const authorization = authorizationResult(records);
  const evidence = evidenceItems(report, photo, authorization);
  return {
    report, photo, authorization, evidence,
    exposureCount: evidence.filter((item) => item.status === "exposed").length,
    containedCount: evidence.filter((item) => item.status !== "exposed").length,
    taskComplete: Boolean(report?.complete && records.photo && authorization),
  };
}

export function correctedRecords(records: Records, target: ReplayTarget): Records {
  const corrected: Records = {
    report: records.report ? { ...records.report, fields: [...records.report.fields] } : undefined,
    photo: records.photo ? { ...records.photo, masked: [...records.photo.masked] } : undefined,
    authorization: records.authorization ? { ...records.authorization } : undefined,
  };
  if (target === "report" && corrected.report) { corrected.report.tool = "internal"; corrected.report.fields = ["batch", "yield"]; }
  if (target === "photo" && corrected.photo) { corrected.photo.masked = ["screen", "document", "reflection"]; corrected.photo.action = "publish"; }
  if (target === "authorization" && corrected.authorization) { corrected.authorization.readRaw = false; corrected.authorization.backupRecipient = false; corrected.authorization.action = "draft"; }
  return corrected;
}

export function describeCorrection(records: Records, target: ReplayTarget): { before: string; after: string } {
  const before = evaluateRecords(records).evidence.find((item) => item.id === target);
  const after = evaluateRecords(correctedRecords(records, target)).evidence.find((item) => item.id === target);
  return { before: before?.fact ?? "该节点尚未形成记录。", after: after?.fact ?? "该节点尚未形成记录。" };
}
