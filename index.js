import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extensionName = "scene-branch-hud";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

const METADATA_KEY = "sbh_snapshots";

function getSnapshots() {
    const context = getContext();
    if (!context.chatMetadata) return [];
    if (!Array.isArray(context.chatMetadata[METADATA_KEY])) {
        context.chatMetadata[METADATA_KEY] = [];
    }
    return context.chatMetadata[METADATA_KEY];
}

function onSnapshotClick() {
    const context = getContext();
    const chat = context.chat;

    if (!Array.isArray(chat) || chat.length === 0) {
        toastr.warning("Чат пуст — нечего сохранять.", "Scene Branch HUD");
        return;
    }

    const lastMessage = chat[chat.length - 1];
    const snapshot = {
        id: `snap_${Date.now()}`,
        messageIndex: chat.length - 1,
        timestamp: Date.now(),
        preview: String(lastMessage?.mes || "").slice(0, 80),
    };

    const snapshots = getSnapshots();
    snapshots.push(snapshot);

    // Сохраняем метаданные чата
    if (typeof context.saveMetadata === "function") {
        context.saveMetadata();
    } else if (typeof context.saveChat === "function") {
        context.saveChat();
    }

    console.log(`[${extensionName}] Snapshot saved:`, snapshot);
    toastr.info(
        `Снимок #${snapshots.length} сохранён (сообщение ${snapshot.messageIndex + 1}).`,
        "Scene Branch HUD"
    );

    renderSnapshotList();
}

function renderSnapshotList() {
    const snapshots = getSnapshots();
    const $list = $("#sbh-snapshot-list");
    if ($list.length === 0) return;

    if (snapshots.length === 0) {
        $list.html("<small>Снимков пока нет.</small>");
        return;
    }

    const html = snapshots
        .map((s, i) => {
            const time = new Date(s.timestamp).toLocaleString();
            return `<div class="sbh-snapshot-item">
                <b>#${i + 1}</b> — сообщение ${s.messageIndex + 1}<br>
                <small>${time}</small><br>
                <small><i>${s.preview || "(пусто)"}</i></small>
            </div>`;
        })
        .join("");
    $list.html(html);
}

jQuery(async () => {
    console.log(`[${extensionName}] Loading...`);

    try {
        const settingsHtml = await $.get(`${extensionFolderPath}/example.html`);
        $("#extensions_settings2").append(settingsHtml);

        $("#sbh-snapshot-btn").on("click", onSnapshotClick);

        renderSnapshotList();

        console.log(`[${extensionName}] ✅ Loaded successfully`);
    } catch (error) {
        console.error(`[${extensionName}] ❌ Failed to load:`, error);
    }
});
