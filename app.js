//Campops del formulario
let DB;
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

//UI 
const formulario = document.querySelector('#nueva-cita');
const contenedorCitas = document.querySelector('#citas');

//heading
const heading = document.querySelector('#administra');

let editando;

window.onload = () => {
    eventListeners();

    crearDB();
}

class Citas {
    constructor(){
        this.citas = [];
    }
    agregarCita(cita){
        this.citas = [...this.citas, cita];
    }
    elimminarCita(id){
        this.citas = this.citas.filter(cita => cita.id !== id)
    }
    editarCita(citaActualizada){
        this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita);

    }
}
class UI{
    imprimirAlerta(mensaje, tipo){
        //crea el div
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

        //agg class en base al tipo de error
        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else {
            divMensaje.classList.add('alert-success');
        }
        //mensaje de error
        divMensaje.textContent= mensaje;

        //agg al DOM
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));

        setTimeout (()=>{
            divMensaje.remove();
        }, 3000)
    }
    imprimirCitas(){

        this.limpiarHTML();

        this.textoHeading(citas);

        //leer el contenido de la BD
        const objectStore = DB.transaction('citas').objectStore('citas');

        const fnTextHeading = this.textoHeading;

        const total = objectStore.count();
        total.onsuccess = function() {
            fnTextHeading(total.result);
        }

        objectStore.openCursor().onsuccess = function (e){
            const cursor = e.target.result;

            if(cursor){
            const{mascota, propietario, telefono, fecha, hora, sintomas, id} = cursor.value;

            const divCita = document.createElement('div');
            divCita.classList.add('cita', 'p-3');
            divCita.dataset.id = id;

            //scripting de los elemenros de la cita
            const mascotaParrafo = document.createElement('h2');
            mascotaParrafo.classList.add('card-title', 'font-weigth-bolder');
            mascotaParrafo.textContent = mascota;

            const propietarioParrafo = document.createElement('p');
            propietarioParrafo.innerHTML = `
                <span class="font-weight-bolder">Propietario: </span> ${propietario}
            `;
            const telefonoParrafo = document.createElement('p');
            telefonoParrafo.innerHTML = `
                <span class="font-weight-bolder">Teléfono: </span> ${telefono}
            `;
            const fechaParrafo = document.createElement('p');
            fechaParrafo.innerHTML = `
                <span class="font-weight-bolder">Fecha: </span> ${fecha}
            `;
            const horaParrafo = document.createElement('p');
            horaParrafo.innerHTML = `
                <span class="font-weight-bolder">Hora: </span> ${hora}
            `;
            const sintomasParrafo = document.createElement('p');
            sintomasParrafo.innerHTML = `
                <span class="font-weight-bolder">Sintomas: </span> ${sintomas}
            `;

            //btn para eliminar citas
            const btnEliminar = document.createElement('button');
            btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
            btnEliminar.innerHTML = 'Eliminar &#11198';
            btnEliminar.onclick= () => elimminarCita(id);
          
            //Btn para editar
            const btnEditar = document.createElement('button');
            btnEditar.classList.add('btn', 'btn-info');
            btnEditar.innerHTML = 'Editar ✎';
            const cita = cursor.value;
            btnEditar.onclick= () => cargarEdicion(cita);


            //agg los parrafos al div cita
            divCita.appendChild(mascotaParrafo);
            divCita.appendChild(propietarioParrafo);
            divCita.appendChild(telefonoParrafo);
            divCita.appendChild(fechaParrafo);
            divCita.appendChild(horaParrafo);
            divCita.appendChild(sintomasParrafo);
            divCita.appendChild(btnEliminar);
            divCita.appendChild(btnEditar);

            //agg las citas al HTML
            contenedorCitas.appendChild(divCita);
            
            //pasa al sig elemento
            cursor.continue();
            }
        }
    }
    textoHeading(resultado){
        if(resultado > 0){
            heading.textContent = 'Administra tus citas.'
        }else {
            heading.textContent = 'No hay citas, comienza creando una.'
        }
    }

    limpiarHTML(){
        while(contenedorCitas.firstChild){
            contenedorCitas.removeChild(contenedorCitas.firstChild)
        }
    }

}

const ui = new UI();
const administrarCitas = new Citas();

//Registrar llamadas
function eventListeners(){
    mascotaInput.addEventListener('input', datosCita);
    propietarioInput.addEventListener('input', datosCita);
    telefonoInput.addEventListener('input', datosCita);
    fechaInput.addEventListener('input', datosCita);
    horaInput.addEventListener('input', datosCita);
    sintomasInput.addEventListener('input', datosCita);

    formulario.addEventListener('submit', nuevaCita);
}

