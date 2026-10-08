import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ===== Conexión con Firebase =====
const firebaseConfig = {
  apiKey: "AIzaSyCMm9GUxBuRKkyeVAjy6P01ulBqdeCynOY",
  authDomain: "mylifework-28bdc.firebaseapp.com",
  projectId: "mylifework-28bdc",
  storageBucket: "mylifework-28bdc.firebasestorage.app",
  messagingSenderId: "823920866780",
  appId: "1:823920866780:web:e4876a7889dd58049f0b19"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Atajo para buscar elementos de la página por su id
const $ = function (id) { return document.getElementById(id); };

// ===== Elementos: login y menú =====
const pantallaAuth = $("pantalla-auth");
const pantallaApp = $("app");
const emailUsuario = $("usuario-email");
const bienvenidaEmail = $("bienvenida-email");
const formAuth = $("form-auth");
const errorAuth = $("auth-error");
const tituloAuth = $("auth-titulo");
const botonAuth = $("auth-boton");
const textoAuth = $("auth-texto");
const cambiarAuth = $("auth-cambiar");
const flechaCalendario = $("flecha-calendario");
const submenuCalendario = $("submenu-calendario");
const flechaInversiones = $("flecha-inversiones");
const submenuInversiones = $("submenu-inversiones");

// ===== Elementos: billetera =====
const form = $("form-gasto");
const lista = $("lista-gastos");
const fechaInput = $("fecha");
const totalIngresosEl = $("total-ingresos");
const totalGastosEl = $("total-gastos");
const totalSaldoEl = $("total-saldo");
const balanceGeneralEl = $("balance-general");
const botonesPeriodo = document.querySelectorAll(".periodo-btn");
const botonesModo = document.querySelectorAll(".modo-btn");
const bloquePeriodo = $("bloque-periodo");
const navPeriodo = $("periodo-nav");
const rangoPeriodo = $("periodo-rango");
const etiquetaPeriodo = $("periodo-etiqueta");
const rangoDesde = $("rango-desde");
const rangoHasta = $("rango-hasta");
const calendarioGastos = $("calendario-gastos");
const calGrid = $("cal-grid");
const calEtiqueta = $("cal-etiqueta");

// ===== Elementos: inversiones =====
const invTitulo = $("inv-titulo");
const invResumen = $("inv-resumen");
const invEstado = $("inv-estado");
const invLista = $("inv-lista");
const invAyuda = $("inv-ayuda");
const formInversion = $("form-inversion");
const invCategoria = $("inv-categoria");
const invMoneda = $("inv-moneda");
const invFecha = $("inv-fecha");

// ===== Elementos: calendario =====
const workTitulo = $("work-titulo");
const workGrid = $("work-grid");
const workEtiqueta = $("work-etiqueta");
const formEvento = $("form-evento");
const evFecha = $("ev-fecha");
const evCalendario = $("ev-calendario");
const btnCargarDia = $("btn-cargar-dia");
const trResumen = $("trading-resumen");
const trTotal = $("tr-total");
const trDiasG = $("tr-dias-g");
const trDiasP = $("tr-dias-p");

// ===== Elementos: panel de un día de trading =====
const modalTrading = $("modal-trading");
const mtTitulo = $("mt-titulo");
const mtBorrar = $("mt-borrar");
const formTrading = $("form-trading");
const fResultado = $("f-resultado");
const fTrades = $("f-trades");
const fWins = $("f-wins");
const fLosses = $("f-losses");
const fNota = $("f-nota");
const fFotos = $("f-fotos");
const fPreviews = $("f-previews");
const visor = $("visor");
const visorImg = $("visor-img");

// ===== Estado =====
let modoRegistro = false;
let uidActual = null;
let desuscribir = [];
let errorAvisado = false;

let movimientos = [];
let eventos = [];
let tradingRegs = [];
let inversiones = [];

let periodo = "semana";
let referencia = new Date();
let modoBilletera = "lista";
let gastoCalRef = new Date();
let calActual = "todos";
let calRef = new Date();
let invActual = "todas";

let preciosVivos = {};
let firmaCodigos = "";

let modalFecha = null;
let fotosModal = [];

const nombresCal = {
  todos: "Calendario",
  trabajo: "Calendario de trabajo",
  estudio: "Calendario de estudio",
  actividades: "Calendario de actividades",
  trading: "Calendario de trading"
};

const nombresCortos = {
  trabajo: "Trabajo",
  estudio: "Estudio",
  actividades: "Actividades",
  trading: "Trading"
};

const nombresInv = {
  todas: "Inversiones",
  bursatil: "Mercado bursátil",
  cripto: "Criptomonedas",
  commodities: "Commodities",
  realestate: "Real estate",
  monedas: "Monedas",
  derivados: "Derivados"
};

const ordenCategorias = ["bursatil", "cripto", "commodities", "realestate", "monedas", "derivados"];

const ayudas = {
  bursatil: "Por ahora el precio actual se carga a mano con el lápiz ✎. El precio en vivo de acciones llega en la próxima etapa.",
  cripto: "Para precio en vivo escribí en «Código» el id de CoinGecko (ej: bitcoin, ethereum, solana). La moneda tiene que ser USD.",
  commodities: "Por ahora el precio actual se carga a mano con el lápiz ✎.",
  realestate: "El precio actual se carga a mano con el lápiz ✎ cuando quieras actualizar el valor.",
  monedas: "Para precio en vivo escribí en «Código»: dolar:blue, dolar:bolsa (MEP), dolar:contadoconliqui (CCL), dolar:oficial o dolar:mayorista. El precio es en pesos (ARS).",
  derivados: "El precio actual se carga a mano con el lápiz ✎."
};

const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ===== Ayudas =====
function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

// Las fechas se guardan como texto "2026-09-29" (año-mes-día)
function aTexto(fecha) {
  const a = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return a + "-" + m + "-" + d;
}

function deTexto(texto) {
  const partes = texto.split("-");
  return new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
}

function formatoPesos(numero) {
  const signo = numero < 0 ? "-" : "";
  return signo + "$" + Math.abs(numero).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

function formatoUSD(numero) {
  const signo = numero < 0 ? "-" : (numero > 0 ? "+" : "");
  return signo + "US$" + Math.abs(numero).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

// Elige texto blanco u oscuro según qué tan claro es el color de la actividad
function colorTexto(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160 ? "#0b2d4a" : "#ffffff";
}

function avisarError(que, error) {
  console.error(que, error);
  if (!errorAvisado) {
    errorAvisado = true;
    alert("No se pudo cargar " + que + " (" + error.code + "). Revisá las reglas de Firebase.");
  }
}

// ===== Menú lateral =====
const botonesNav = document.querySelectorAll(".menu-item, .menu-subitem");
const vistas = document.querySelectorAll(".vista");

function abrirSubmenu(submenu, flecha, abrir) {
  submenu.classList.toggle("oculto", !abrir);
  flecha.classList.toggle("abierta", abrir);
}

function irAVista(nombre) {
  vistas.forEach(function (vista) {
    vista.classList.toggle("oculto", vista.id !== "vista-" + nombre);
  });
  botonesNav.forEach(function (boton) {
    const mismaVista = boton.dataset.vista === nombre;
    let mismaSeccion = true;
    if (nombre === "calendario") mismaSeccion = boton.dataset.cal === calActual;
    if (nombre === "inversiones") mismaSeccion = boton.dataset.inv === invActual;
    boton.classList.toggle("activo", mismaVista && mismaSeccion);
  });
  if (nombre === "calendario") dibujarCalendarioWork();
  if (nombre === "inversiones") {
    if (invActual !== "todas") invCategoria.value = invActual;
    aplicarCategoria();
    dibujarInversiones();
    traerPrecios();
  }
}

botonesNav.forEach(function (boton) {
  boton.addEventListener("click", function () {
    const vista = boton.dataset.vista;
    if (vista === "calendario") calActual = boton.dataset.cal || "todos";
    if (vista === "inversiones") invActual = boton.dataset.inv || "todas";
    irAVista(vista);

    if (boton.classList.contains("menu-subitem")) {
      if (vista === "calendario") abrirSubmenu(submenuCalendario, flechaCalendario, true);
      if (vista === "inversiones") abrirSubmenu(submenuInversiones, flechaInversiones, true);
    }
  });
});

flechaCalendario.addEventListener("click", function () {
  abrirSubmenu(submenuCalendario, flechaCalendario, submenuCalendario.classList.contains("oculto"));
});

flechaInversiones.addEventListener("click", function () {
  abrirSubmenu(submenuInversiones, flechaInversiones, submenuInversiones.classList.contains("oculto"));
});

// ===== Login y registro =====
cambiarAuth.addEventListener("click", function (e) {
  e.preventDefault();
  modoRegistro = !modoRegistro;
  errorAuth.textContent = "";
  tituloAuth.textContent = modoRegistro ? "Crear cuenta" : "Iniciar sesión";
  botonAuth.textContent = modoRegistro ? "Registrarme" : "Entrar";
  textoAuth.textContent = modoRegistro ? "¿Ya tenés cuenta?" : "¿No tenés cuenta?";
  cambiarAuth.textContent = modoRegistro ? "Iniciá sesión" : "Registrate";
});

formAuth.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorAuth.textContent = "";
  const email = $("email").value;
  const password = $("password").value;

  try {
    if (modoRegistro) {
      await createUserWithEmailAndPassword(auth, email, password);
    } else {
      await signInWithEmailAndPassword(auth, email, password);
    }
    formAuth.reset();
  } catch (error) {
    errorAuth.textContent = traducirError(error.code);
  }
});

$("btn-salir").addEventListener("click", function () {
  signOut(auth);
});

function traducirError(codigo) {
  const mensajes = {
    "auth/invalid-credential": "Email o contraseña incorrectos.",
    "auth/invalid-email": "El email no es válido.",
    "auth/email-already-in-use": "Ese email ya está registrado.",
    "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
    "auth/too-many-requests": "Demasiados intentos. Probá más tarde.",
    "auth/operation-not-allowed": "El login por email no está habilitado en Firebase."
  };
  return mensajes[codigo] || "Ocurrió un error (" + codigo + ").";
}

// ===== Qué se ve según si hay sesión iniciada =====
onAuthStateChanged(auth, function (usuario) {
  if (usuario) {
    uidActual = usuario.uid;
    emailUsuario.textContent = usuario.email;
    bienvenidaEmail.textContent = usuario.email;
    pantallaAuth.classList.add("oculto");
    pantallaApp.classList.remove("oculto");
    calActual = "todos";
    invActual = "todas";
    irAVista("inicio");
    fechaInput.value = aTexto(new Date());
    evFecha.value = aTexto(new Date());
    invFecha.value = aTexto(new Date());
    errorAvisado = false;
    escucharTodo();
  } else {
    uidActual = null;
    detenerEscuchas();
    movimientos = [];
    eventos = [];
    tradingRegs = [];
    inversiones = [];
    preciosVivos = {};
    firmaCodigos = "";
    cerrarModalTrading();
    actualizarPeriodo();
    dibujarCalendarioWork();
    dibujarInversiones();
    pantallaAuth.classList.remove("oculto");
    pantallaApp.classList.add("oculto");
  }
});

// ===== Datos en la nube (cada usuario tiene lo suyo) =====
function coleccion(nombre) {
  return collection(db, "usuarios", uidActual, nombre);
}

function detenerEscuchas() {
  desuscribir.forEach(function (fn) { fn(); });
  desuscribir = [];
}

function escucharTodo() {
  detenerEscuchas();

  // Movimientos de la billetera
  desuscribir.push(onSnapshot(
    query(coleccion("gastos"), orderBy("creado", "desc")),
    function (resultado) {
      movimientos = resultado.docs.map(function (d) {
        const datos = d.data({ serverTimestamps: "estimate" });
        return {
          id: d.id,
          // Los movimientos viejos no tenían tipo ni fecha: se toman como gasto del día en que se cargaron
          tipo: datos.tipo || "gasto",
          fecha: datos.fecha || (datos.creado ? aTexto(datos.creado.toDate()) : aTexto(new Date())),
          descripcion: datos.descripcion,
          monto: datos.monto,
          categoria: datos.categoria,
          medio: datos.medio || ""
        };
      });
      actualizarPeriodo();
    },
    function (error) { avisarError("los movimientos", error); }
  ));

  // Actividades del calendario
  desuscribir.push(onSnapshot(
    coleccion("eventos"),
    function (resultado) {
      eventos = resultado.docs.map(function (d) {
        return { id: d.id, ...d.data() };
      });
      dibujarCalendarioWork();
    },
    function (error) { avisarError("las actividades", error); }
  ));

  // Días de trading (un documento por día, con el nombre de la fecha)
  desuscribir.push(onSnapshot(
    coleccion("trading"),
    function (resultado) {
      tradingRegs = resultado.docs.map(function (d) {
        const x = d.data();
        return {
          fecha: x.fecha || d.id,
          resultado: x.resultado || 0,
          trades: x.trades || 0,
          ganados: x.ganados || 0,
          perdidos: x.perdidos || 0,
          nota: x.nota || "",
          fotos: x.fotos || []
        };
      });
      dibujarCalendarioWork();
    },
    function (error) { avisarError("el trading", error); }
  ));

  // Inversiones
  desuscribir.push(onSnapshot(
    query(coleccion("inversiones"), orderBy("creado", "desc")),
    function (resultado) {
      inversiones = resultado.docs.map(function (d) {
        const x = d.data({ serverTimestamps: "estimate" });
        return {
          id: d.id,
          categoria: x.categoria || "bursatil",
          nombre: x.nombre || "",
          cantidad: x.cantidad || 0,
          precio: x.precio || 0,
          moneda: x.moneda || "USD",
          fecha: x.fecha || "",
          broker: x.broker || "",
          codigo: x.codigo || "",
          manual: typeof x.manual === "number" ? x.manual : null
        };
      });

      // Si cambiaron los códigos de precio en vivo, se vuelven a pedir los precios
      const firma = inversiones
        .filter(function (i) { return i.codigo; })
        .map(function (i) { return i.categoria + ":" + i.codigo; })
        .sort()
        .join("|");
      if (firma !== firmaCodigos) {
        firmaCodigos = firma;
        traerPrecios();
      }
      dibujarInversiones();
    },
    function (error) { avisarError("las inversiones", error); }
  ));
}

// ===================================================================
// BILLETERA
// ===================================================================

// ===== Período: día, semana, mes, año o fechas a elección =====
function rangoActual() {
  const y = referencia.getFullYear();
  const m = referencia.getMonth();
  const d = referencia.getDate();

  if (periodo === "dia") {
    return { desde: aTexto(referencia), hasta: aTexto(referencia) };
  }
  if (periodo === "semana") {
    const dif = (referencia.getDay() + 6) % 7; // la semana empieza el lunes
    return {
      desde: aTexto(new Date(y, m, d - dif)),
      hasta: aTexto(new Date(y, m, d - dif + 6))
    };
  }
  if (periodo === "mes") {
    return { desde: aTexto(new Date(y, m, 1)), hasta: aTexto(new Date(y, m + 1, 0)) };
  }
  if (periodo === "anio") {
    return { desde: aTexto(new Date(y, 0, 1)), hasta: aTexto(new Date(y, 11, 31)) };
  }
  return { desde: rangoDesde.value, hasta: rangoHasta.value };
}

function textoEtiqueta(rango) {
  if (periodo === "dia") {
    return referencia.toLocaleDateString("es-AR", {
      weekday: "long", day: "numeric", month: "long", year: "numeric"
    });
  }
  if (periodo === "semana") {
    const inicio = deTexto(rango.desde);
    const fin = deTexto(rango.hasta);
    const corto = { day: "numeric", month: "short" };
    return inicio.toLocaleDateString("es-AR", corto) + " – " +
      fin.toLocaleDateString("es-AR", corto) + " " + fin.getFullYear();
  }
  if (periodo === "mes") {
    return referencia.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  }
  if (periodo === "anio") {
    return String(referencia.getFullYear());
  }
  return "";
}

function actualizarPeriodo() {
  botonesPeriodo.forEach(function (boton) {
    boton.classList.toggle("activo", boton.dataset.periodo === periodo);
  });
  const esRango = periodo === "rango";
  navPeriodo.classList.toggle("oculto", esRango);
  rangoPeriodo.classList.toggle("oculto", !esRango);
  etiquetaPeriodo.textContent = textoEtiqueta(rangoActual());
  actualizarBilletera();
}

function moverPeriodo(delta) {
  const y = referencia.getFullYear();
  const m = referencia.getMonth();
  const d = referencia.getDate();

  if (periodo === "dia") referencia = new Date(y, m, d + delta);
  if (periodo === "semana") referencia = new Date(y, m, d + 7 * delta);
  if (periodo === "mes") referencia = new Date(y, m + delta, 1);
  if (periodo === "anio") referencia = new Date(y + delta, 0, 1);
  actualizarPeriodo();
}

botonesPeriodo.forEach(function (boton) {
  boton.addEventListener("click", function () {
    periodo = boton.dataset.periodo;
    actualizarPeriodo();
  });
});

$("periodo-anterior").addEventListener("click", function () { moverPeriodo(-1); });
$("periodo-siguiente").addEventListener("click", function () { moverPeriodo(1); });
rangoDesde.addEventListener("change", actualizarBilletera);
rangoHasta.addEventListener("change", actualizarBilletera);

// ===== Lista o calendario =====
botonesModo.forEach(function (boton) {
  boton.addEventListener("click", function () {
    modoBilletera = boton.dataset.modo;
    if (modoBilletera === "calendario") {
      gastoCalRef = new Date(referencia.getFullYear(), referencia.getMonth(), 1);
    }
    actualizarBilletera();
  });
});

$("cal-anterior").addEventListener("click", function () {
  gastoCalRef = new Date(gastoCalRef.getFullYear(), gastoCalRef.getMonth() - 1, 1);
  actualizarBilletera();
});

$("cal-siguiente").addEventListener("click", function () {
  gastoCalRef = new Date(gastoCalRef.getFullYear(), gastoCalRef.getMonth() + 1, 1);
  actualizarBilletera();
});

function actualizarBilletera() {
  const enCalendario = modoBilletera === "calendario";

  botonesModo.forEach(function (boton) {
    boton.classList.toggle("activo", boton.dataset.modo === modoBilletera);
  });
  bloquePeriodo.classList.toggle("oculto", enCalendario);
  lista.classList.toggle("oculto", enCalendario);
  calendarioGastos.classList.toggle("oculto", !enCalendario);

  let rango;
  if (enCalendario) {
    const y = gastoCalRef.getFullYear();
    const m = gastoCalRef.getMonth();
    rango = { desde: aTexto(new Date(y, m, 1)), hasta: aTexto(new Date(y, m + 1, 0)) };
  } else {
    rango = rangoActual();
  }

  const visibles = movimientos.filter(function (mov) {
    return (!rango.desde || mov.fecha >= rango.desde) &&
           (!rango.hasta || mov.fecha <= rango.hasta);
  });

  visibles.sort(function (a, b) {
    if (a.fecha < b.fecha) return 1;
    if (a.fecha > b.fecha) return -1;
    return 0;
  });

  let ingresos = 0;
  let gastos = 0;
  visibles.forEach(function (mov) {
    if (mov.tipo === "ingreso") {
      ingresos += mov.monto;
    } else {
      gastos += mov.monto;
    }
  });

  totalIngresosEl.textContent = formatoPesos(ingresos);
  totalGastosEl.textContent = formatoPesos(gastos);
  totalSaldoEl.textContent = formatoPesos(ingresos - gastos);

  // Balance general: suma de TODOS los movimientos, sin importar el período elegido
  let balance = 0;
  movimientos.forEach(function (mov) {
    balance += mov.tipo === "ingreso" ? mov.monto : -mov.monto;
  });
  balanceGeneralEl.textContent = formatoPesos(balance);

  if (enCalendario) {
    dibujarCalendarioGastos(visibles);
  } else {
    dibujarLista(visibles);
  }
}

function dibujarLista(visibles) {
  lista.innerHTML = "";

  if (visibles.length === 0) {
    lista.appendChild(crear("li", "vacio", "No hay movimientos en este período."));
    return;
  }

  visibles.forEach(function (mov) {
    const li = crear("li");

    const izquierda = crear("div");
    const fechaCorta = deTexto(mov.fecha).toLocaleDateString("es-AR", {
      day: "numeric", month: "short"
    });
    const detalle = [fechaCorta, mov.categoria, mov.medio].filter(Boolean).join(" · ");
    izquierda.append(crear("strong", null, mov.descripcion), crear("small", null, detalle));

    const derecha = crear("div");
    const monto = crear(
      "span",
      "monto " + (mov.tipo === "ingreso" ? "ingreso" : "gasto"),
      (mov.tipo === "ingreso" ? "+" : "-") + formatoPesos(mov.monto)
    );
    const borrar = crear("button", "borrar", "✕");
    borrar.addEventListener("click", function () {
      borrarMovimiento(mov.id);
    });
    derecha.append(monto, borrar);

    li.append(izquierda, derecha);
    lista.appendChild(li);
  });
}

// Calendario del mes con cada ingreso (verde) y gasto (rojo)
function dibujarCalendarioGastos(visibles) {
  const y = gastoCalRef.getFullYear();
  const m = gastoCalRef.getMonth();
  calEtiqueta.textContent = gastoCalRef.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  calGrid.innerHTML = "";

  diasSemana.forEach(function (nombre) {
    calGrid.appendChild(crear("div", "cal-cab", nombre));
  });

  const diasMes = new Date(y, m + 1, 0).getDate();
  const vacios = (new Date(y, m, 1).getDay() + 6) % 7;
  const hoy = aTexto(new Date());

  for (let i = 0; i < vacios; i++) {
    calGrid.appendChild(crear("div", "cal-vacio"));
  }

  for (let dia = 1; dia <= diasMes; dia++) {
    const fecha = aTexto(new Date(y, m, dia));
    const celda = crear("div", "cal-dia" + (fecha === hoy ? " hoy" : ""));
    celda.appendChild(crear("div", "cal-dia-num", String(dia)));

    const delDia = visibles.filter(function (mov) { return mov.fecha === fecha; });
    delDia.slice(0, 3).forEach(function (mov) {
      const esIngreso = mov.tipo === "ingreso";
      const caja = crear("div", "cal-mov " + (esIngreso ? "mov-ingreso" : "mov-gasto"));
      caja.append(
        crear("strong", null, (esIngreso ? "+" : "-") + formatoPesos(mov.monto)),
        crear("small", null, mov.categoria)
      );
      celda.appendChild(caja);
    });
    if (delDia.length > 3) {
      celda.appendChild(crear("div", "cal-mas", "+" + (delDia.length - 3) + " más"));
    }

    calGrid.appendChild(celda);
  }
}

async function borrarMovimiento(id) {
  try {
    await deleteDoc(doc(db, "usuarios", uidActual, "gastos", id));
  } catch (error) {
    alert("No se pudo borrar el movimiento (" + error.code + ").");
  }
}

form.addEventListener("submit", async function (evento) {
  evento.preventDefault();
  const fecha = fechaInput.value;

  try {
    await addDoc(coleccion("gastos"), {
      tipo: $("tipo").value,
      fecha: fecha,
      descripcion: $("descripcion").value,
      monto: parseFloat($("monto").value),
      categoria: $("categoria").value,
      medio: $("medio").value,
      creado: serverTimestamp()
    });
    form.reset();
    fechaInput.value = aTexto(new Date());

    // La vista salta al período de lo que cargaste para que lo veas
    if (periodo !== "rango") {
      referencia = deTexto(fecha);
    }
    gastoCalRef = new Date(deTexto(fecha).getFullYear(), deTexto(fecha).getMonth(), 1);
    actualizarPeriodo();
  } catch (error) {
    alert("No se pudo guardar el movimiento (" + error.code + ").");
  }
});

// ===================================================================
// INVERSIONES
// ===================================================================

function aplicarCategoria() {
  const cat = invCategoria.value;
  if (cat === "cripto") invMoneda.value = "USD";
  if (cat === "monedas") invMoneda.value = "ARS";
  invAyuda.textContent = ayudas[cat] || "";
}

invCategoria.addEventListener("change", aplicarCategoria);

function dinero(numero, moneda) {
  const signo = numero < 0 ? "-" : "";
  const simbolo = moneda === "USD" ? "US$" : "$";
  return signo + simbolo + Math.abs(numero).toLocaleString("es-AR", { maximumFractionDigits: 2 });
}

function dineroConSigno(numero, moneda) {
  return (numero > 0 ? "+" : "") + dinero(numero, moneda);
}

function precioUnidad(numero, moneda) {
  const simbolo = moneda === "USD" ? "US$" : "$";
  return simbolo + numero.toLocaleString("es-AR", { maximumFractionDigits: 6 });
}

function porcentaje(resultado, invertido) {
  if (!invertido) return "—";
  const p = (resultado / invertido) * 100;
  return (p > 0 ? "+" : "") + p.toLocaleString("es-AR", { maximumFractionDigits: 2 }) + "%";
}

// Qué precio actual usar para una inversión: en vivo, manual o ninguno
function precioActual(inv) {
  const esperada = inv.categoria === "cripto" ? "USD" : (inv.categoria === "monedas" ? "ARS" : null);

  if (inv.codigo && esperada) {
    const clave = inv.categoria + ":" + inv.codigo;
    if (typeof preciosVivos[clave] === "number") {
      if (inv.moneda === esperada) {
        return { valor: preciosVivos[clave], tipo: "vivo" };
      }
      if (inv.manual !== null) return { valor: inv.manual, tipo: "manual" };
      return { valor: null, tipo: "moneda" };
    }
  }

  if (inv.manual !== null) return { valor: inv.manual, tipo: "manual" };
  return { valor: null, tipo: inv.codigo && esperada ? "error" : "sin" };
}

const etiquetasPrecio = {
  vivo: "en vivo",
  manual: "manual",
  sin: "sin precio",
  error: "sin dato en vivo",
  moneda: "moneda distinta"
};

// Trae los precios en vivo (dólar desde DolarAPI y cripto desde CoinGecko)
async function traerPrecios() {
  if (!uidActual) return;

  const conCodigo = inversiones.filter(function (i) { return i.codigo; });
  const monedas = conCodigo.filter(function (i) { return i.categoria === "monedas"; });
  const cripto = conCodigo.filter(function (i) { return i.categoria === "cripto"; });

  if (monedas.length === 0 && cripto.length === 0) {
    invEstado.textContent = "";
    dibujarInversiones();
    return;
  }

  invEstado.textContent = "Actualizando precios…";
  const nuevos = {};
  const fallos = [];

  if (monedas.length > 0) {
    try {
      const pideDolar = monedas.some(function (i) { return i.codigo.startsWith("dolar:"); });
      const pideOtras = monedas.some(function (i) { return !i.codigo.startsWith("dolar:"); });

      if (pideDolar) {
        const resp = await fetch("https://dolarapi.com/v1/dolares");
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        const datos = await resp.json();
        datos.forEach(function (d) {
          if (typeof d.venta === "number") nuevos["monedas:dolar:" + d.casa] = d.venta;
        });
      }
      if (pideOtras) {
        const resp = await fetch("https://dolarapi.com/v1/cotizaciones");
        if (!resp.ok) throw new Error("HTTP " + resp.status);
        const datos = await resp.json();
        datos.forEach(function (d) {
          if (typeof d.venta === "number") nuevos["monedas:" + String(d.moneda).toLowerCase()] = d.venta;
        });
      }
    } catch (error) {
      console.error("Monedas", error);
      fallos.push("monedas");
    }
  }

  if (cripto.length > 0) {
    try {
      const ids = Array.from(new Set(cripto.map(function (i) { return i.codigo; }))).join(",");
      const resp = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=" + encodeURIComponent(ids) + "&vs_currencies=usd"
      );
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const datos = await resp.json();
      Object.keys(datos).forEach(function (id) {
        if (datos[id] && typeof datos[id].usd === "number") nuevos["cripto:" + id] = datos[id].usd;
      });
    } catch (error) {
      console.error("Criptomonedas", error);
      fallos.push("criptomonedas");
    }
  }

  preciosVivos = Object.assign({}, preciosVivos, nuevos);

  if (fallos.length > 0) {
    invEstado.textContent = "No se pudieron traer los precios de " + fallos.join(" y ") +
      ". Puede ser el límite del servicio o un bloqueo del navegador. Mientras tanto podés cargar el precio a mano con el lápiz ✎.";
  } else {
    const hora = new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
    invEstado.textContent = "Precios en vivo actualizados a las " + hora + ".";
  }
  dibujarInversiones();
}

