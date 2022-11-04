const userId = "65fbe32d-bf35-47de-a27f-e86724613a7b";
const itemId = "2bd8b583-d812-4a08-a54b-063fe6732bc5";
const readUrl = `https://api.jsonstorage.net/v1/json/${userId}/${itemId}`;
const writeUrl = `${readUrl}?apiKey=c449f192-4472-4f53-9cde-aa542d5994a8`;

let nameSelect;
let messageTextarea;
let spokeInput;

let state = {
  dirty: false,
  selectedName: location.hash.slice(1), // Will be empty string if no hash
  saving: false,
  showFeedback: false,
};

function fieldsToData() {
  const name = nameSelect.value;
  const message = messageTextarea.value;
  const spoke = spokeInput.value;
  return {
    updates: {
      [name]: {
        message,
        spoke,
      },
    },
  };
}

async function load() {
  const response = await fetch(readUrl);
  const data = await response.json();
  if (data) {
    const { updates } = data;
    setState({ updates });
  }
}

function navigateToBoard() {
  const path = location.pathname;
  const parts = path.split("/");
  parts.pop(); // Remove trailing empty string.
  parts.pop(); // Remove name of this page.
  // Navigate to path, or root if path is now empty.
  const boardPath = parts.join("/") || "/";
  location.href = boardPath;
}

function render(state, changed) {
  const { dirty, saving, selectedName, showFeedback, updates } = state;

  const names = updates ? Object.keys(updates) : [];
  if (changed.updates) {
    // Populate the names
    const nameOptions = names.map(
      (name) => `<option value="${name}">${name}</option>`
    );
    nameSelect.innerHTML = nameOptions.join("\n");
  }

  if (changed.updates || changed.selectedName) {
    const name = selectedName || names[0];
    if (name) {
      nameSelect.value = name;
      location.hash = name;
      const personUpdates = updates[name];
      messageTextarea.value = personUpdates?.message ?? "";
      spokeInput.value = personUpdates?.spoke ?? "";
    }
  }

  saveButton.disabled = saving || !dirty;
  saveButton.textContent = saving ? "Saving..." : "Save";
}

async function save() {
  setState({ saving: true });
  const data = fieldsToData();
  const body = JSON.stringify(data);
  const response = await fetch(writeUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body,
  });
  const responseBody = await response.json();
  setState({ dirty: false, saving: false, showFeedback: !!responseBody });
  navigateToBoard();
}

function setState(changed) {
  state = Object.assign(state, changed);
  render(state, changed);
}

window.addEventListener("load", async () => {
  nameSelect = document.getElementById("nameSelect");
  messageTextarea = document.getElementById("messageTextarea");
  spokeInput = document.getElementById("spokeInput");
  const saveButton = document.getElementById("saveButton");

  nameSelect.addEventListener("change", () => {
    setState({
      selectedName: nameSelect.value,
    });
  });
  messageTextarea.addEventListener("input", () => {
    setState({ dirty: true, showFeedback: false });
  });
  spokeInput.addEventListener("input", () => {
    setState({ dirty: true, showFeedback: false });
  });
  saveButton.addEventListener("click", async () => {
    await save();
  });

  await load();
});