//Objeto con la info de la cita
//Para que esto funcione se coloca el nombre que esta en la etiqueta 'name' en el html 
const citaObj = {
    mascota: '',
    propietario: '',
    telefono:'',
    fecha:'',
    hora:'',
    sintomas:'',
}
//En esta sintaxis se usa el corchete para acceder a las propiedades del obj
//si se hace sin los corchetes 'citaObj.e.target.name' querra entrar a la propiedad del evneto de citaObj
//++Agrega datos al obj de cita
function datosCita(e){
    citaObj[e.target.name] = e.target.value;
}

//valida y agg una nueva cita a la clase de citas
function nuevaCita(e){
    e.preventDefault();
    
    //extraer la inf del obj de citas
    const{mascota, propietario, telefono, fecha, hora, sintomas} = citaObj;

    //validar
    if(mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === ''){
        ui.imprimirAlerta('Todos los campos son obligatorios', 'error');

        return;
    }
    if (editando){
        //pasar el obj de la cita a edicion
        administrarCitas.editarCita({...citaObj});

        //edita en indexDB
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas');

        objectStore.put(citaObj);
        transaction.oncomplete = () => {
            ui.imprimirAlerta('Guardado Correctamente');

            formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';

            //quitar el modo edicion
            editando = false;

        }
        transaction.onerror = () => {
            console.log('Hubo un error');
        }

    } else{
        //generar un id unico
        citaObj.id = Date.now();

        //crear una nueva  cita
        administrarCitas.agregarCita({...citaObj});

        //insertar registro en indexBD
        const transaction = DB.transaction(['citas'], 'readwrite');

        //habilitar el objectstore
        const objectStore = transaction.objectStore('citas');

        //insertar en la db
        objectStore.add(citaObj);

        transaction.oncomplete = function(){
            console.log('cita agg');

        //Msje de agg correctamente
        ui.imprimirAlerta('Se sgregó correctamente');

        }

    }

ui.imprimirCitas();

reiniciarObjeto();

formulario.reset();

}
function reiniciarObjeto(){
    citaObj.mascota = '';
    citaObj.propietario = '';
    citaObj.telefono = '';
    citaObj.fecha = '';
    citaObj.hora = '';
    citaObj.sintomas = '';
}

function elimminarCita(id){
    //eliminar cita
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.delete(id);

    transaction.oncomplete = () =>{
        console.log(`Cita ${id} eliminada`);

        ui.imprimirCitas();
    }
    transaction.onerror = () => {
        console.log('huno un error');
    }
}

//carga los datos y modos de edicion
function cargarEdicion(cita){
    const{mascota, propietario, telefono, fecha, hora, sintomas, id} = cita;

    //lenar los inputs
    mascotaInput.value = mascota;
    propietarioInput.value = propietario;
    telefonoInput.value = telefono;
    fechaInput.value = fecha;
    horaInput.value = hora;
    sintomasInput.value = sintomas;

    //Llenar el obj
    citaObj.mascota = mascota;
    citaObj.propietario = propietario;
    citaObj.telefono = telefono;
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;
    citaObj.id = id;

    //cambiar el texto del btn
    formulario.querySelector('button[type="submit"]').textContent = 'Guardar cambios';

    editando = true;
}

function crearDB(){
    //crear la bd en version 1.0
    const crearDB = window.indexedDB.open('citas', 1);

    //si hay un error
    crearDB.onerror = function(){
        console.log('hubo un error');
    }
    // si todo sale bien
    crearDB.onsuccess = function(){
        console.log('db creada');

        DB = crearDB.result;
        //mostrar citas al cargar pero indexDB ya esta listo
        ui.imprimirCitas();
    }
    //definir esquema
    crearDB.onupgradeneeded = function(e){
        const db = e.target.result;

        const objectStore = db.createObjectStore('citas', {
            keyPath: 'id',
            autoIncrement: true
        });
        //def todas las columnas
        objectStore.createIndex('mascota', 'mascota', {unique: false});
        objectStore.createIndex('propietario', 'propietario', {unique: false});
        objectStore.createIndex('telefono', 'telefono', {unique: false});
        objectStore.createIndex('fecha', 'fecha', {unique: false});
        objectStore.createIndex('hora', 'hora', {unique: false});
        objectStore.createIndex('sintomas', 'sintomas', {unique: false});
        objectStore.createIndex('id', 'id', {unique: true});

        console.log('db creada y lista');
    }
}