// Cada minuto se actualizan los precios, solo si estás mirando Inversiones
setInterval(function () {
  if (uidActual && !$("vista-inversiones").classList.contains("oculto")) {
    traerPrecios();
  }
}, 60000);

function dibujarInversiones() {
  invTitulo.textContent = nombresInv[invActual];
  invResumen.innerHTML = "";
  invLista.innerHTML = "";

  const visibles = inversiones.filter(function (i) {
    return invActual === "todas" || i.categoria === invActual;
  });

  if (visibles.length === 0) {
    invLista.appendChild(crear("div", "inv-vacio", "Todavía no cargaste inversiones en esta sección."));
    return;
  }

  // Resumen: un bloque por moneda (no se mezclan USD y ARS)
  ["USD", "ARS"].forEach(function (moneda) {
    const deMoneda = visibles.filter(function (i) { return i.moneda === moneda; });
    if (deMoneda.length === 0) return;

    let invertido = 0;
    let actual = 0;
    deMoneda.forEach(function (i) {
      const costo = i.cantidad * i.precio;
      const p = precioActual(i);
      invertido += costo;
      actual += p.valor === null ? costo : i.cantidad * p.valor;
    });
    const resultado = actual - invertido;
    const clase = resultado > 0 ? "pos" : (resultado < 0 ? "neg" : "");

    const tarjeta = crear("div", "inv-resumen-card");
    tarjeta.appendChild(crear("h4", null, "Resumen en " + moneda));

    const cajas = crear("div", "inv-cajas");

    const c1 = crear("div", "inv-caja");
    c1.append(crear("span", null, "Invertido"), crear("strong", null, dinero(invertido, moneda)));

    const c2 = crear("div", "inv-caja");
    c2.append(crear("span", null, "Valor actual"), crear("strong", null, dinero(actual, moneda)));

    const c3 = crear("div", "inv-caja");
    c3.append(
      crear("span", null, "Resultado"),
      crear("strong", clase, dineroConSigno(resultado, moneda) + " (" + porcentaje(resultado, invertido) + ")")
    );

    cajas.append(c1, c2, c3);
    tarjeta.appendChild(cajas);
    invResumen.appendChild(tarjeta);
  });

  // Lista agrupada por sección
  ordenCategorias.forEach(function (cat) {
    const delGrupo = visibles.filter(function (i) { return i.categoria === cat; });
    if (delGrupo.length === 0) return;

    const grupo = crear("div", "inv-grupo");
    grupo.appendChild(crear("h3", null, nombresInv[cat]));

    delGrupo.forEach(function (inv) {
      const costo = inv.cantidad * inv.precio;
      const p = precioActual(inv);
      const valorActual = p.valor === null ? costo : inv.cantidad * p.valor;
      const resultado = valorActual - costo;
      const clase = resultado > 0 ? "pos" : (resultado < 0 ? "neg" : "");

      const fila = crear("div", "inv-fila");

      // Nombre y detalle
      const nombre = crear("div", "inv-nombre");
      nombre.appendChild(crear("strong", null, inv.nombre));
      const fechaCorta = inv.fecha
        ? deTexto(inv.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })
        : "";
      const cantidadTexto = inv.cantidad.toLocaleString("es-AR", { maximumFractionDigits: 8 }) + " u.";
      nombre.appendChild(crear("small", null, [cantidadTexto, inv.broker, fechaCorta].filter(Boolean).join(" · ")));

      // Precios
      const precios = crear("div", "inv-bloque");
      precios.appendChild(crear("small", null, "Compra"));
      precios.appendChild(crear("strong", null, precioUnidad(inv.precio, inv.moneda)));
      const lineaActual = crear("small", null, "Actual ");
      lineaActual.appendChild(crear("span", "badge " + (p.tipo === "vivo" ? "vivo" : (p.tipo === "manual" ? "manual" : "error")), etiquetasPrecio[p.tipo]));
      precios.appendChild(lineaActual);
      precios.appendChild(crear("strong", null, p.valor === null ? "—" : precioUnidad(p.valor, inv.moneda)));

      // Resultado
      const res = crear("div", "inv-bloque");
      res.appendChild(crear("small", null, "Resultado"));
      res.appendChild(crear("strong", clase, p.valor === null ? "—" : dineroConSigno(resultado, inv.moneda)));
      res.appendChild(crear("small", null, p.valor === null ? "" : porcentaje(resultado, costo)));

      // Acciones
      const acciones = crear("div");
      if (p.tipo !== "vivo") {
        const editar = crear("button", "borrar", "✎");
        editar.title = "Cargar el precio actual a mano";
        editar.addEventListener("click", function () {
          editarPrecioManual(inv);
        });
        acciones.appendChild(editar);
      }
      const borrar = crear("button", "borrar", "✕");
      borrar.title = "Borrar";
      borrar.addEventListener("click", function () {
        borrarInversion(inv);
      });
      acciones.appendChild(borrar);

      fila.append(nombre, precios, res, acciones);
      grupo.appendChild(fila);
    });

    invLista.appendChild(grupo);
  });
}

