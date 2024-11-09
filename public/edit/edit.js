import dataFetch from "../dataFetch.js";
import updateState from "../updateState.js";

let state = {};
const initialState = {
  dirty: false,
  selectedName: location.hash.slice(1), // Will be empty string if no hash
  saving: false,
  saveSuccessful: false,
  error: false,
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
  const data = await dataFetch();
  if (data) {
    const { updates } = data;
    setState({
      error: false,
      updates,
    });
  } else {
    setState({ error: true });
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
  const { dirty, error, saveSuccessful, saving, selectedName, updates } = state;

  const names = updates ? Object.keys(updates) : [];
  if (changed.updates) {
    // Populate the names
    const nameOptions = names.map(
      (name) => `<option value="${name}">${name}</option>`
    );
    nameSelect.innerHTML = nameOptions.join("\n");
  }

  const disableControls = names.length === 0;
  nameSelect.disabled = disableControls;
  messageTextarea.disabled = disableControls;
  spokeInput.disabled = disableControls;

  if (changed.updates || changed.selectedName) {
    const name = selectedName || names[0];
    if (name) {
      nameSelect.value = name;
      location.hash = name;
      const personUpdates = updates?.[name];
      messageTextarea.value = personUpdates?.message ?? "";
      spokeInput.value = personUpdates?.spoke ?? "";
    }
  }

  if (disableControls || changed.dirty || changed.saving) {
    saveButton.disabled = disableControls || saving || !dirty;
    saveButton.textContent = saving ? "Saving..." : "Save";
  }

  if (changed.saveSuccessful) {
    saveMessage.style.display = saveSuccessful ? "block" : "none";
  }
  if (changed.error) {
    errorMessage.style.display = error ? "block" : "none";
  }
}

async function save() {
  setState({
    error: false,
    saveSuccessful: false,
    saving: true,
  });
  const postData = fieldsToData();
  const body = JSON.stringify(postData);
  const data = await dataFetch({
    method: "PATCH",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body,
  });
  if (data) {
    setState({
      dirty: false,
      error: false,
      saveSuccessful: true,
      saving: false,
    });
    // navigateToBoard();
  } else {
    setState({
      error: true,
      saving: false,
    });
  }
}

function setState(changes) {
  const { newState, changed } = updateState(state, changes);
  state = newState;
  render(state, changed);
}

window.addEventListener("load", async () => {
  nameSelect.addEventListener("change", () => {
    setState({
      selectedName: nameSelect.value,
    });
  });
  messageTextarea.addEventListener("input", () => {
    setState({ dirty: true, saveSuccessful: false });
  });
  spokeInput.addEventListener("input", () => {
    setState({ dirty: true, saveSuccessful: false });
  });
  saveButton.addEventListener("click", async () => {
    await save();
  });

  setState(initialState);
  await load();
});
