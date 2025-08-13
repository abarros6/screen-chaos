document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const chaosToggles = document.querySelectorAll(".chaos-toggle");
  chaosToggles.forEach(toggle => {
    toggle.addEventListener("change", (e) => {
      chrome.runtime.sendMessage({
        action: "toggleChaos",
        tabId: tab.id,
        chaosType: e.target.dataset.type,
        enabled: e.target.checked
      });
    });
  });

  const slider = document.getElementById("chaosLevel");
  slider.addEventListener("input", (e) => {
    chrome.runtime.sendMessage({
      action: "setChaosLevel",
      tabId: tab.id,
      level: parseInt(e.target.value, 10)
    });
  });

  const shutOffButton = document.getElementById("shutOffButton");
  shutOffButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({
      action: "clearChaos",
      tabId: tab.id
    });
    // Update UI after clearing
    chaosToggles.forEach(toggle => toggle.checked = false);
    slider.value = 3;
  });
});