async function editarPrecioManual(inv) {
  const texto = prompt(
    "Precio actual por unidad (" + inv.moneda + "). Usá punto para los decimales:",
    inv.manual !== null ? String(inv.manual) : ""
  );
  if (texto === null) return;

  const valor = parseFloat(String(texto).replace(",", "."));
  if (isNaN(valor) || valor < 0) {
    alert("Ingresá un número válido.");
    return;
  }

  try {
    await updateDoc(doc(db, "usuarios", uidActual, "inversiones", inv.id), { manual: valor });
  } catch (error) {
    alert("No se pudo guardar el precio (" + error.code + ").");
  }
}

async function borrarInversion(inv) {
  if (!confirm("¿Borrar " + inv.nombre + "?")) return;
  try {
    await deleteDoc(doc(db, "usuarios", uidActual, "inversiones", inv.id));
  } catch (error) {
    alert("No se pudo borrar la inversión (" + error.code + ").");
  }
}

formInversion.addEventListener("submit", async function (e) {
  e.preventDefault();

  const manualTexto = $("inv-manual").value;

  try {
    await addDoc(coleccion("inversiones"), {
      categoria: invCategoria.value,
      nombre: $("inv-nombre").value.trim(),
      cantidad: parseFloat($("inv-cantidad").value),
      precio: parseFloat($("inv-precio").value),
      moneda: invMoneda.value,
      fecha: invFecha.value,
      broker: $("inv-broker").value.trim(),
      codigo: $("inv-codigo").value.trim().toLowerCase(),
      manual: manualTexto === "" ? null : parseFloat(manualTexto),
      creado: serverTimestamp()
    });

    const categoria = invCategoria.value;
    formInversion.reset();
    invCategoria.value = categoria;
    invFecha.value = aTexto(new Date());
    aplicarCategoria();
  } catch (error) {
    alert("No se pudo guardar la inversión (" + error.code + ").");
  }
});

