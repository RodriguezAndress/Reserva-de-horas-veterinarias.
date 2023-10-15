//Campops del formulario
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

//UI 
const formulario = document.querySelector('#nueva-cita');
const contenedorCitas = document.querySelector('#citas');

let editando;

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
    imprimirCitas({citas}){

        this.limpiarHTML();

        citas.forEach(cita => {
            const{mascota, propietario, telefono, fecha, hora, sintomas, id} = cita;

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
            
        });
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
eventListeners();
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
//Para que esto funcione se coloca el nombre que esta en el 'name'
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
        ui.imprimirAlerta('Editado correctamente');

        //pasar el obj de la cita a edicion
        administrarCitas.editarCita({...citaObj});

        formulario.querySelector('button[type="submit"]').textContent = 'Crear cita';

        //quitar el modo edicion
        editando = false;


    } else{
        //generar un id unico
        citaObj.id = Date.now();

        //crear una nueva  cita
        administrarCitas.agregarCita({...citaObj});

        //Msje de agg correctamente
        ui.imprimirAlerta('Se sgregó correctamente');

    }

reiniciarObjeto();

formulario.reset();

ui.imprimirCitas(administrarCitas);
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
    administrarCitas.elimminarCita(id);

    //muestre mnsj de error 
    ui.imprimirAlerta('La cita se eliminó correctamente');

    //refrescar las citas
    ui.imprimirCitas(administrarCitas);
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