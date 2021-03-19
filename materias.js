Vue.component('component-materias', {
    data: () => {
        return {
            accion: 'nuevo',
            msg: '',
            status: false,
            error: false,
            buscar: "",
            materia: {
                idMateria: 0,
                codigo: '',
                nombre: ''
            },
            materias: []
        }
    },
    methods: {
        buscandoMaterias() {
            this.materias = this.materias.filter((element, index, materias) => element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0 || element.nombre.toUpperCase().indexOf(this.buscar.toUpperCase()) >= 0);
            if (this.buscar.length <= 0) {
                this.obtenerDatos();
            }
        },
        buscandoCodigoMateria(store) {
            let buscarCodigo = new Promise((resolver, rechazar) => {
                let index = store.index("codigo"),
                    data = index.get(this.materia.codigo);
                data.onsuccess = evt => {
                    resolver(data);
                };
                data.onerror = evt => {
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarMateria() {
            
            let store = this.abrirStore("tblmateria", 'readwrite'),
                duplicado = false;
            if (this.accion == 'nuevo') {
                this.materia.idMateria = generarIdUnicoDesdeFecha();

                let data = await this.buscandoCodigoMateria(store);
                duplicado = data.result != undefined;
            }
            if (duplicado == false) {
                let query = store.put(this.materia);
                query.onsuccess = event => {
                    this.obtenerDatos();
                    this.limpiar();

                    this.mostrarMsg('La materia se guardo con exito', false);
                };
                query.onerror = event => {
                    this.mostrarMsg('Error al guardar la materia', true);
                    console.log(event);
                };
            } else {
                this.mostrarMsg('Codigo de materia duplicado', true);
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
            let store = this.abrirStore('tblmateria', 'readonly'),
                data = store.getAll();
            data.onsuccess = resp => {
                this.materias = data.result;
            };
        },
        mostrarmateria(mate) {
            this.materia = mate;
            this.accion = 'modificar';
        },
        limpiar() {
            this.accion = 'nuevo';
            this.materia.idMateria = '';
            this.materia.codigo = '';
            this.materia.nombre = '';
            this.obtenerDatos();
        },
        eliminarMateria(mate) {
            if (confirm(`Esta seguro que desea eliminar la Materia:  ${mate.nombre}`)) {
                let store = this.abrirStore("tblmateria", 'readwrite'),
                    req = store.delete(mate.idMateria);
                req.onsuccess = resp => {
                    this.mostrarMsg('Materia eliminada con exito', true);
                    this.obtenerDatos();
                };
                req.onerror = resp => {
                    this.mostrarMsg('Error al eliminar la materia', true);
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
    <form v-on:submit.prevent="guardarMateria" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE MATERIAS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['materias'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
            <div class="row p-2">
                <div class="col-sm">CODIGO:</div>
                <div class="col-sm">
                    <input v-model="materia.codigo" required pattern="^[A-Z]{4}[0-9]{6}$" type="text" class="form-control form-control-sm">
                </div>
            </div>
            <div class="row p-2">
                <div class="col-sm">NOMBRE:</div>
           <div class="col-sm">
               <input v-model="materia.nombre"  type="text" class="form-control form-control-sm">
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
                                            <input v-model="buscar" v-on:keyup="buscandoMaterias" type="text" class="form-control form-contro-sm" placeholder="Buscar materias">
                                        </td>
                                    </tr>
                                    <tr>
                                    <th>CODIGO</th>
                                    <th>NOMBRE</th>
                                    <th></th>

                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="mate in materias" v-on:click="mostrarmateria(mate)">
                                    <td>{{ mate.codigo }}</td>
                                    <td>{{ mate.nombre }}</td>
                                    <td>
    
                                            <a @click.stop="eliminarMateria(mate)" class="btn btn-danger">DEL</a>
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