// ===================================================================
// CALENDARIO (todos / trabajo / estudio / actividades / trading)
// ===================================================================

$("work-anterior").addEventListener("click", function () {
  calRef = new Date(calRef.getFullYear(), calRef.getMonth() - 1, 1);
  dibujarCalendarioWork();
});

$("work-siguiente").addEventListener("click", function () {
  calRef = new Date(calRef.getFullYear(), calRef.getMonth() + 1, 1);
  dibujarCalendarioWork();
});

function dibujarCalendarioWork() {
  const esTrading = calActual === "trading";

  workTitulo.textContent = nombresCal[calActual];
  formEvento.classList.toggle("oculto", esTrading);
  btnCargarDia.classList.toggle("oculto", !esTrading);
  trResumen.classList.toggle("oculto", !esTrading);
  if (!esTrading && calActual !== "todos") evCalendario.value = calActual;

  const y = calRef.getFullYear();
  const m = calRef.getMonth();
  workEtiqueta.textContent = calRef.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  workGrid.innerHTML = "";
  workGrid.classList.toggle("trading", esTrading);

  const cabeceras = diasSemana.slice();
  if (esTrading) cabeceras.push("Semana");
  cabeceras.forEach(function (nombre) {
    workGrid.appendChild(crear("div", "cal-cab", nombre));
  });

  const diasMes = new Date(y, m + 1, 0).getDate();
  const vacios = (new Date(y, m, 1).getDay() + 6) % 7;
  const totalCeldas = Math.ceil((vacios + diasMes) / 7) * 7;
  const hoy = aTexto(new Date());

  // Para el total de cada semana del trading
  let sumaSemana = 0;
  let tradesSemana = 0;
  let hayDatosSemana = false;

  for (let i = 0; i < totalCeldas; i++) {
    const dia = i - vacios + 1;

    if (dia < 1 || dia > diasMes) {
      workGrid.appendChild(crear("div", "cal-vacio"));
    } else {
      const fecha = aTexto(new Date(y, m, dia));

      if (esTrading) {
        const reg = tradingRegs.find(function (r) { return r.fecha === fecha; });
        if (reg) {
          sumaSemana += reg.resultado;
          tradesSemana += reg.trades;
          hayDatosSemana = true;
        }
        workGrid.appendChild(celdaTrading(fecha, dia, reg, hoy));
      } else {
        workGrid.appendChild(celdaDiaWork(fecha, dia, hoy));
      }
    }

    // Al cerrar cada semana, el calendario de trading suma su total
    if (esTrading && (i + 1) % 7 === 0) {
      workGrid.appendChild(celdaSemana(hayDatosSemana, sumaSemana, tradesSemana));
      sumaSemana = 0;
      tradesSemana = 0;
      hayDatosSemana = false;
    }
  }

  if (esTrading) actualizarResumenTrading(y, m);
}

