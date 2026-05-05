const manifestData = browser.runtime.getManifest();
document.getElementById('versionDisplay').textContent = manifestData.version;

function sendCommand(command) {
    browser.tabs.query({active: true, currentWindow: true}, function(tabs) {
        browser.tabs.sendMessage(tabs[0].id, {action: command});
    });
}

document.getElementById('infoBtn').addEventListener('click', () => sendCommand("showInstructions"));
document.getElementById('saveBtn').addEventListener('click', () => sendCommand("saveState"));
document.getElementById('resetBtn').addEventListener('click', () => sendCommand("resetState"));
