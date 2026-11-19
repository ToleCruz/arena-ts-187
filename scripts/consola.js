// Copia en la página todo lo que se escribe en la consola (F12)
const lista = document.getElementById("consola");
function agregar(texto, clase) {
  const li = document.createElement("li");
  li.textContent = texto;
  if (clase) li.className = clase;
  lista.appendChild(li);
}
// Los objetos y arreglos se muestran como JSON para poder leerlos
function aTexto(dato) {
  return typeof dato === "object" && dato !== null ? JSON.stringify(dato) : String(dato);
}
const logOriginal = console.log;
console.log = (...datos) => { logOriginal(...datos); agregar(datos.map(aTexto).join(" ")); };
window.addEventListener("error", (e) => agregar(e.message, "error"));