// Día del calendario normal: muestra las actividades (y el trading cuando se ven todos)
function celdaDiaWork(fecha, dia, hoy) {
  const celda = crear("div", "cal-dia" + (fecha === hoy ? " hoy" : ""));
  celda.appendChild(crear("div", "cal-dia-num", String(dia)));

  // Tocar un día prepara la fecha del formulario de actividades
  celda.addEventListener("click", function () {
    evFecha.value = fecha;
  });

  const delDia = eventos
    .filter(function (ev) {
      return ev.fecha === fecha && (calActual === "todos" || ev.calendario === calActual);
    })
    .sort(function (a, b) {
      return (a.hora || "").localeCompare(b.hora || "");
    });

  delDia.forEach(function (ev) {
    const color = ev.color || "#2f7fbf";
    const caja = crear("div", "cal-evento");
    caja.style.backgroundColor = color;
    caja.style.color = colorTexto(color);

    const texto = crear("div", "cal-evento-texto");
    texto.appendChild(crear("strong", null, ev.titulo));
    const detalle = [ev.hora, calActual === "todos" ? nombresCortos[ev.calendario] : ""]
      .filter(Boolean).join(" · ");
    if (detalle) texto.appendChild(crear("small", null, detalle));

    const quitar = crear("button", "cal-evento-x", "✕");
    quitar.addEventListener("click", function () {
      borrarEvento(ev.id);
    });

    caja.append(texto, quitar);
    celda.appendChild(caja);
  });

  // En el calendario general también aparece el resultado del trading del día
  if (calActual === "todos") {
    const reg = tradingRegs.find(function (r) { return r.fecha === fecha; });
    if (reg) {
      const caja = crear("div", "cal-evento");
      caja.style.backgroundColor = reg.resultado >= 0 ? "#4caf7a" : "#e0606b";
      const texto = crear("div", "cal-evento-texto");
      texto.appendChild(crear("strong", null, formatoUSD(reg.resultado)));
      texto.appendChild(crear("small", null, "Trading"));
      caja.appendChild(texto);
      celda.appendChild(caja);
    }
  }

  return celda;
}

