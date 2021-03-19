Vue.component('v-select-registro_alumnos', VueSelect.VueSelect);
Vue.component('component-matricula', {
    data: () => {
        return {
            accion: 'nuevo',
            msg: '',
            status: false,
            error: false,
            buscar: "",
            matricula: {
                idMatricula: 0,
                registro_alumno: {
                    id: 0,
                    label: ''
                },
                codigo: '',
                dui: '',
                ciclo: '',
                fecha: ''
            },
            matricula: [],
            registro_alumnos: []
        }
    },
    methods: {
        buscandoMatricula() {
            this.matricula = this.matricula.filter((element, index, matricula) => element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.dui.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.ciclo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0);
            if (this.buscar.length <= 0) {
                this.obtenerDatos();
            }
        },
        buscandoCodigoMatricula(store) {
            let buscarCodigo = new Promise((resolver, rechazar) => {
                let index = store.index("codigo"),
                    data = index.get(this.matricula.codigo);
                data.onsuccess = evt => {
                    resolver(data);
                };
                data.onerror = evt => {
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },

        async guardarMatricula() {
           
            let store = this.abrirStore("tblmatricula", 'readwrite'),
                duplicado = false;
            if (this.accion == 'nuevo') {
                this.matricula.idMatricula = generarIdUnicoDesdeFecha();

                let data = await this.buscandoCodigoMatricula(store);
                duplicado = data.result != undefined;
            }
            if (duplicado == false) {
                let query = store.put(this.matricula);
                query.onsuccess = event => {
                    this.obtenerDatos();
                    this.limpiar();

                    this.mostrarMsg('La matricula se guardo con exito', false);
                };
                query.onerror = event => {
                    this.mostrarMsg('Error al guardar matricula', true);
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
            let store = this.abrirStore('tblmatricula', 'readonly'),
                data = store.getAll();
            data.onsuccess = resp => {
                this.matricula = data.result;
            };
            let storeRegistro_alumno = this.abrirStore('tblregistro', 'readonly'),
                dataRegistro_alumno = storeRegistro_alumno.getAll();
            this.registro_alumnos = [];
            dataRegistro_alumno.onsuccess = resp => {
                dataRegistro_alumno.result.forEach(element => {
                    this.registro_alumnos.push({ id: element.idRegistro, label: element.nombre });
                });
            };
        },
        mostrarMatricula(matri) {
            this.matricula = matri;
            this.accion = 'modificar';
        },
        limpiar() {
            this.accion = 'nuevo';
            this.matricula.registro_alumno.id = 0;
            this.matricula.registro_alumno.label = "";
            this.matricula.idMatricula = '';
            this.matricula.codigo = '';
            this.matricula.dui = '';
            this.matricula.ciclo = '';
            this.matricula.fecha = '';
            this.obtenerDatos();
        },
        eliminarMatricula(matri) {
            if (confirm(`Esta seguro que desea eliminar la matricula:  ${matri.nombre}`)) {
                let store = this.abrirStore("tblmatricula", 'readwrite'),
                    req = store.delete(matri.idMatricula);
                req.onsuccess = resp => {
                    this.mostrarMsg('Matricula eliminada con exito', true);
                    this.obtenerDatos();
                };
                req.onerror = resp => {
                    this.mostrarMsg('Error al eliminar matricula', true);
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
    <form v-on:submit.prevent="guardarMatricula" v-on:reset="limpiar">
        <div class="row">
            <div class="col-sm-5">
                <div class="row p-2">
                    <div class="col-sm text-center text-white bg-primary">
                        <div class="row">
                            <div class="col-11">
                                <h5>REGISTRO DE MATRICULA</h5>
                            </div>
                            <div class="col-1 align-middle" >
                                <button type="button" onclick="appVue.forms['matricula'].mostrar=false" class="btn-close" aria-label="Close"></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row p-2">
                        <div class="col-sm">ALUMNO:</div>
                        <div class="col-sm">
                            <v-select-registro_alumnos v-model="matricula.registro_alumno" :options="registro_alumnos" placeholder="Por favor seleccione el nombre del registro"/>
                        </div>
                    </div>
                <div class="row p-2">
                    <div class="col-sm">CODIGO ALUMNO:</div>
                    <div class="col-sm">
                        <input v-model="matricula.codigo" required pattern="^[A-Z]{4}[0-9]{6}$" type="text" class="form-control form-control-sm" >
                    </div>
                </div>
                <div class="row p-2">
                    <div class="col-sm">DUI: </div>
                    <div class="col-sm">
                        <input v-model="matricula.dui" type="text" class="form-control form-control-sm">
                    </div>
                </div>
                <div class="row p-2">
                    <div class="col-sm">CICLO: </div>
                    <div class="col-sm">
                        <input v-model="matricula.ciclo" type="text" class="form-control form-control-sm">
                    </div>
                </div>
                <div class="row p-2">
                    <div class="col-sm">FECHA MATRICULA: </div>
                    <div class="col-sm">
                        <input v-model="matricula.fecha" type="date" class="form-control form-control-sm">
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
                    <div class="col"><h5>MATRICULAS REGISTRADAS</h5></div>
                </div>
                <div class="row">
                    <div class="col">
                        <table class="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <td colspan="5">
                                        <input v-model="buscar" v-on:keyup="buscandoMatricula" type="text" class="form-control form-contro-sm" placeholder="Buscar matricula">
                                    </td>
                                </tr>
                                <tr>
                                    <th>CODIGO ALUM</th>
                                    <th>DUI</th>
                                    <th>CICLO</th>
                                    <th>FECHA MATRICULA</th>
                                    <th>ALUMNO</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="matri in matricula" v-on:click="mostrarMatricula(matri)">
                                    <td>{{ matri.codigo }}</td>
                                    <td>{{ matri.dui }}</td>
                                    <td>{{ matri.ciclo }}</td>
                                    <td>{{ matri.fecha }}</td>
                                    <td>{{ matri.registro_alumno.label }}</td>
                                    <td>
                                        <a @click.stop="eliminarMatricula(matri)" class="btn btn-danger">DEL</a>
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