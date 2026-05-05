const siteKey = "permaEdit_" + window.location.hostname + window.location.pathname;

browser.storage.local.get([siteKey]).then((result) => {
    if (result[siteKey]) {
        document.body.innerHTML = result[siteKey];
        console.log("[PermaEdit] Loaded saved modifications.");
    }
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "showInstructions") {
        alert("PermaEdit:\n\n1. Press F12 (or Ctrl+Shift+I) to open Developer Console.\n2. Edit the HTML/Text exactly how you want it.\n3. Click 'Save F12 Changes' in the extension to make it permanent.");
    }

    if (request.action === "saveState") {
        let fakeHTML = document.body.innerHTML;
        let obj = {};
        obj[siteKey] = fakeHTML;

        browser.storage.local.set(obj).then(() => {
            alert("PermaEdit: F12 changes SAVED permanently.");
        });
    }

    if (request.action === "resetState") {
        browser.storage.local.remove(siteKey).then(() => {
            alert("PermaEdit: Reset to default. Reloading page...");
            window.location.reload();
        });
    }
});
