const API_URL = "https://todoapitest.juansegaliz.com/Todos";

let tareas = [];

// Mostrar formulario para crear una tarea
function mostrarCrear() {
  const contenedor = document.getElementById("formularioContenedor");
  const lista = document.getElementById("listaContenedor");
  const titulo = document.querySelector(".titulo");

  titulo.innerText = "Crear tarea nueva";
  contenedor.style.display = "block";
  lista.style.display = "none";

  contenedor.innerHTML = `
    <div class="card shadow-sm mx-auto" style="max-width: 500px;">
      <div class="card-body">
        <h5 class="card-title mb-4 text-primary">Nueva tarea</h5>
        <form id="formTarea" onsubmit="crearTarea(event)" class="needs-validation" novalidate>
          
          <div class="mb-3">
            <label for="title" class="form-label">Título</label>
            <input type="text" id="title" class="form-control" required>
            <div class="invalid-feedback">El título es obligatorio.</div>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Descripción</label>
            <textarea id="description" class="form-control" rows="3" required></textarea>
            <div class="invalid-feedback">La descripción es obligatoria.</div>
          </div>

          <div class="mb-3">
            <label for="priority" class="form-label">Prioridad (0-5)</label>
            <input type="number" id="priority" class="form-control" min="0" max="5" value="0">
          </div>

          <div class="mb-3">
            <label for="dueAt" class="form-label">Fecha límite</label>
            <input type="datetime-local" id="dueAt" class="form-control">
          </div>

          <div class="d-grid">
            <button type="submit" class="btn btn-primary">
              💾 Crear tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Validación Bootstrap
  const form = document.getElementById("formTarea");
  form.addEventListener("submit", (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.classList.add("was-validated");
  });
}

// Crear tarea
async function crearTarea(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const priority = parseInt(document.getElementById("priority").value);
  const dueAt = document.getElementById("dueAt").value;

  if (!title || !description) {
    mostrarAlerta("⚠️ Por favor, completa el título y la descripción.", "warning");
    return;
  }

  const nuevaTarea = {
    title,
    description,
    priority: priority || 0,
    dueAt: dueAt || null,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaTarea),
    });

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    mostrarAlerta("✅ Tarea creada exitosamente!", "success");
    mostrarLista();
  } catch (error) {
    console.error("Error al crear la tarea:", error);
    mostrarAlerta("❌ Error al crear la tarea: " + error.message, "danger");
  }
}

// Mostrar lista de tareas
async function mostrarLista() {
  const contenedor = document.getElementById("listaContenedor");
  const formulario = document.getElementById("formularioContenedor");
  const titulo = document.querySelector(".titulo");

  titulo.innerText = "Lista de tareas";
  formulario.style.display = "none";
  contenedor.style.display = "block";

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error HTTP " + res.status);

    const data = await res.json();
    tareas = data && Array.isArray(data.data) ? data.data : [];
    renderizarTareas(tareas);
  } catch (error) {
    console.error("No se pudieron obtener las tareas:", error);
    mostrarAlerta("❌ Error al cargar las tareas: " + error.message, "danger");
  }
}

// Renderizar la tabla de tareas
function renderizarTareas(lista) {
  const body = document.getElementById("bodyTareas");
  body.innerHTML = "";

  if (!lista.length) {
    body.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay tareas registradas.</td></tr>`;
    return;
  }

  lista.forEach((t) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${t.title}</td>
      <td>${t.description}</td>
      <td class="text-center">${t.isCompleted ? "✅" : "❌"}</td>
      <td class="text-center">
        <div class="btn-group" role="group">
          ${
            t.isCompleted
              ? `<button class="btn btn-outline-danger btn-sm" onclick="eliminarTarea(${t.id})" title="Eliminar"><i class="bi bi-trash"></i> Eliminar</button>`
              : `<button class="btn btn-outline-success btn-sm" onclick="marcarCompletado(${t.id})" title="Completar"><i class="bi bi-check2-circle"></i> Completar</button>`
          }
          <button class="btn btn-outline-secondary btn-sm" onclick="actualizarTarea(${t.id})" title="Actualizar"><i class="bi bi-arrow-clockwise"></i> Actualizar</button>
        </div>
      </td>
    `;
    body.appendChild(fila);
  });
}

// Buscar tareas
function buscarTareas() {
  const filtro = document.getElementById("filtro").value.toLowerCase().trim();

  const filtradas =
    filtro === ""
      ? tareas
      : tareas.filter(
          (t) =>
            t.title.toLowerCase().includes(filtro) ||
            (t.description && t.description.toLowerCase().includes(filtro))
        );

  renderizarTareas(filtradas);
}

// Marcar completada
async function marcarCompletado(id) {
  try {
    const tarea = tareas.find((t) => t.id === id);
    if (!tarea) return mostrarAlerta("⚠️ Tarea no encontrada", "warning");

    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...tarea, isCompleted: true }),
    });

    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    tarea.isCompleted = true;
    renderizarTareas(tareas);
    mostrarAlerta("✅ Tarea marcada como completada!", "success");
  } catch (error) {
    console.error(error);
    mostrarAlerta("❌ Error al completar la tarea: " + error.message, "danger");
  }
}

// Eliminar tarea
async function eliminarTarea(id) {
  if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`Error HTTP ${res.status}`);

    tareas = tareas.filter((t) => t.id !== id);
    renderizarTareas(tareas);
    mostrarAlerta("🗑️ Tarea eliminada exitosamente!", "success");
  } catch (error) {
    console.error(error);
    mostrarAlerta("❌ Error al eliminar: " + error.message, "danger");
  }
}
