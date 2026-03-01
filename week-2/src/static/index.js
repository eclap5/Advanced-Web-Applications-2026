const listEl = document.getElementById("list");
const formEl = document.getElementById("createForm");
const titleEl = document.getElementById("titleInput");
const descriptionEl = document.getElementById("descriptionInput");
const errorEl = document.getElementById("error");
const statuses = ["open", "in progress", "done"];

function showError(msg) {
  errorEl.textContent = msg;
  errorEl.hidden = !msg;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "content-type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const payload = await res.json();
  if (!res.ok || !payload.ok) {
    throw new Error(payload?.error?.message ?? "Request failed");
  }
  return payload.data;
}

async function load() {
  try {
    showError("");
    const todos = await api("/api/tasks");
    render(todos);
  } catch (e) {
    showError(e.message);
  }
}

function render(todos) {
  listEl.innerHTML = "";

  for (const t of todos) {
    const li = document.createElement("li");
    li.className = "item";

    const left = document.createElement("div");
    left.className = "left";

    const text = document.createElement("div");
    text.className = "taskText";

    const title = document.createElement("span");
    title.className = "taskTitle";
    title.textContent = t.title;
    if (t.status === "done") title.classList.add("dim");

    const description = document.createElement("span");
    description.className = "taskDescription";
    description.textContent = t.description;

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = t.status;

    text.appendChild(title);
    text.appendChild(description);
    left.appendChild(text);
    left.appendChild(badge);

    const actions = document.createElement("div");
    actions.className = "actions";

    const statusSelect = document.createElement("select");
    statusSelect.className = "statusSelect";
    for (const status of statuses) {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      option.selected = t.status === status;
      statusSelect.appendChild(option);
    }

    const update = document.createElement("button");
    update.textContent = "Update";
    update.onclick = async () => {
      try {
        showError("");
        const next = statusSelect.value;
        await api(`/api/tasks/${t.id}`, {
          method: "PUT",
          body: JSON.stringify({ status: next }),
        });
        await load();
      } catch (e) {
        showError(e.message);
      }
    };

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = async () => {
      try {
        showError("");
        await api(`/api/tasks/${t.id}`, { method: "DELETE" });
        await load();
      } catch (e) {
        showError(e.message);
      }
    };

    actions.appendChild(statusSelect);
    actions.appendChild(update);
    actions.appendChild(del);

    li.appendChild(left);
    li.appendChild(actions);
    listEl.appendChild(li);
  }
}

formEl.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = titleEl.value.trim();
  const description = descriptionEl.value.trim();
  if (!title || !description) return;

  try {
    showError("");
    await api("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
    titleEl.value = "";
    descriptionEl.value = "";
    await load();
  } catch (e) {
    showError(e.message);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  await load();
});