// Día del calendario de trading: verde si ganaste, rojo si perdiste
function celdaTrading(fecha, dia, reg, hoy) {
  let clase = "cal-dia tr-cell";
  if (fecha === hoy) clase += " hoy";
  if (reg && reg.resultado > 0) clase += " tr-ganado";
  if (reg && reg.resultado < 0) clase += " tr-perdido";

  const celda = crear("div", clase);
  celda.appendChild(crear("div", "cal-dia-num", String(dia)));

  if (reg) {
    celda.appendChild(crear("span", "tr-monto", formatoUSD(reg.resultado)));
    if (reg.trades) {
      celda.appendChild(crear("span", "tr-trades", reg.trades + (reg.trades === 1 ? " trade" : " trades")));
    }
    if (reg.ganados || reg.perdidos) {
      celda.appendChild(crear("span", "tr-trades", "G " + reg.ganados + " · P " + reg.perdidos));
    }
    if (reg.nota) {
      celda.appendChild(crear("span", "tr-nota", reg.nota));
    }
    if (reg.fotos.length) {
      celda.appendChild(crear("span", "tr-trades", "📷 " + reg.fotos.length));
    }
  }

  // Tocar un día abre el panel para cargarlo o verlo
  celda.addEventListener("click", function () {
    abrirModalTrading(fecha);
  });

  return celda;
}

