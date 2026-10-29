import "./styles.css";
import type {
  AgentAction,
  ClassifyBucket,
  ClassifyItemId,
  ClueId,
  CopyChoice,
  FieldId,
  FreeAction,
  PartnerChoice,
  PhotoAction,
  PhotoHotspot,
  PhotoShot,
  SceneId,
  ToolId,
} from "./domain/types";
import { clearState, createDemoState, loadState, saveState } from "./app/state";
import { renderApp } from "./ui/game-render";

const root = document.querySelector<HTMLDivElement>("#app")!;

let state = loadState();

function render(scroll = false): void {
  root.innerHTML = renderApp(state);
  saveState(state);
  if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
}

function toggleInList<T>(items: T[], value: T): T[] {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function targetFrom(element: HTMLElement, key: string): string | undefined {
  return element.dataset[key];
}

function go(scene: SceneId): void {
  state.scene = scene;
  state.story.dialogueStep = 0;
}

function confirmReport(): void {
  state.records.report = {
    tool: state.drafts.report.tool,
    fields: [...state.drafts.report.fields],
    confirmedAt: "10:16",
  };
  go("review");
}

function confirmPhoto(): void {
  state.records.photo = {
    masked: [...state.drafts.photo.masked],
    action: state.drafts.photo.action,
    confirmedAt: "12:42",
  };
  go("copy-edit");
}

function confirmAuthorization(): void {
  state.records.authorization = {
    readRaw: state.drafts.authorization.readRaw,
    backupRecipient: state.drafts.authorization.backupRecipient,
    action: state.drafts.authorization.action,
    confirmedAt: "17:52",
  };
  go("evidence");
}

root.addEventListener("click", (event) => {
  const element = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!element || element instanceof HTMLButtonElement && element.disabled) return;

  const action = element.dataset.action;
  let shouldScroll = false;

  switch (action) {
    case "start":
      go("prologue");
      shouldScroll = true;
      break;
    case "start-demo":
      state = createDemoState();
      shouldScroll = true;
      break;
    case "advance-dialogue":
      state.story.dialogueStep += 1;
      break;
    case "rewind-day":
      go("anomaly");
      shouldScroll = true;
      break;
    case "inspect-anomaly": {
      const clue = targetFrom(element, "clue");
      if (clue) state.story.anomalyFound = toggleInList(state.story.anomalyFound, clue);
      break;
    }
    case "continue-classify":
      go("classify");
      shouldScroll = true;
      break;
    case "set-classification": {
      const item = targetFrom(element, "item") as ClassifyItemId;
      const bucket = targetFrom(element, "bucket") as ClassifyBucket;
      state.story.classifications[item] = bucket;
      break;
    }
    case "confirm-classify":
      go("ai-brief");
      shouldScroll = true;
      break;
    case "toggle-field": {
      const field = targetFrom(element, "field") as FieldId;
      state.drafts.report.fields = toggleInList(state.drafts.report.fields, field);
      break;
    }
    case "set-tool":
      state.drafts.report.tool = targetFrom(element, "tool") as ToolId;
      break;
    case "confirm-report":
      confirmReport();
      shouldScroll = true;
      break;
    case "review-source": {
      const source = targetFrom(element, "source");
      if (source) state.story.reviewedSources = toggleInList(state.story.reviewedSources, source);
      break;
    }
    case "continue-photo-shoot":
      go("photo-shoot");
      shouldScroll = true;
      break;
    case "choose-shot":
      state.story.photoShot = targetFrom(element, "shot") as PhotoShot;
      break;
    case "confirm-shot":
      go("photo-inspect");
      shouldScroll = true;
      break;
    case "toggle-mask": {
      const hotspot = targetFrom(element, "hotspot") as PhotoHotspot;
      state.drafts.photo.masked = toggleInList(state.drafts.photo.masked, hotspot);
      break;
    }
    case "retake-photo":
      state.story.photoShot = "balanced";
      state.story.timeCost += 8;
      state.drafts.photo.masked = ["screen", "document", "reflection"];
      break;
    case "set-photo-action":
      state.drafts.photo.action = targetFrom(element, "value") as PhotoAction;
      break;
    case "confirm-photo":
      confirmPhoto();
      shouldScroll = true;
      break;
    case "choose-copy":
      state.story.copyChoice = targetFrom(element, "copy") as CopyChoice;
      break;
    case "confirm-copy":
      go("partner-call");
      shouldScroll = true;
      break;
    case "choose-partner": {
      const choice = targetFrom(element, "choice") as PartnerChoice;
      state.story.partnerChoice = choice;
      if (choice === "clarify") {
        state.story.timeCost += 5;
        state.drafts.authorization.readRaw = false;
        state.drafts.authorization.backupRecipient = false;
      } else if (choice === "schedule" || choice === "wait") {
        state.drafts.authorization.readRaw = false;
        state.drafts.authorization.backupRecipient = false;
        if (choice === "wait") state.drafts.authorization.action = "draft";
      } else {
        state.drafts.authorization.readRaw = true;
      }
      go("free-action");
      shouldScroll = true;
      break;
    }
    case "choose-free-action": {
      const choice = targetFrom(element, "free") as FreeAction;
      state.story.freeActions = toggleInList(state.story.freeActions, choice);
      if (state.story.freeActions.length > 2) state.story.freeActions = state.story.freeActions.slice(-2);
      break;
    }
    case "continue-agent-plan":
      go("agent-plan");
      shouldScroll = true;
      break;
    case "toggle-read-raw":
      state.drafts.authorization.readRaw = !state.drafts.authorization.readRaw;
      break;
    case "toggle-backup":
      state.drafts.authorization.backupRecipient = !state.drafts.authorization.backupRecipient;
      break;
    case "set-agent-action":
      state.drafts.authorization.action = targetFrom(element, "value") as AgentAction;
      break;
    case "confirm-plan":
      go("link-clues");
      shouldScroll = true;
      break;
    case "link-clue": {
      const clue = targetFrom(element, "clue") as ClueId;
      state.story.linkedClues = toggleInList(state.story.linkedClues, clue);
      break;
    }
    case "continue-final-mail":
      go("final-mail");
      shouldScroll = true;
      break;
    case "toggle-wording":
      state.story.wordingAccurate = !state.story.wordingAccurate;
      break;
    case "confirm-final-mail":
      confirmAuthorization();
      shouldScroll = true;
      break;
    case "show-debrief":
      go("debrief");
      shouldScroll = true;
      break;
    case "toggle-sound":
      state.sound = !state.sound;
      break;
    case "restart":
      state = clearState();
      shouldScroll = true;
      break;
    default:
      return;
  }

  render(shouldScroll);
});

render();
