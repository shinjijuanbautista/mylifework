// Traemos los gastos guardados (o una lista vacía si no hay ninguno)
let gastos = JSON.parse(localStorage.getItem("gastos")) || [];

// Buscamos los elementos de la página que vamos a usar
const form = document.getElementById("form-gasto");
const lista = document.getElementById("lista-gastos");
const totalEl = document.getElementById("total");

// Guarda los gastos en el navegador
function guardar() {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

// Dibuja la lista de gastos y calcula el total
function mostrar() {
  lista.innerHTML = "";
  let total = 0;

  gastos.forEach(function (gasto, indice) {
    total += gasto.monto;

    const li = document.createElement("li");
    li.innerHTML = `
      <div>
        <strong>${gasto.descripcion}</strong>
        <small>${gasto.categoria}</small>
      </div>
      <div>
        <span>$${gasto.monto.toLocaleString("es-AR")}</span>
        <button class="borrar" onclick="borrarGasto(${indice})">✕</button>
      </div>
    `;
    lista.appendChild(li);
  });

  totalEl.textContent = "$" + total.toLocaleString("es-AR");
}

// Borra un gasto de la lista
function borrarGasto(indice) {
  gastos.splice(indice, 1);
  guardar();
  mostrar();
}

// Cuando se envía el formulario, agrega el gasto
form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const gasto = {
    descripcion: document.getElementById("descripcion").value,
    monto: parseFloat(document.getElementById("monto").value),
    categoria: document.getElementById("categoria").value
  };

  gastos.push(gasto);
  guardar();
  mostrar();
  form.reset();
});

// Al abrir la página, mostramos lo que ya estaba guardado
mostrar();
