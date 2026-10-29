import type { AppState, Records, SceneId } from "../domain/types";

const STORAGE_KEY = "last-authorization-h5:v2";

export const sceneOrder: SceneId[] = [
  "cover", "prologue", "anomaly", "classify", "ai-brief", "review",
  "photo-shoot", "photo-inspect", "copy-edit", "partner-call", "free-action",
  "agent-plan", "link-clues", "final-mail", "evidence", "debrief",
];

export function createInitialState(): AppState {
  return {
    version: 2,
    scene: "cover",
    mode: "full",
    sound: false,
    drafts: {
      report: {
        tool: "internal",
        fields: ["batch", "yield"],
      },
      photo: {
        masked: [],
        action: "publish",
      },
      authorization: {
        readRaw: true,
        backupRecipient: true,
        action: "send",
        sourceOpen: false,
      },
    },
    story: {
      dialogueStep: 0,
      timeCost: 0,
      anomalyFound: [],
      classifications: {},
      reviewedSources: [],
      freeActions: [],
      linkedClues: [],
      wordingAccurate: false,
    },
    records: {},
    replay: {},
  };
}

export function createDemoState(): AppState {
  const state = createInitialState();
  state.mode = "demo";
  state.scene = "final-mail";
  state.story.dialogueStep = 2;
  state.story.linkedClues = ["morning", "photo", "attachment"];
  state.records = {
    report: {
      tool: "internal",
      fields: ["batch", "yield"],
      confirmedAt: "10:16",
    },
    photo: {
      masked: ["screen", "reflection"],
      action: "publish",
      confirmedAt: "12:42",
    },
  };
  return state;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.version !== 2 || !sceneOrder.includes(parsed.scene)) {
      return createInitialState();
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable for file URLs or restricted browser sessions.
    // The in-memory experience remains usable without persistence.
  }
}

export function clearState(): AppState {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Reset the in-memory state even when browser storage is unavailable.
  }
  return createInitialState();
}

export function cloneRecords(records: Records): Records {
  return {
    report: records.report ? { ...records.report, fields: [...records.report.fields] } : undefined,
    photo: records.photo ? { ...records.photo, masked: [...records.photo.masked] } : undefined,
    authorization: records.authorization ? { ...records.authorization } : undefined,
  };
}
