const siteKey = "permaEdit_" + window.location.hostname + window.location.pathname;

browser.storage.local.get([siteKey]).then((result) => {
    if (result[siteKey]) {
        const parser = new DOMParser();
        const newDoc = parser.parseFromString(result[siteKey], 'text/html');
        document.documentElement.replaceWith(newDoc.documentElement);

        console.log("[PermaEdit] Loaded saved modifications safely.");
    }
});

function showCustomToast(message, reloadAfter = false) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.background = 'rgba(28, 27, 34, 0.9)';
    toast.style.backdropFilter = 'blur(10px)';
    toast.style.color = '#00ddff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    toast.style.fontSize = '14px';
    toast.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
    toast.style.zIndex = '2147483647';
    toast.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    toast.style.transform = 'translateY(20px)';
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';

    toast.innerHTML = `<strong style="color: #fff;">PermaEdit:</strong> ${message}`;

    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    });

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            toast.remove();
            if (reloadAfter) window.location.reload();
        }, 400);
    }, 3000);
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.action === "saveState") {
        let fakeHTML = document.documentElement.outerHTML;
        let obj = {};
        obj[siteKey] = fakeHTML;

        browser.storage.local.set(obj).then(() => {
            showCustomToast("Page state SAVED permanently.");
        });
    }

    if (request.action === "resetState") {
        browser.storage.local.remove(siteKey).then(() => {
            showCustomToast("Reverted to default. Reloading...", true);
        });
    }
});
