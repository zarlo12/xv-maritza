//import { invitadosImportador } from "./invitados.js";

// ===== CONFIGURACIÓN FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyDHnHj_z55B-VujnU3Uc1X1lMUt0a-Tjh8",
  authDomain: "xv-anios.firebaseapp.com",
  projectId: "xv-anios",
  storageBucket: "xv-anios.appspot.com",
  messagingSenderId: "1070165494180",
  appId: "1:1070165494180:web:5fbbd3a24226145b62d931",
  measurementId: "G-NE08T41NPZ",
};

// Inicializa Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== VARIABLES GLOBALES =====
let allInvitados = [];
let searchDebounceTimer = null;
const baseUrl = "https://xv-maritza.vercel.app";

// ===== SISTEMA DE TOAST NOTIFICATIONS =====
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span class="toast-message">${message}</span>
    <span class="toast-close">✖</span>
  `;

  container.appendChild(toast);

  // Cerrar al hacer clic en la X
  toast.querySelector(".toast-close").addEventListener("click", () => {
    toast.style.animation = "toastSlideIn 0.3s ease reverse";
    setTimeout(() => toast.remove(), 300);
  });

  // Auto-cerrar después de 4 segundos
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = "toastSlideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

// ===== SISTEMA DE MODAL DE CONFIRMACIÓN =====
function showConfirmModal(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("confirmModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalMessage = document.getElementById("modalMessage");
    const confirmBtn = document.getElementById("modalConfirm");
    const cancelBtn = document.getElementById("modalCancel");

    modalTitle.textContent = title;
    modalMessage.textContent = message;
    confirmBtn.classList.add("danger"); // Botón rojo para acciones peligrosas
    modal.classList.add("active");

    const handleConfirm = () => {
      modal.classList.remove("active");
      confirmBtn.classList.remove("danger");
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      modal.classList.remove("active");
      confirmBtn.classList.remove("danger");
      cleanup();
      resolve(false);
    };

    const cleanup = () => {
      confirmBtn.removeEventListener("click", handleConfirm);
      cancelBtn.removeEventListener("click", handleCancel);
      modal.removeEventListener("click", handleModalClick);
    };

    const handleModalClick = (e) => {
      if (e.target === modal) {
        handleCancel();
      }
    };

    confirmBtn.addEventListener("click", handleConfirm);
    cancelBtn.addEventListener("click", handleCancel);
    modal.addEventListener("click", handleModalClick);
  });
}

// ===== FUNCIONES DE UTILIDAD =====
function generarCodigoFijo(nombre) {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash << 5) - hash + nombre.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
}

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mostrarCargando(mostrar) {
  const loadingElement = document.getElementById("loadingOverlay");
  if (mostrar) {
    loadingElement.style.display = "flex";
  } else {
    loadingElement.style.display = "none";
  }
}

// ===== ACTUALIZAR ESTADÍSTICAS =====
function actualizarEstadisticas() {
  const totalInvitados = allInvitados.length;
  const totalAsistentes = allInvitados.reduce(
    (sum, inv) => sum + parseInt(inv.numeroInvitados || 0),
    0,
  );

  document.getElementById("totalInvitados").textContent = totalInvitados;
  document.getElementById("totalAsistentes").textContent = totalAsistentes;
}

// ===== GENERAR LISTA DE INVITADOS =====
async function generarListaInvitados(filtro = "") {
  const container = document.getElementById("listaInvitados");
  const emptyState = document.getElementById("emptyState");
  container.innerHTML = "";

  // Si no hay invitados cargados, cargarlos de Firestore
  if (allInvitados.length === 0) {
    mostrarCargando(true);
    try {
      const querySnapshot = await db
        .collection("invitadosXVMaritza2026")
        .orderBy("fechaCreacion", "desc")
        .get();
      allInvitados = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error cargando invitados:", error);
      showToast("Error al cargar los invitados", "error");
      mostrarCargando(false);
      return;
    }
    mostrarCargando(false);
  }

  // Filtrar invitados
  const invitadosFiltrados = allInvitados.filter((invitado) =>
    normalizarTexto(invitado.invitado).includes(normalizarTexto(filtro)),
  );

  // Actualizar estadísticas
  actualizarEstadisticas();

  // Mostrar empty state si no hay invitados
  if (invitadosFiltrados.length === 0) {
    emptyState.style.display = "block";
    container.style.display = "none";
    return;
  }

  emptyState.style.display = "none";
  container.style.display = "flex";

  // Renderizar cada invitado
  invitadosFiltrados.forEach((invitado, index) => {
    const card = document.createElement("div");
    card.classList.add("invitado-card");
    card.style.animationDelay = `${index * 0.05}s`;

    const nombre = document.createElement("h3");
    nombre.textContent = invitado.invitado;

    const infoAsistentes = document.createElement("div");
    infoAsistentes.classList.add("invitado-info");
    infoAsistentes.innerHTML = `
      <span class="invitado-info-icon">🎉</span>
      <span>${invitado.numeroInvitados} ${
        invitado.numeroInvitados === 1 ? "persona" : "personas"
      }</span>
    `;

    const url = `${baseUrl}?codigo=${invitado.codigo}`;
    const urlDiv = document.createElement("div");
    urlDiv.classList.add("invitado-url");
    urlDiv.textContent = url;

    const actionsDiv = document.createElement("div");
    actionsDiv.classList.add("card-actions");

    const btnCopiar = document.createElement("button");
    btnCopiar.classList.add("copy-btn");
    btnCopiar.innerHTML = `
      <span class="copy-btn-icon">📋</span>
      <span>Copiar invitación</span>
    `;
    btnCopiar.onclick = () => copiarTextoAlPortapapeles(url, btnCopiar);

    const btnEliminar = document.createElement("button");
    btnEliminar.classList.add("delete-btn");
    btnEliminar.textContent = "🗑️ Eliminar";
    btnEliminar.onclick = () => eliminarInvitado(invitado.id);

    actionsDiv.appendChild(btnCopiar);
    actionsDiv.appendChild(btnEliminar);

    card.appendChild(nombre);
    card.appendChild(infoAsistentes);
    card.appendChild(urlDiv);
    card.appendChild(actionsDiv);
    container.appendChild(card);
  });
}

// ===== BUSCAR INVITADOS CON DEBOUNCE =====
function filtrarInvitados() {
  const input = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearch");
  const filtro = input.value.trim();

  // Mostrar/ocultar botón de limpiar
  clearBtn.style.display = filtro ? "block" : "none";

  // Debounce para evitar buscar en cada tecla
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    generarListaInvitados(filtro);
  }, 300);
}

// ===== COPIAR AL PORTAPAPELES =====
async function copiarTextoAlPortapapeles(texto, boton) {
  try {
    await navigator.clipboard.writeText(texto);

    // Cambiar apariencia del botón
    boton.classList.add("copied");
    boton.innerHTML = `
      <span class="copy-btn-icon">✅</span>
      <span>¡Copiado!</span>
    `;

    showToast("¡Enlace copiado al portapapeles!", "success");

    // Restaurar después de 2 segundos
    setTimeout(() => {
      boton.classList.remove("copied");
      boton.innerHTML = `
        <span class="copy-btn-icon">📋</span>
        <span>Copiar invitación</span>
      `;
    }, 2000);
  } catch (error) {
    console.error("Error al copiar:", error);
    showToast("No se pudo copiar el enlace", "error");

    // Fallback para navegadores antiguos
    const textArea = document.createElement("textarea");
    textArea.value = texto;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      showToast("¡Enlace copiado!", "success");

      boton.classList.add("copied");
      boton.innerHTML = `
        <span class="copy-btn-icon">✅</span>
        <span>¡Copiado!</span>
      `;

      setTimeout(() => {
        boton.classList.remove("copied");
        boton.innerHTML = `
          <span class="copy-btn-icon">📋</span>
          <span>Copiar invitación</span>
        `;
      }, 2000);
    } catch (err) {
      showToast("Error al copiar el enlace", "error");
    }

    document.body.removeChild(textArea);
  }
}

// ===== FUNCIONES DE MODAL =====
function openAddInvitadoModal() {
  const modal = document.getElementById("addInvitadoModal");
  modal.classList.add("active");
  // Focus en el primer input
  setTimeout(() => {
    document.getElementById("nombreInvitado").focus();
  }, 300);
}

function closeAddInvitadoModal() {
  const modal = document.getElementById("addInvitadoModal");
  modal.classList.remove("active");
  // Limpiar formulario
  document.getElementById("nombreInvitado").value = "";
  document.getElementById("numeroInvitados").value = "";
}

// ===== AGREGAR INVITADO =====
async function agregarInvitado(e) {
  e.preventDefault();

  const nombreInput = document.getElementById("nombreInvitado");
  const numeroInput = document.getElementById("numeroInvitados");
  const nombreInvitado = nombreInput.value.trim();
  const numeroInvitados = numeroInput.value.trim();

  // Validaciones
  if (!nombreInvitado) {
    showToast("Por favor ingresa el nombre del invitado", "warning");
    nombreInput.focus();
    return;
  }

  if (!numeroInvitados || parseInt(numeroInvitados) < 1) {
    showToast("El número de asistentes debe ser al menos 1", "warning");
    numeroInput.focus();
    return;
  }

  if (parseInt(numeroInvitados) > 20) {
    showToast("El número máximo de asistentes es 20", "warning");
    numeroInput.focus();
    return;
  }

  const codigo = generarCodigoFijo(nombreInvitado);
  mostrarCargando(true);

  try {
    const docRef = await db.collection("invitadosXVMaritza2026").add({
      invitado: nombreInvitado,
      numeroInvitados: parseInt(numeroInvitados),
      codigo,
      fechaCreacion: new Date(),
    });

    // Agregar a la lista local
    allInvitados.unshift({
      id: docRef.id,
      invitado: nombreInvitado,
      numeroInvitados: parseInt(numeroInvitados),
      codigo,
      fechaCreacion: new Date(),
    });

    showToast(`¡Invitado "${nombreInvitado}" agregado con éxito!`, "success");
    
    // Cerrar modal y limpiar formulario
    closeAddInvitadoModal();
    
    await generarListaInvitados();
  } catch (error) {
    console.error("Error agregando invitado:", error);
    showToast("Error al agregar el invitado. Intenta de nuevo.", "error");
  } finally {
    mostrarCargando(false);
  }
}

// ===== ELIMINAR INVITADO =====
async function eliminarInvitado(id) {
  const invitado = allInvitados.find((inv) => inv.id === id);
  if (!invitado) return;

  const confirmar = await showConfirmModal(
    "¿Eliminar invitado?",
    `¿Estás seguro de que deseas eliminar a "${invitado.invitado}"? Esta acción no se puede deshacer.`,
  );

  if (confirmar) {
    mostrarCargando(true);
    try {
      await db.collection("invitadosXVMaritza2026").doc(id).delete();

      // Eliminar de la lista local
      allInvitados = allInvitados.filter((inv) => inv.id !== id);

      showToast(`Invitado "${invitado.invitado}" eliminado`, "success");
      await generarListaInvitados();
    } catch (error) {
      console.error("Error eliminando invitado:", error);
      showToast("Error al eliminar el invitado", "error");
    } finally {
      mostrarCargando(false);
    }
  }
}

// ===== EVENT LISTENERS =====
document.addEventListener("DOMContentLoaded", () => {
  // FAB - Abrir modal de agregar invitado
  const fabButton = document.getElementById("fabButton");
  fabButton.addEventListener("click", openAddInvitadoModal);

  // Modal de agregar invitado
  const addInvitadoModal = document.getElementById("addInvitadoModal");
  const closeAddModalBtn = document.getElementById("closeAddModal");
  const cancelAddBtn = document.getElementById("cancelAddInvitado");

  // Cerrar modal con botón X
  closeAddModalBtn.addEventListener("click", closeAddInvitadoModal);

  // Cerrar modal con botón Cancelar
  cancelAddBtn.addEventListener("click", closeAddInvitadoModal);

  // Cerrar modal al hacer click fuera
  addInvitadoModal.addEventListener("click", (e) => {
    if (e.target === addInvitadoModal) {
      closeAddInvitadoModal();
    }
  });

  // Formulario de agregar invitado
  const form = document.getElementById("formInvitado");
  form.addEventListener("submit", agregarInvitado);

  // Búsqueda
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filtrarInvitados);

  // Botón de limpiar búsqueda
  const clearSearch = document.getElementById("clearSearch");
  clearSearch.addEventListener("click", () => {
    searchInput.value = "";
    clearSearch.style.display = "none";
    generarListaInvitados();
  });

  // Cargar invitados inicialmente
  generarListaInvitados();
});

// ===== FUNCIONES GLOBALES (para mantener compatibilidad) =====
window.filtrarInvitados = filtrarInvitados;
window.agregarInvitado = agregarInvitado;
window.eliminarInvitado = eliminarInvitado;

// async function importarInvitados() {
//   try {
//     for (const invitado of invitadosImportador) {
//       const codigo = generarCodigoFijo(invitado.invitado); // Generar código

//       await db.collection("invitadosXVMaritza2026").add({
//         invitado: invitado.invitado,
//         numeroInvitados: invitado.numeroInvitados,
//         codigo: codigo,
//         fechaCreacion: new Date(),
//       });

//       console.log("Invitado agregado con ID:");
//     }
//     console.log("Todos los invitados han sido importados.");
//   } catch (error) {
//     console.error("Error al importar los invitados:", error);
//   }
// }
// importarInvitados();
