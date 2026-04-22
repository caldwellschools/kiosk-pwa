// Replace with the ID from your Google Admin Console
const EXTENSION_ID = "dgobjcdimkeolppgkaomgodecnibeaji";

function log(msg) {
    document.getElementById('log').innerText = msg;
}

function checkOSVersion() {
    log("Querying extension...");
    if (window.chrome && chrome.runtime) {
        chrome.runtime.sendMessage(EXTENSION_ID, { action: "get_os_version" }, (response) => {
            if (chrome.runtime.lastError) {
                log("Error: Extension not found/accessible.");
                return;
            }
            if (response && response.status === "success") {
                document.getElementById('status').innerText = `OS: ${response.version.os} (${response.version.arch})`;
                log("Data retrieved successfully.");
            }
        });
    } else {
        log("Chrome API not available.");
    }
}

function triggerUpdateCheck() {
    log("Checking for OS updates...");
    
    chrome.runtime.sendMessage(EXTENSION_ID, { action: "check_updates" }, (response) => {
        if (chrome.runtime.lastError) {
            log("Update check failed: Extension unreachable.");
            return;
        }

        if (response && response.updateStatus) {
            // Map status to user-friendly messages
            const statusMap = {
                "update_available": "Update found! Downloading...",
                "no_update": "System is up to date.",
                "error": "Error checking for updates."
            };
            
            const msg = statusMap[response.updateStatus] || "Checking...";
            document.getElementById('status').innerText = msg;
            log(`Engine Status: ${response.updateStatus}`);
        }
    });
}

// Listen for progress updates FROM the extension
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "UPDATE_PROGRESS") {
        const container = document.getElementById('progress-container');
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        
        container.style.display = "block";
        
        // Convert 0.0-1.0 to percentage
        const percent = Math.round(message.progress * 100);
        bar.style.width = percent + "%";
        text.innerText = `Status: ${message.status} (${percent}%)`;

        if (message.status === "need_reboot") {
            document.getElementById('status').innerText = "Update complete! Reboot required.";
            bar.style.backgroundColor = "#1a73e8";
        }
    }
});

function triggerReboot() {
    if (confirm("System will restart. Proceed?")) {
        chrome.runtime.sendMessage(EXTENSION_ID, { action: "restart_for_update" }, (response) => {
            log("Restart command sent.");
        });
    }
}
