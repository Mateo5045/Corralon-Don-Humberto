// CATALOGO DE PRODUCTOS
const productos = [
  { id: 1, nombre: "Cemento Holcim 50kg", categoria: "cemento", precio: 8500, imagen: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop" },
  { id: 2, nombre: "Cal Hidratada 25kg", categoria: "cemento", precio: 4200, imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop" },
  { id: 3, nombre: "Arena Fina (m3)", categoria: "aridos", precio: 12000, imagen: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop" },
  { id: 4, nombre: "Piedra Bocha (m3)", categoria: "aridos", precio: 16500, imagen: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?q=80&w=400&auto=format&fit=crop" },
  { id: 5, nombre: "Ladrillo Hueco 12x18x33", categoria: "ladrillos", precio: 450, imagen: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" },
  { id: 6, nombre: "Ladrillo Comun (Mil)", categoria: "ladrillos", precio: 95000, imagen: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop" },
  { id: 7, nombre: "Hierro del 8 (Barra 12m)", categoria: "hierros", precio: 9800, imagen: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?q=80&w=400&auto=format&fit=crop" },
  { id: 8, nombre: "Malla Cima 15x15 (2x3m)", categoria: "hierros", precio: 24000, imagen: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop" }
];

let carrito = [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
  { nombre: "Don Humberto", usuario: "admin", email: "admin@donhumberto.com.ar", password: "admin123", rol: "admin", compras: [] }
];

// INICIALIZACION
document.addEventListener('DOMContentLoaded', () => {
  renderizarProductos(productos);
  actualizarEstadoUsuario();
  actualizarCarrito();
});

// MODALES
function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }

window.onclick = function(e) {
  if (e.target.classList.contains('ventana-modal')) {
    e.target.style.display = 'none';
  }
};

// RENDERIZAR PRODUCTOS
function renderizarProductos(lista) {
  const contenedor = document.getElementById('contenedor-productos');
  contenedor.innerHTML = '';
  
  lista.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'tarjeta-producto';
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" class="imagen-producto">
      <h4>${prod.nombre}</h4>
      <div class="precio-producto">$${prod.precio.toLocaleString()}</div>
      <button class="boton boton-primario" onclick="agregarAlCarrito(${prod.id})">
        <i class="fa-solid fa-plus"></i> Agregar
      </button>
    `;
    contenedor.appendChild(card);
  });
}

function filtrarProductos() {
  const texto = document.getElementById('buscador-producto').value.toLowerCase();
  const cat = document.getElementById('filtro-categoria').value;
  
  const filtrados = productos.filter(p => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    const coincideCat = cat === 'todos' || p.categoria === cat;
    return coincideTexto && coincideCat;
  });
  
  renderizarProductos(filtrados);
}

// CARRITO
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const existe = carrito.find(item => item.id === id);
  
  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ ...prod, cantidad: 1 });
  }
  
  actualizarCarrito();
}

function actualizarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const contador = document.getElementById('contador-carrito');
  const totalElem = document.getElementById('total-precio-carrito');
  
  lista.innerHTML = '';
  let total = 0;
  let totalCount = 0;
  
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    totalCount += item.cantidad;
    
    const div = document.createElement('div');
    div.className = 'item-carrito';
    div.innerHTML = `
      <div>
        <strong>${item.nombre}</strong><br>
        <small>$${item.precio} x ${item.cantidad}</small>
      </div>
      <div>$${item.precio * item.cantidad}</div>
    `;
    lista.appendChild(div);
  });
  
  contador.innerText = totalCount;
  totalElem.innerText = total.toLocaleString();
}

function finalizarCompra() {
  if (carrito.length === 0) {
    alert("El carrito esta vacio");
    return;
  }
  if (!usuarioActual) {
    cerrarModal('modal-carrito');
    abrirModal('modal-login');
    alert("Inicia sesion para registrar tu compra");
    return;
  }
  
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const pedido = { fecha: new Date().toLocaleDateString(), items: [...carrito], total: total };
  
  usuarioActual.compras.push(pedido);
  
  // Guardar en usuarios
  const idx = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  if (idx !== -1) usuarios[idx] = usuarioActual;
  
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  
  carrito = [];
  actualizarCarrito();
  cerrarModal('modal-carrito');
  alert("Pedido realizado con exito");
}

// AUTENTICACION Y USUARIOS
function mostrarPestanaAuth(pestana) {
  const tabLogin = document.getElementById('tab-login');
  const tabReg = document.getElementById('tab-registro');
  const formLogin = document.getElementById('form-login');
  const formReg = document.getElementById('form-registro');
  
  if (pestana === 'login') {
    tabLogin.classList.add('activa');
    tabReg.classList.remove('activa');
    formLogin.style.display = 'block';
    formReg.style.display = 'none';
  } else {
    tabReg.classList.add('activa');
    tabLogin.classList.remove('activa');
    formReg.style.display = 'block';
    formLogin.style.display = 'none';
  }
}

function registrarUsuario(e) {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const usuario = document.getElementById('reg-usuario').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  
  if (usuarios.find(u => u.usuario === usuario)) {
    alert("El usuario ya existe");
    return;
  }
  
  const nuevo = { nombre, usuario, email, password, rol: "cliente", compras: [] };
  usuarios.push(nuevo);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  
  usuarioActual = nuevo;
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  
  actualizarEstadoUsuario();
  cerrarModal('modal-login');
  alert("Cuenta creada con exito");
}

function iniciarSesion(e) {
  e.preventDefault();
  const user = document.getElementById('login-usuario').value;
  const pass = document.getElementById('login-password').value;
  
  const encontrado = usuarios.find(u => (u.usuario === user || u.email === user) && u.password === pass);
  
  if (!encontrado) {
    alert("Usuario o contrasena incorrectos");
    return;
  }
  
  usuarioActual = encontrado;
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  
  actualizarEstadoUsuario();
  cerrarModal('modal-login');
}

function cerrarSesion() {
  usuarioActual = null;
  localStorage.removeItem('usuarioActual');
  actualizarEstadoUsuario();
}

function actualizarEstadoUsuario() {
  const contenedor = document.getElementById('contenedor-usuario-nav');
  
  if (usuarioActual) {
    contenedor.innerHTML = `
      <div class="menu-usuario">
        <button class="boton boton-oscuro" onclick="verPerfil()">
          <i class="fa-solid fa-user-gear"></i> ${usuarioActual.nombre} (${usuarioActual.rol === 'admin' ? 'Duenio' : 'Cliente'})
        </button>
        <button class="boton boton-borde-oscuro" onclick="cerrarSesion()">Salir</button>
      </div>
    `;
  } else {
    contenedor.innerHTML = `
      <button class="boton boton-oscuro" onclick="abrirModal('modal-login')">
        <i class="fa-solid fa-user"></i> INICIAR SESION
      </button>
    `;
  }
}

function verPerfil() {
  const elem = document.getElementById('contenido-perfil-usuario');
  
  if (usuarioActual.rol === 'admin') {
    elem.innerHTML = `
      <h3>Panel del Duenio (Administrador)</h3>
      <hr><br>
      <p><strong>Bienvenido, ${usuarioActual.nombre}</strong></p>
      <p>Email: ${usuarioActual.email}</p><br>
      <h4>Resumen del Negocio</h4>
      <ul>
        <li>• Total de Clientes Registrados: ${usuarios.filter(u => u.rol === 'cliente').length}</li>
        <li>• Productos en Inventario: ${productos.length}</li>
        <li>• Control de Stock y Ventas: Acceso total a los modulos</li>
      </ul>
    `;
  } else {
    let historialHtml = '';
    if (usuarioActual.compras.length === 0) {
      historialHtml = '<p>No realizaste compras todavia.</p>';
    } else {
      usuarioActual.compras.forEach((c, idx) => {
        historialHtml += `<p><strong>Pedido #${idx+1} - ${c.fecha}</strong>: Total $${c.total}</p>`;
      });
    }
    
    elem.innerHTML = `
      <h3>Mi Cuenta de Comprador</h3>
      <hr><br>
      <p><strong>Nombre:</strong> ${usuarioActual.nombre}</p>
      <p><strong>Email:</strong> ${usuarioActual.email}</p>
      <p><strong>Usuario:</strong> ${usuarioActual.usuario}</p><br>
      <h4>Historial de Mis Compras:</h4>
      ${historialHtml}
    `;
  }
  
  abrirModal('modal-perfil');
}

function abrirModuloAcceso(nombreModulo) {
  if (!usuarioActual) {
    alert("Debes iniciar sesion para acceder a los modulos del sistema");
    abrirModal('modal-login');
  } else if (usuarioActual.rol !== 'admin') {
    alert(`Acceso denegado. El modulo de ${nombreModulo} esta reservado para el duenio/administrador Don Humberto`);
  } else {
    alert(`Accediendo al modulo de ${nombreModulo}... Bienvenido Don Humberto`);
  }
}