// SIMULADOR VIRTUAL DE TIENDA DE ARTÍCULOS PARA MASCOTAS

document.querySelector("h1").textContent =
  "¡Te damos la bienvenida a PetStore!";
document.querySelector("h3").textContent =
  "Si el valor de tu compra es igual o mayor a $300 recibirás un 20% de descuento en el total.";

// CARRITO DE COMPRAS

let carrito = {};

const card = document.getElementById("productosLista");
const calculoCompra = document.getElementById("calculoCompra");
const totalPagar = document.getElementById("totalPagar");
const template = document.getElementById("templateCard").content;
const templateCarrito = document.getElementById("templateCarrito").content;
const templateTotalPagar = document.getElementById("templateTotalPagar").content;
const fragment = document.createDocumentFragment();

// CONSTRUCCIÓN DE TARJETAS DE PRODUCTOS CON BASE DE DATOS DE JSON

document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});

const fetchData = async () => {
  try {
    const response = await fetch("bdatos.json");
    const bdatos = await response.json();
    productos(bdatos);
  } catch (error) {
    console.log(error);
  }
};

const productos = (bdatos) => {
  bdatos.forEach((item) => {
    template.querySelector(".card-img-top").setAttribute("src", item.imagen);
    template.querySelector(".producto").textContent = item.nombre;
    template.querySelector(".precio").textContent = item.precio;
    template.querySelector(".agregarButton").dataset.id = item.id;
    const clone = template.cloneNode(true);
    fragment.appendChild(clone);
  });
  card.appendChild(fragment);
};

  // AGREGAR UN PRODUCTO AL CARRITO DE COMPRAS

card.addEventListener("click", (e) => {
  addCarrito(e);
});

const addCarrito = (e) => {
  e.target.classList.contains("agregarButton") &&
    carritoCompra(e.target.parentElement);

  e.stopPropagation();
};

const carritoCompra = (objeto) => {
  const producto = {
    id: objeto.querySelector(".agregarButton").dataset.id,
    imagen: objeto.querySelector(".card-img-top").src,
    nombre: objeto.querySelector(".producto").textContent,
    precio: objeto.querySelector(".precio").textContent,
    cantidad: 1,
  };

  // NOTIFICACIÓN QUE APARECE CADA VEZ QUE SE AGREGA UN PRODUCTO AL CARRITO

  Toastify({
    text: `Agregaste ${producto.nombre} al carrito`,
    duration: 4000,
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
    offset: {
      x: 50,
      y: 30,
    },
  }).showToast();

  carrito.hasOwnProperty(producto.id) &&
    (producto.cantidad = carrito[producto.id].cantidad + 1);

  carrito[producto.id] = { ...producto };
  mostrarProductosCarrito();
};

// LOS PRODUCTOS AGREGADOS SE MUESTRAN EN LA ZONA DEL CARRITO

const mostrarProductosCarrito = () => {
  calculoCompra.innerHTML = " ";
  Object.values(carrito).forEach((producto) => {
    templateCarrito.querySelector("img").src = producto.imagen;
    templateCarrito.querySelectorAll("td")[1].textContent = producto.nombre;
    templateCarrito.getElementById("less").dataset.id = producto.id;
    templateCarrito.getElementById("more").dataset.id = producto.id;
    templateCarrito.querySelectorAll("td")[2].textContent = producto.cantidad;
    templateCarrito.querySelector("span").textContent =
      producto.precio * producto.cantidad;
    const clone = templateCarrito.cloneNode(true);
    fragment.appendChild(clone);
  });
  calculoCompra.appendChild(fragment);

  pagoFinal();

  localStorage.setItem("carrito", JSON.stringify(carrito));
};

// LOS PRECIOS Y LAS CANTIDADES SE SUMAN, SE MUESTRA EL TOTAL DE COMPRA

const pagoFinal = () => {
  totalPagar.innerHTML = "";

  const sumaPrecios = Object.values(carrito).reduce(
    (acc, { cantidad, precio }) => acc + cantidad * precio,
    0
  );
  templateTotalPagar.querySelector("span").textContent = sumaPrecios;
  const clone = templateTotalPagar.cloneNode(true);
  fragment.appendChild(clone);
  totalPagar.appendChild(fragment);

  // VACIAR CARRITO

  const vaciar = document.querySelector(".vaciarButton")
  vaciar.addEventListener("click", () => {
    carrito = {}
    mostrarProductosCarrito()
  })

  Object.keys(carrito).length === 0 && (totalPagar.innerHTML = "No hay productos en el carrito")

  // FINALIZAR COMPRA, DESCUENTO Y REGISTRO DE EMAIL

document.querySelector(".finalizarButton").addEventListener("click", async () => {
  if (sumaPrecios >= 300){
  const { value: email } = await Swal.fire({
    title: `¡Felicidades! Se te aplicó un 20% al total de tu compra.
    Monto total a pagar: $${sumaPrecios - (sumaPrecios*0.2)}`,
    input: 'email',
    inputLabel: 'Ingresa tu email para finalizar la compra',
    inputPlaceholder: 'Ejm: hola@petstore.com',
    showCancelButton: true
  })
  if (email) {
    Swal.fire(`¡Pedido en proceso!

    En breve te estará llegando un correo a: ${email} con todos los detalles para finalizar tu compra.`)
    carrito = {}
    mostrarProductosCarrito()
  }
}
else{
  const { value: email } = await Swal.fire({
    title: `Monto total a pagar: $${sumaPrecios}`,
    input: 'email',
    inputLabel: 'Ingresa tu email para finalizar la compra',
    inputPlaceholder: 'Ejm: hola@petstore.com',
    showCancelButton: true
  })
  if (email) {
    Swal.fire(`¡Pedido en proceso!

    En breve te estará llegando un correo a: ${email} con todos los detalles para finalizar tu compra.`)
    carrito = {}
    mostrarProductosCarrito()
  }
}
});
};

// AUMENTAR O DISMINUIR LA CANTIDAD DE PRODUCTOS EN EL CARRITO DE COMPRAS

calculoCompra.addEventListener("click", e => {
  qtyButton(e)
})

const qtyButton = e => {
  if (e.target.classList.contains("more")) {
    const producto = carrito [e.target.dataset.id]
    producto.cantidad++
    carrito [e.target.dataset.id] = {...producto}
    mostrarProductosCarrito()
  }
  if (e.target.classList.contains("less")) {
    const producto = carrito [e.target.dataset.id]
    producto.cantidad--
    if (producto.cantidad === 0){
      delete carrito [e.target.dataset.id]
    }
    mostrarProductosCarrito()
  }
  e.stopPropagation()
}

// LOCAL STORAGE PARA QUE NO SE BORRE LA INFORMACIÓN DEL CARRITO AL REINICIAR

localStorage.getItem("carrito") &&
  (carrito = JSON.parse(localStorage.getItem("carrito")));
mostrarProductosCarrito();
