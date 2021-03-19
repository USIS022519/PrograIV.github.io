Vue.component('v-select-matricula', VueSelect.VueSelect);
Vue.component('component-inscripcion', {
    data: () => {
        return {
            accion: 'nuevo',
            msg: '',
            status: false,
            error: false,
            buscar: "",
            inscripcion: {
                idInscripcion: 0,
                matricula: {
                    id: 0,
                    label: ''
                },
                codigo: '',
                materia1: '',
                materia2: '',
                materia3: '',
                materia4: '',
                fechaIns: ''
            },
            inscripcion: [],
            matricula: []
        }
    },
    methods: {
        buscandoInscripcion() {
            this.inscripcion = this.inscripcion.filter((element, index, inscripcion) => element.materia1.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.materia2.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.materia3.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.materia4.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0);
            if (this.buscar.length <= 0) {
                this.obtenerDatos();
            }
        },
        buscandoCodigoInscripcion(store) {
            let buscarCodigo = new Promise((resolver, rechazar) => {
                let index = store.index("codigo"),
                    data = index.get(this.inscripcion.codigo);
                data.onsuccess = evt => {
                    resolver(data);
                };
                data.onerror = evt => {
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarInscripcion() {
            
            let store = this.abrirStore("tblinscripcion", 'readwrite'),
                duplicado = false;
            if (this.accion == 'nuevo') {
                this.inscripcion.idInscripcion = generarIdUnicoDesdeFecha();

                let data = await this.buscandoCodigoInscripcion(store);
                duplicado = data.result != undefined;
            }
            if (duplicado == false) {
                let query = store.put(this.inscripcion);
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
                this.mostrarMsg('Codigo de inscripcion duplicado', true);
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
            let store = this.abrirStore('tblinscripcion', 'readonly'),
                data = store.getAll();
            data.onsuccess = resp => {
                this.inscripcion = data.result;
            };

            let storeMatricula = this.abrirStore('tblmatricula', 'readonly'),
                dataMatricula = storeMatricula.getAll();
            this.matricula = [];
            dataMatricula.onsuccess = resp => {
                dataMatricula.result.forEach(element => {
                    this.matricula.push({ id: element.idMatricula, label: element.codigo });
                });


            };
        },

        mostrarInscripcion(insc) {
            this.inscripcion = insc;
            this.accion = 'modificar';
        },

        limpiar() {
            this.accion = 'nuevo';
            this.inscripcion.matricula.id = 0;
            this.inscripcion.matricula.label = "";

            this.inscripcion.idInscripcion = '';
            this.inscripcion.codigo = '';
            this.inscripcion.materia1 = '';
            this.inscripcion.materia2 = '';
            this.inscripcion.materia3 = '';
            this.inscripcion.materia4 = '';
            this.inscripcion.fechaIns = '';
            this.obtenerDatos();
        },
        eliminarInscripcion(insc) {
            if (confirm(`Esta seguro que desea eliminar la inscripcion:  ${insc.codigo}`)) {
                let store = this.abrirStore("tblinscripcion", 'readwrite'),
                    req = store.delete(insc.idInscripcion);
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
        <form v-on:submit.prevent="guardarInscripcion" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>INSCRIPCION DE MATERIAS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['inscripcion'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row p-2">
                        <div class="col-sm">CODIGO ALUMNO:</div>
                        <div class="col-sm">
                            <v-select-matricula v-model="inscripcion.matricula" :options="matricula" placeholder="Por favor seleccione el alumno"/>
                        </div>
                    </div>

                    <div class="row p-2">
                        <div class="col-sm">CODIGO INSCRIPCION:</div>
                        <div class="col-sm">
                            <input v-model="inscripcion.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>

               
                    <div class="row p-2">
                    <div class="col-sm">MATERIA 1:</div>
                    <div class="col-sm">
                        <input v-model="inscripcion.materia1" type="text" class="form-control form-control-sm"/>
                    </div>
                  </div>

                  
                  <div class="row p-2">
                    <div class="col-sm">MATERIA 2:</div>
                    <div class="col-sm">
                        <input v-model="inscripcion.materia2" type="text" class="form-control form-control-sm"/>
                    </div>
                  </div>

                  <div class="row p-2">
                  <div class="col-sm">MATERIA 3:</div>
                  <div class="col-sm">
                      <input v-model="inscripcion.materia3" type="text" class="form-control form-control-sm"/>
                  </div>
                </div>

                <div class="row p-2">
                <div class="col-sm">MATERIA 4:</div>
                <div class="col-sm">
                    <input v-model="inscripcion.materia4" type="text" class="form-control form-control-sm"/>
                </div>
              </div>
             <div class="row p-2">
             <div class="col-sm">FECHA INSCRIPCION:</div>
            <div class="col-sm">
              <input v-model="inscripcion.fechaIns" required type="date" class="form-control form-control-sm" >
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
                        <div class="col"><h5>MATERIAS REGISTRADAS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoInscripcion" type="text" class="form-control form-contro-sm" placeholder="Buscar inscripcion">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>CODIGO INS</th>
                                        <th>MATERIA1</th>
                                        <th>MATERIA2</th>
                                        <th>MATERIA3</th>
                                        <th>MATERIA4</th>
                                        <th>FECHA</th>
                                        <th>COD ALUMNO</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="insc in inscripcion" v-on:click="mostrarInscripcion(insc)">
                                        <td>{{ insc.codigo }}</td>
                                        <td>{{ insc.materia1 }}</td>
                                        <td>{{ insc.materia2 }}</td>
                                        <td>{{ insc.materia3 }}</td>
                                        <td>{{ insc.materia4 }}</td>
                                        <td>{{ insc.fechaIns }}</td>
                                        <td>{{ insc.matricula.label }}</td>

                                        <td>
                                            <a @click.stop="eliminarInscripcion(insc)" class="btn btn-danger">DEL</a>
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