function celdaSemana(hayDatos, suma, trades) {
  const celda = crear("div", "tr-semana");
  celda.appendChild(crear("span", null, "Semana"));
  if (hayDatos) {
    celda.appendChild(crear("strong", suma >= 0 ? "pos" : "neg", formatoUSD(suma)));
    if (trades) celda.appendChild(crear("span", null, trades + " trades"));
  } else {
    celda.appendChild(crear("strong", null, "—"));
  }
  return celda;
}

function actualizarResumenTrading(y, m) {
  const prefijo = y + "-" + String(m + 1).padStart(2, "0") + "-";
  const delMes = tradingRegs.filter(function (r) { return r.fecha.startsWith(prefijo); });

  let total = 0;
  let ganados = 0;
  let perdidos = 0;
  delMes.forEach(function (r) {
    total += r.resultado;
    if (r.resultado > 0) ganados++;
    if (r.resultado < 0) perdidos++;
  });

  trTotal.textContent = formatoUSD(total);
  trTotal.className = total > 0 ? "ingreso" : (total < 0 ? "gasto" : "");
  trDiasG.textContent = String(ganados);
  trDiasP.textContent = String(perdidos);
}

async function borrarEvento(id) {
  try {
    await deleteDoc(doc(db, "usuarios", uidActual, "eventos", id));
  } catch (error) {
    alert("No se pudo borrar la actividad (" + error.code + ").");
  }
}

