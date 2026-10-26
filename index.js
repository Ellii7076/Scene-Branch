import { getContext } from "../../../extensions.js";

const extensionName = "scene-branch-hud";
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
}

jQuery(() => {
    console.log(`[${extensionName}] Loading...`);

    // Создаём плавающую кнопку
    const $btn = $(`
        <div id="sbh-floating-btn" title="Scene Branch HUD — сделать снимок">
            <i class="fa-solid fa-camera"></i>
        </div>
    `);

    $("body").append($btn);

    $btn.on("click", onSnapshotClick);

    console.log(`[${extensionName}] ✅ Floating button ready`);
});
