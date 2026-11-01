const productos = [
  { id: 1, nombre: "Cemento Holcim 50kg", categoria: "cemento", precio: 8500, imagen: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=400&auto=format&fit=crop" },
  { id: 2, nombre: "Cal Hidratada 25kg", categoria: "cemento", precio: 4200, imagen: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=400&auto=format&fit=crop" },
  { id: 3, nombre: "Arena Fina (m3)", categoria: "aridos", precio: 12000, imagen: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=400&auto=format&fit=crop" },
  { id: 4, nombre: "Piedra Bocha (m3)", categoria: "aridos", precio: 16500, imagen: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?q=80&w=400&auto=format&fit=crop" },
  { id: 5, nombre: "Ladrillo Hueco 12x18x33", categoria: "ladrillos", precio: 450, imagen: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" },
  { id: 6, nombre: "Ladrillo Común (Mil)", categoria: "ladrillos", precio: 95000, imagen: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop" },
  { id: 7, nombre: "Hierro del 8 (Barra 12m)", categoria: "hierros", precio: 9800, imagen: "https://images.unsplash.com/photo-1535813547-99c456a41d4a?q=80&w=400&auto=format&fit=crop" },
  { id: 8, nombre: "Malla Cima 15x15 (2x3m)", categoria: "hierros", precio: 24000, imagen: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=400&auto=format&fit=crop" }
];
let carrito = [];
let usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || null;
let usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
  { nombre: "Don Humberto (Administrador)", usuario: "admin", email: "admin@donhumberto.com.ar", password: "admin123", rol: "admin", compras: [] }
];
document.addEventListener('DOMContentLoaded', () => {
  renderizarProductos(productos);
  actualizarEstadoUsuario();
  actualizarCarrito();
});
function abrirModal(id) { document.getElementById(id).style.display = 'flex'; }
function cerrarModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(e) { if (e.target.classList.contains('ventana-modal')) e.target.style.display = 'none'; };
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
      <button class="boton boton-primario" onclick="agregarAlCarrito(${prod.id})"><i class="fa-solid fa-plus"></i> Agregar</button>
    `;
    contenedor.appendChild(card);
  });
}
function filtrarProductos() {
  const texto = document.getElementById('buscador-producto').value.toLowerCase();
  const cat = document.getElementById('filtro-categoria').value;
  const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(texto) && (cat === 'todos' || p.categoria === cat));
  renderizarProductos(filtrados);
}
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const existe = carrito.find(item => item.id === id);
  if (existe) existe.cantidad++; else carrito.push({ ...prod, cantidad: 1 });
  actualizarCarrito();
}
function actualizarCarrito() {
  const lista = document.getElementById('lista-carrito');
  const contador = document.getElementById('contador-carrito');
  const totalElem = document.getElementById('total-precio-carrito');
  lista.innerHTML = '';
  let total = 0, totalCount = 0;
  carrito.forEach(item => {
    total += item.precio * item.cantidad;
    totalCount += item.cantidad;
    const div = document.createElement('div');
    div.className = 'item-carrito';
    div.innerHTML = `<div><strong>${item.nombre}</strong><br><small>$${item.precio} x ${item.cantidad}</small></div><div>$${item.precio * item.cantidad}</div>`;
    lista.appendChild(div);
  });
  contador.innerText = totalCount;
  totalElem.innerText = total.toLocaleString();
}
function cambiarMetodoPago(metodo) {
  document.getElementById('form-tarjeta').style.display = metodo === 'tarjeta' ? 'block' : 'none';
  document.getElementById('form-transferencia').style.display = metodo === 'transferencia' ? 'block' : 'none';
}
function finalizarCompra() {
  if (carrito.length === 0) { alert("El carrito está vacío."); return; }
  if (!usuarioActual) { cerrarModal('modal-carrito'); abrirModal('modal-login'); alert("Iniciá sesión o registrate para completar el pedido."); return; }
  
  const metodo = document.getElementById('metodo-pago').value;
  let detallePago = "";
  if (metodo === 'tarjeta') {
    const num = document.getElementById('tarjeta-num').value;
    const venc = document.getElementById('tarjeta-venc').value;
    const cvv = document.getElementById('tarjeta-cvv').value;
    const nom = document.getElementById('tarjeta-nombre').value;
    if (!num || !venc || !cvv || !nom) { alert("Por favor completá todos los datos de la tarjeta."); return; }
    detallePago = `Tarjeta de Crédito/Débito (Terminada en ${num.slice(-4)})`;
  } else if (metodo === 'transferencia') {
    const comp = document.getElementById('transf-comprobante').value;
    if (!comp) { alert("Por favor ingresá el número de comprobante de la transferencia."); return; }
    detallePago = `Transferencia Bancaria (Comprobante #${comp})`;
  } else {
    detallePago = "Efectivo al retirar en Corralón";
  }
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const nuevoPedido = { fecha: new Date().toLocaleDateString(), items: [...carrito], total, pago: detallePago };
  usuarioActual.compras.push(nuevoPedido);
  const idx = usuarios.findIndex(u => u.usuario === usuarioActual.usuario);
  if (idx !== -1) usuarios[idx] = usuarioActual;
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  carrito = [];
  actualizarCarrito();
  cerrarModal('modal-carrito');
  alert(`¡Pago procesado y compra confirmada!\nDetalle: ${detallePago}\nPodés ver tu comprobante en la sección de tu cuenta.`);
}
function mostrarPestanaAuth(pestana) {
  if (pestana === 'login') {
    document.getElementById('tab-login').classList.add('activa');
    document.getElementById('tab-registro').classList.remove('activa');
    document.getElementById('form-login').style.display = 'block';
    document.getElementById('form-registro').style.display = 'none';
  } else {
    document.getElementById('tab-registro').classList.add('activa');
    document.getElementById('tab-login').classList.remove('activa');
    document.getElementById('form-registro').style.display = 'block';
    document.getElementById('form-login').style.display = 'none';
  }
}
function registrarUsuario(e) {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value;
  const usuario = document.getElementById('reg-usuario').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  if (usuarios.find(u => u.usuario === usuario)) { alert("El usuario ya existe."); return; }
  const nuevo = { nombre, usuario, email, password, rol: "cliente", compras: [] };
  usuarios.push(nuevo);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
  usuarioActual = nuevo;
  localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));
  actualizarEstadoUsuario();
  cerrarModal('modal-login');
  alert("¡Cuenta creada con éxito!");
}
function iniciarSesion(e) {
  e.preventDefault();
  const user = document.getElementById('login-usuario').value;
  const pass = document.getElementById('login-password').value;
  const encontrado = usuarios.find(u => (u.usuario === user || u.email === user) && u.password === pass);
  if (!encontrado) { alert("Usuario o contraseña incorrectos."); return; }
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
        <button class="boton boton-oscuro" onclick="verPerfil()"><i class="fa-solid fa-user-gear"></i> ${usuarioActual.nombre}</button>
        <button class="boton boton-borde-oscuro" onclick="cerrarSesion()">Salir</button>
      </div>
    `;
  } else {
    contenedor.innerHTML = `<button class="boton boton-oscuro" onclick="abrirModal('modal-login')"><i class="fa-solid fa-user"></i> INICIAR SESIÓN</button>`;
  }
}
function verPerfil() {
  const elem = document.getElementById('contenido-perfil-usuario');
  if (usuarioActual.rol === 'admin') {
    elem.innerHTML = `
      <h3>Panel del Dueño (Administrador)</h3>
      <hr><br>
      <p><strong>Bienvenido, Don Humberto</strong></p>
      <p>📊 <strong>Clientes Registrados:</strong> ${usuarios.filter(u=>u.rol==='cliente').length}</p>
      <p>🛠️ <strong>Materiales en Stock:</strong> ${productos.length} categorías registradas.</p>
    `;
  } else {
    let historial = usuarioActual.compras.length === 0 ? '<p>No realizaste compras todavía.</p>' : usuarioActual.compras.map((c,i)=>`
      <div style="background:#f4f6f9; padding:10px; margin-bottom:8px; border-radius:4px; text-align:left;">
        <strong>Pedido #${i+1} (${c.fecha})</strong><br>
        Pago: <em>${c.pago}</em><br>
        <strong>Total: $${c.total.toLocaleString()}</strong>
      </div>
    `).join(''); 
    elem.innerHTML = `
      <h3>Mi Cuenta de Comprador</h3>
      <hr><br>
      <p><strong>Nombre:</strong> ${usuarioActual.nombre}</p>
      <p><strong>Email:</strong> ${usuarioActual.email}</p><br>
      <h4>Historial de Compras:</h4>
      <div style="max-height:200px; overflow-y:auto; margin-top:10px;">${historial}</div>
    `;
  }
  abrirModal('modal-perfil');
}
function abrirModuloAcceso(modulo) {
  if (!usuarioActual) { alert("Debes iniciar sesión con clave de administrador."); abrirModal('modal-login'); }
  else if (usuarioActual.rol !== 'admin') { alert(`Acceso denegado. El módulo de ${modulo} es exclusivo para el dueño Don Humberto.`); }
  else { alert(`🔓 Acceso concedido al módulo de ${modulo}. ¡Bienvenido, Don Humberto!`); }
}