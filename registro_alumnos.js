Vue.component('component-registro_alumnos', {
    data: () => {
        return {
            accion: 'nuevo',
            msg: '',
            status: false,
            error: false,
            buscar: "",
            registro_alumno: {

                idRegistro: 0,
                codigo: '',
                nombre: '',
                direccion: '',
                municipio: '',
                departamento: '',
                telefono: '',
                fechaN: '',
                sexo: ''
            },
            registro_alumnos: []
        }
    },
    methods: {
        buscandoAlumnos() {
            this.registro_alumnos = this.registro_alumnos.filter((element, index, registro_alumnos) => element.nombre.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.direccion.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.departamento.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.municipio.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.telefono.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.sexo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0);
            if (this.buscar.length <= 0) {
                this.obtenerDatos();
            }
        },

        buscandoCodigoAlumno(store) {
            let buscarCodigo = new Promise((resolver, rechazar) => {
                let index = store.index("codigo"),

                    data = index.get(this.registro_alumno.codigo);
                data.onsuccess = evt => {
                    resolver(data);
                };
                data.onerror = evt => {
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarAlumno() {

            let store = this.abrirStore("tblregistro", 'readwrite'),
                duplicado = false;
            if (this.accion == 'nuevo') {
                this.registro_alumno.idRegistro = generarIdUnicoDesdeFecha();

                let data = await this.buscandoCodigoAlumno(store);
                duplicado = data.result != undefined;
            }
            if (duplicado == false) {
                let query = store.put(this.registro_alumno);
                query.onsuccess = event => {
                    this.obtenerDatos();
                    this.limpiar();

                    this.mostrarMsg('Registro se guardo con exito', false);
                };
                query.onerror = event => {
                    this.mostrarMsg('Error al guardar el registro', true);
                    console.log(event);
                };
            } else {
                this.mostrarMsg('Codigo de alumno duplicado', true);
            }
        },
        mostrarMsg(msg, error) {
            this.status = true;
            this.msg = msg;
            this.error = error;
            this.quitarMsg(3);
        },
        quitarMsg(time) {
            setTimeout(() => {
                this.status = false;
                this.msg = '';
                this.error = false;
            }, time * 1000);
        },
        obtenerDatos() {
            let store = this.abrirStore('tblregistro', 'readonly'),
                data = store.getAll();
            data.onsuccess = resp => {
                this.registro_alumnos = data.result;
            };
        },
        mostrarAlumno(alum) {
            this.registro_alumno = alum;
            this.accion = 'modificar';
        },
        limpiar() {
            this.accion = 'nuevo';
            this.registro_alumno.idRegistro = '';
            this.registro_alumno.codigo = '';
            this.registro_alumno.nombre = '';
            this.registro_alumno.direccion = '';
            this.registro_alumno.municipio = '';
            this.registro_alumno.departamento = '';
            this.registro_alumno.telefono = '';
            this.registro_alumno.fechaN = '';
            this.registro_alumno.sexo = '';
            this.obtenerDatos();
        },
        eliminarAlumnos(alum) {
            if (confirm(`Esta seguro que desea eliminar el Alumno:  ${alum.nombre}`)) {
                let store = this.abrirStore("tblregistro", 'readwrite'),
                    req = store.delete(alum.idRegistro);
                req.onsuccess = resp => {
                    this.mostrarMsg('Registro eliminado con exito', true);
                    this.obtenerDatos();
                };
                req.onerror = resp => {
                    this.mostrarMsg('Error al eliminar el registro', true);
                    console.log(resp);
                };
            }
        },
        abrirStore(store, modo) {
            let tx = db.transaction(store, modo);
            return tx.objectStore(store);
        }
    },
    created() {

    },
    template: `
    <form v-on:submit.prevent="guardarAlumno" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE ALUMNOS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['registro_alumnos'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
            <div class="row p-2">
                <div class="col-sm">CODIGO REGISTRO:</div>
                <div class="col-sm">
                    <input v-model="registro_alumno.codigo" required pattern="^[A-Z]{4}[0-9]{6}$" type="text" class="form-control form-control-sm">
                </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">NOMBRE:</div>
           <div class="col-sm">
               <input v-model="registro_alumno.nombre"  type="text" class="form-control form-control-sm">
           </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">DIRECCION:</div>
           <div class="col-sm">
               <input v-model="registro_alumno.direccion"  type="text" class="form-control form-control-sm">
           </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">MUNICIPIO:</div>
                <div class="col-sm">
                    <input v-model="registro_alumno.municipio"  type="text" class="form-control form-control-sm">
                </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">DEPARTAMENTO:</div>
                <div class="col-sm">
                    <input v-model="registro_alumno.departamento" type="text" class="form-control form-control-sm">
                </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">TELEFONO:</div>
                <div class="col-sm">
                    <input v-model="registro_alumno.telefono"  type="tel" class="form-control form-control-sm">
                </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">FECHA NACIMIENTO:</div>
                <div class="col-sm">
                    <input v-model="registro_alumno.fechaN" type="date" class="form-control form-control-sm">
                </div>
            </div>
               <div class="row p-2">
                <div class="col-sm">SEXO:</div>
                <div class="col-sm">
                    <input v-model="registro_alumno.sexo" type="tel" class="form-control form-control-sm">
                </div>
            </div>
            <div class="row p-2">
                        <div class="col-sm text-center">
                            <input type="submit" value="Guardar" class="btn btn-success">
                            <input type="reset" value="Limpiar" class="btn btn-warning">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm text-center">
                            <div v-if="status" class="alert" v-bind:class="[error ? 'alert-danger' : 'alert-success']">
                                {{ msg }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-sm"></div>
                <div class="col-sm-6 p-2">
                    <div class="row text-center text-white bg-danger">
                        <div class="col"><h5>ALUMNOS REGISTRADOS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoAlumnos" type="text" class="form-control form-contro-sm" placeholder="Buscar alumnos">
                                        </td>
                                    </tr>
                                    <tr>
                                    <th>CODIGO REG.</th>
                                    <th>NOMBRE</th>
                                    <th>DIRECCION</th>
                                    <th>MUNICIPIO</th>
                                    <th>DEPARTAMENTO</th>
                                    <th>TELEFONO</th>
                                    <th>FECHA N</th>
                                    <th>SEXO</th>
                                    <th></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="alum in registro_alumnos" v-on:click="mostrarAlumno(alum)">
                                    <td>{{ alum.codigo }}</td>
                                    <td>{{ alum.nombre }}</td>
                                    <td>{{ alum.direccion }}</td>
                                    <td>{{ alum.municipio }}</td>
                                    <td>{{ alum.departamento }}</td>
                                    <td>{{ alum.telefono }}</td>
                                    <td>{{ alum.fechaN }}</td>
                                    <td>{{ alum.sexo }}</td>
                                    <td>
    
                                            <a @click.stop="eliminarAlumnos(alum)" class="btn btn-danger">DEL</a>
                                    </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    `
});