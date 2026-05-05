browser.runtime.onInstalled.addListener(() => {
    browser.contextMenus.create({
        id: "permaedit-quick-save",
        title: "PermaEdit: Save F12 Changes",
        contexts: ["all"]
    });
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "permaedit-quick-save") {
        browser.tabs.sendMessage(tab.id, {action: "saveState"});
    }
});
