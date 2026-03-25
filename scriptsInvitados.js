//import { invitadosImportador } from "./invitados.js";

// Configuración de Firebase (usa tus propias credenciales)
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

// Función para generar un código único basado en el nombre del invitado
function generarCodigoFijo(nombre) {
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash << 5) - hash + nombre.charCodeAt(i);
    hash |= 0; // Convertir a número entero
  }
  return Math.abs(hash).toString(36).substring(0, 6).toUpperCase(); // Convertir el hash a base 36 y truncar
}

const baseUrl = "https://xv-maritza.vercel.app";

// Función para mostrar y ocultar el indicador de carga
function mostrarCargando(mostrar) {
  const loadingElement = document.getElementById("loading");
  const container = document.getElementById("container");
  if (mostrar) {
    loadingElement.style.display = "block";
    container.style.display = "none";
  } else {
    loadingElement.style.display = "none";
    container.style.display = "block";
  }
}

async function generarListaInvitados(filtro = "") {
  mostrarCargando(true);
  const container = document.getElementById("listaInvitados");
  container.innerHTML = ""; // Limpiar el contenedor

  // Obtener invitados de Firestore
  const querySnapshot = await db
    .collection("invitadosXVMaritza2026")
    .orderBy("fechaCreacion", "desc")
    .get();
  const invitados = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  const invitadosFiltrados = invitados.filter((invitado) =>
    normalizarTexto(invitado.invitado.toLowerCase()).includes(
      filtro.toLowerCase(),
    ),
  );

  invitadosFiltrados.forEach((invitado) => {
    const card = document.createElement("div");
    card.classList.add("invitado-card");

    const nombre = document.createElement("h3");
    nombre.textContent = invitado.invitado;

    const acompanantes = document.createElement("p");
    acompanantes.textContent = `Asistentes: ${invitado.numeroInvitados}`;

    const url = `${baseUrl}?codigo=${invitado.codigo}`;
    const urlText = document.createElement("p");
    urlText.textContent = `${url}`;

    const btnCopiar = document.createElement("button");
    btnCopiar.textContent = "Copiar invitación";
    btnCopiar.classList.add("copy-btn");
    btnCopiar.onclick = () => copiarTextoAlPortapapeles(url, btnCopiar);

    // Botón de editar
    // const btnEditar = document.createElement("button");
    // btnEditar.textContent = "Editar";
    // btnEditar.classList.add("edit-btn");
    // btnEditar.onclick = () => editarInvitado(invitado.id);

    // Botón de eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("delete-btn");
    btnEliminar.onclick = () => eliminarInvitado(invitado.id);

    card.appendChild(nombre);
    card.appendChild(acompanantes);
    card.appendChild(urlText);
    card.appendChild(btnCopiar);
    //card.appendChild(btnEditar); // Agregar botón Editar
    card.appendChild(btnEliminar); // Agregar botón Eliminar
    container.appendChild(card);
  });
  mostrarCargando(false);
}
window.filtrarInvitados = function () {
  const input = document.getElementById("searchInput");
  const filtro = input.value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  generarListaInvitados(filtro);
};

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function copiarTextoAlPortapapeles(texto, boton) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Usar el API moderna del navegador
    navigator.clipboard
      .writeText(texto)
      .then(() => {
        // Cambiar el texto del botón a una palomita ✓ por 2 segundos
        boton.classList.add("paloma");
        boton.textContent = " Copiado";
        setTimeout(() => {
          boton.classList.remove("paloma");
          boton.textContent = "Copiar";
        }, 1000);
      })
      .catch((error) => {
        console.error("Error al copiar el texto:", error);
        alert("Error al copiar el texto. Inténtalo nuevamente.");
      });
  } else {
    // Fallback para navegadores antiguos
    const textArea = document.createElement("textarea");
    textArea.value = texto;
    textArea.style.position = "fixed"; // Evita el scroll al agregar el elemento
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";

    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      // Cambiar el texto del botón a una palomita ✓ por 2 segundos
      boton.classList.add("paloma");
      boton.textContent = " Copiado";
      setTimeout(() => {
        boton.classList.remove("paloma");
        boton.textContent = "Copiar";
      }, 1000);
    } catch (error) {
      console.error("Error al copiar el texto:", error);
      alert("Error al copiar el texto. Inténtalo nuevamente.");
    }
    document.body.removeChild(textArea);
  }
}

// Llamar a la función para generar la lista de invitados
generarListaInvitados();

window.agregarInvitado = async function () {
  const nombreInvitado = document.getElementById("nombreInvitado").value;
  const numeroInvitados = document.getElementById("numeroInvitados").value;

  if (nombreInvitado && numeroInvitados) {
    const codigo = generarCodigoFijo(nombreInvitado);
    mostrarCargando(true);
    // Guardar en Firestore
    await db.collection("invitadosXVMaritza2026").add({
      invitado: nombreInvitado,
      numeroInvitados: parseInt(numeroInvitados),
      codigo,
      fechaCreacion: new Date(),
    });

    alert("Invitado agregado con éxito!");
    document.getElementById("nombreInvitado").value = "";
    document.getElementById("numeroInvitados").value = "";
    await generarListaInvitados(); // Refrescar la lista
  } else {
    alert("Por favor, completa todos los campos");
  }
};

// Función para eliminar un invitado
window.eliminarInvitado = async function (id) {
  const confirmacion = confirm(
    "¿Estás seguro de que deseas eliminar este invitado?",
  );
  if (confirmacion) {
    mostrarCargando(true);
    await db.collection("invitadosXVMaritza2026").doc(id).delete();
    alert("Invitado eliminado con éxito");
    generarListaInvitados(); // Refrescar la lista
  }
};

// Función para editar un invitado
window.editarInvitado = async function (id) {
  const nombreNuevo = prompt("Introduce el nuevo nombre del invitado:");
  const numeroAcompanantesNuevo = prompt(
    "Introduce el nuevo número de acompañantes:",
  );

  if (nombreNuevo && numeroAcompanantesNuevo) {
    const codigo = generarCodigoFijo(nombreInvitado);
    mostrarCargando(true);
    await db
      .collection("invitadosXVMaritza2026")
      .doc(id)
      .update({
        invitado: nombreNuevo,
        numeroInvitados: parseInt(numeroAcompanantesNuevo),
        codigo,
      });
    alert("Invitado actualizado con éxito");
    generarListaInvitados(); // Refrescar la lista
  } else {
    alert("Por favor, completa todos los campos para actualizar.");
  }
};

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
