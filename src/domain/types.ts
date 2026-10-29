export type SceneId =
  | "cover" | "prologue" | "anomaly" | "classify" | "ai-brief" | "review"
  | "photo-shoot" | "photo-inspect" | "copy-edit" | "partner-call" | "free-action"
  | "agent-plan" | "link-clues" | "final-mail" | "evidence" | "debrief"
  | "cold-open" | "report" | "report-result" | "photo" | "photo-result"
  | "authorization" | "execution" | "replay";

export type ExperienceMode = "full" | "demo";
export type ToolId = "internal" | "external";
export type FieldId = "batch" | "yield" | "customer" | "project" | "notes";
export type PhotoHotspot = "screen" | "document" | "reflection";
export type PhotoAction = "publish" | "draft";
export type AgentAction = "draft" | "send";
export type ReplayTarget = "report" | "photo" | "authorization";
export type ClassifyItemId = "phenomenon" | "cause" | "next";
export type ClassifyBucket = "fact" | "hypothesis" | "action";
export type PhotoShot = "emotion" | "clean" | "balanced";
export type CopyChoice = "passed" | "progress" | "team";
export type PartnerChoice = "clarify" | "full" | "schedule" | "wait";
export type FreeAction = "message-gu" | "ask-cheng" | "check-photo" | "ask-ai";
export type ClueId = "morning" | "photo" | "attachment";

export interface ReportRecord { tool: ToolId; fields: FieldId[]; confirmedAt: string; }
export interface PhotoRecord { masked: PhotoHotspot[]; action: PhotoAction; confirmedAt: string; }
export interface AuthorizationRecord { readRaw: boolean; backupRecipient: boolean; action: AgentAction; confirmedAt: string; }
export interface Records { report?: ReportRecord; photo?: PhotoRecord; authorization?: AuthorizationRecord; }

export interface Drafts {
  report: { tool: ToolId; fields: FieldId[]; };
  photo: { masked: PhotoHotspot[]; action: PhotoAction; };
  authorization: { readRaw: boolean; backupRecipient: boolean; action: AgentAction; sourceOpen: boolean; };
}

export interface StoryState {
  dialogueStep: number;
  timeCost: number;
  anomalyFound: string[];
  classifications: Partial<Record<ClassifyItemId, ClassifyBucket>>;
  reviewedSources: string[];
  photoShot?: PhotoShot;
  copyChoice?: CopyChoice;
  partnerChoice?: PartnerChoice;
  freeActions: FreeAction[];
  linkedClues: ClueId[];
  wordingAccurate: boolean;
}

export interface ReplayState { target?: ReplayTarget; comparison?: { before: string; after: string; }; }
export interface AppState { version: 2; scene: SceneId; mode: ExperienceMode; sound: boolean; drafts: Drafts; story: StoryState; records: Records; replay: ReplayState; }
export interface ReportResult { complete: boolean; externalBoundary: boolean; submittedFields: FieldId[]; destination: string; summary: string; }
export interface PhotoResult { published: boolean; visible: PhotoHotspot[]; protectedCount: number; }
export interface AuthorizationResult { readRaw: boolean; sent: boolean; generatedDraft: boolean; recipients: string[]; rawSent: boolean; blocked: string[]; }
export type EvidenceStatus = "exposed" | "contained" | "not-shared";
export interface EvidenceItem { id: ReplayTarget; index: string; label: string; status: EvidenceStatus; fact: string; inference: string; control: string; }
export interface Evaluation { report?: ReportResult; photo?: PhotoResult; authorization?: AuthorizationResult; evidence: EvidenceItem[]; exposureCount: number; containedCount: number; taskComplete: boolean; }

export const fieldLabels: Record<FieldId, string> = {
  batch: "样品批次", yield: "已确认现象", customer: "合作方名称", project: "项目代号", notes: "原因假设",
};

export const hotspotLabels: Record<PhotoHotspot, string> = {
  screen: "屏幕测试图", document: "样品盒标签", reflection: "玻璃墙中的白板内容",
};
