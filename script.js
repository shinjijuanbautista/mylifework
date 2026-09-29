import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

// ===== Elementos de la página =====
const seccionAuth = document.getElementById("auth");
const seccionGastos = document.getElementById("gastos");
const barraUsuario = document.getElementById("usuario-barra");
const emailUsuario = document.getElementById("usuario-email");
const formAuth = document.getElementById("form-auth");
const errorAuth = document.getElementById("auth-error");
const tituloAuth = document.getElementById("auth-titulo");
const botonAuth = document.getElementById("auth-boton");
const textoAuth = document.getElementById("auth-texto");
const cambiarAuth = document.getElementById("auth-cambiar");
const form = document.getElementById("form-gasto");
const lista = document.getElementById("lista-gastos");
const totalEl = document.getElementById("total");

let modoRegistro = false;
let uidActual = null;
let gastos = [];

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
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

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

document.getElementById("btn-salir").addEventListener("click", function () {
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
    gastos = JSON.parse(localStorage.getItem("gastos_" + uidActual)) || [];
    seccionAuth.classList.add("oculto");
    seccionGastos.classList.remove("oculto");
    barraUsuario.classList.remove("oculto");
    mostrar();
  } else {
    uidActual = null;
    gastos = [];
    seccionAuth.classList.remove("oculto");
    seccionGastos.classList.add("oculto");
    barraUsuario.classList.add("oculto");
  }
});

// ===== Gastos (guardados por usuario) =====
function guardar() {
  localStorage.setItem("gastos_" + uidActual, JSON.stringify(gastos));
}

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

// En módulos hay que colgar la función de "window" para que el onclick la encuentre
window.borrarGasto = function (indice) {
  gastos.splice(indice, 1);
  guardar();
  mostrar();
};

form.addEventListener("submit", function (evento) {
  evento.preventDefault();

  gastos.push({
    descripcion: document.getElementById("descripcion").value,
    monto: parseFloat(document.getElementById("monto").value),
    categoria: document.getElementById("categoria").value
  });

  guardar();
  mostrar();
  form.reset();
});