formEvento.addEventListener("submit", async function (e) {
  e.preventDefault();
  const fecha = evFecha.value;

  try {
    await addDoc(coleccion("eventos"), {
      titulo: $("ev-titulo").value,
      fecha: fecha,
      hora: $("ev-hora").value,
      calendario: evCalendario.value,
      color: $("ev-color").value,
      creado: serverTimestamp()
    });
    $("ev-titulo").value = "";
    $("ev-hora").value = "";
    calRef = new Date(deTexto(fecha).getFullYear(), deTexto(fecha).getMonth(), 1);
    dibujarCalendarioWork();
  } catch (error) {
    alert("No se pudo guardar la actividad (" + error.code + ").");
  }
});

// ===================================================================
// PANEL DE UN DÍA DE TRADING (con fotos)
// ===================================================================

btnCargarDia.addEventListener("click", function () {
  abrirModalTrading(aTexto(new Date()));
});

function abrirModalTrading(fecha) {
  modalFecha = fecha;
  const reg = tradingRegs.find(function (r) { return r.fecha === fecha; });

  mtTitulo.textContent = deTexto(fecha).toLocaleDateString("es-AR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });
  fResultado.value = reg ? reg.resultado : "";
  fTrades.value = reg && reg.trades ? reg.trades : "";
  fWins.value = reg && reg.ganados ? reg.ganados : "";
  fLosses.value = reg && reg.perdidos ? reg.perdidos : "";
  fNota.value = reg ? reg.nota : "";
  fotosModal = reg ? reg.fotos.slice() : [];
  fFotos.value = "";
  mtBorrar.classList.toggle("oculto", !reg);

  dibujarPreviews();
  modalTrading.classList.remove("oculto");
  fResultado.focus();
}

function cerrarModalTrading() {
  modalTrading.classList.add("oculto");
  visor.classList.add("oculto");
  modalFecha = null;
  fotosModal = [];
}

function dibujarPreviews() {
  fPreviews.innerHTML = "";
  fotosModal.forEach(function (foto, indice) {
    const caja = crear("div", "preview");

    const img = document.createElement("img");
    img.src = foto;
    img.alt = "Foto del trade";
    img.addEventListener("click", function () {
      visorImg.src = foto;
      visor.classList.remove("oculto");
    });

    const quitar = crear("button", null, "✕");
    quitar.type = "button";
    quitar.addEventListener("click", function () {
      fotosModal.splice(indice, 1);
      dibujarPreviews();
    });

    caja.append(img, quitar);
    fPreviews.appendChild(caja);
  });
}

// Achica la foto en tu navegador para que entre en la base de datos
function comprimirImagen(archivo) {
  return new Promise(function (resolve, reject) {
    const lector = new FileReader();
    lector.onerror = reject;
    lector.onload = function () {
      const img = new Image();
      img.onerror = reject;
      img.onload = function () {
        const escala = Math.min(1, 900 / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * escala);
        canvas.height = Math.round(img.height * escala);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.65));
      };
      img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
  });
}

fFotos.addEventListener("change", async function () {
  const archivos = Array.from(fFotos.files);
  for (const archivo of archivos) {
    if (fotosModal.length >= 3) {
      alert("Podés guardar hasta 3 fotos por día.");
      break;
    }
    try {
      fotosModal.push(await comprimirImagen(archivo));
    } catch (error) {
      alert("No se pudo leer esa imagen.");
    }
  }
  fFotos.value = "";
  dibujarPreviews();
});

formTrading.addEventListener("submit", async function (e) {
  e.preventDefault();

  const peso = fotosModal.reduce(function (suma, foto) { return suma + foto.length; }, 0);
  if (peso > 850000) {
    alert("Las fotos pesan demasiado. Sacá alguna y probá de nuevo.");
    return;
  }

  const fecha = modalFecha;
  try {
    // El documento se llama como la fecha: guardar el mismo día otra vez lo reemplaza
    await setDoc(doc(db, "usuarios", uidActual, "trading", fecha), {
      fecha: fecha,
      resultado: parseFloat(fResultado.value),
      trades: parseInt(fTrades.value, 10) || 0,
      ganados: parseInt(fWins.value, 10) || 0,
      perdidos: parseInt(fLosses.value, 10) || 0,
      nota: fNota.value.trim(),
      fotos: fotosModal,
      creado: serverTimestamp()
    });
    calRef = new Date(deTexto(fecha).getFullYear(), deTexto(fecha).getMonth(), 1);
    cerrarModalTrading();
    dibujarCalendarioWork();
  } catch (error) {
    alert("No se pudo guardar el día (" + error.code + ").");
  }
});

mtBorrar.addEventListener("click", async function () {
  if (!modalFecha) return;
  try {
    await deleteDoc(doc(db, "usuarios", uidActual, "trading", modalFecha));
    cerrarModalTrading();
  } catch (error) {
    alert("No se pudo borrar el día (" + error.code + ").");
  }
});

$("mt-cerrar").addEventListener("click", cerrarModalTrading);

// Cerrar tocando el fondo oscuro o con la tecla Esc
modalTrading.addEventListener("click", function (e) {
  if (e.target === modalTrading) cerrarModalTrading();
});

visor.addEventListener("click", function () {
  visor.classList.add("oculto");
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (!visor.classList.contains("oculto")) {
      visor.classList.add("oculto");
    } else {
      cerrarModalTrading();
    }
  }
});

// Al abrir la página arranca en la vista semanal de la billetera
actualizarPeriodo();
