browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
        id: "permaedit-quick-save",
        title: "PermaEdit: Save Page State",
        contexts: ["all"]
    });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "permaedit-quick-save") {
        browser.tabs.sendMessage(tab.id, {action: "saveState"}).catch((error) => {
            console.warn("[PermaEdit] Cannot send message to this tab. Content script not injected or page protected.");
        });
    }
});
