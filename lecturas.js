Vue.component('component-lecturas',{
    data:()=>{
        return {
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            lectura:{
                accion    : 'nuevo',
                idLectura : 0,
                fecha     : '',
                lecturas  : []
            },
            lecturas:[]
        }
    },
    methods:{
        calcularPago(lecturaCliente){
            let rango = lecturaCliente.lactual - lecturaCliente.lanterior;
            if(rango>=1 && rango<=18){
                lecturaCliente.pago = 6;
            }
            if(rango>=19 && rango<=28){
                lecturaCliente.pago = (rango - 18)*0.45 + 6;
            }
            if(rango>=29){
                lecturaCliente.pago = (rango - 28)*0.65 + 10.5; //6 -> Cuota fija, 4.5-> (28-18)*0.45;
            }
        },
        nuevaLectura(){
            this.limpiar();
            let store = this.abrirStore('tbllecturas','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                if(data.result.length==0){
                    let clientes = this.abrirStore('tblclientes','readonly'),
                        datosClientes = clientes.getAll();
                    datosClientes.onsuccess=datacliente=>{
                        datosClientes.result.forEach(element => {
                            this.lectura.lecturas.push({
                                cliente   : element.nombre,
                                lanterior : 0,
                                lactual   : '',
                                pago      : ''
                            });
                        });
                    };
                } else {
                    data.result[data.result.length - 1].lecturas.forEach(element => {
                        this.lectura.lecturas.push({
                            cliente   : element.cliente, 
                            lanterior : element.lactual, 
                            lactual   : '', 
                            pago   : '', 
                        });
                    });
                }
                this.lectura.fecha = new Date().toISOString().slice(0,10);
            };
        },
        buscandoLectura(){
            this.lecturas = this.lecturas.filter((element,index,lecturas) => new Date(element.fecha).toLocaleDateString().indexOf(this.buscar)>=0);
            if( this.buscar.length<=0){
                this.obtenerDatos();
            }
        },
        async guardarLectura(){
            
            let store = this.abrirStore("tbllecturas",'readwrite');
            if( this.lectura.accion=='nuevo' ){
                this.lectura.idLectura = generarIdUnicoDesdeFecha();
            }
            let query = store.put(this.lectura);
            query.onsuccess=event=>{
                this.obtenerDatos();
                this.limpiar();
                
                this.mostrarMsg('Registro se guardo con exito',false);
            };
            query.onerror=event=>{
                this.mostrarMsg('Error al guardar el registro',true);
                console.log( event );
            };
        },
        mostrarMsg(msg, error){
            this.status = true;
            this.msg = msg;
            this.error = error;
            this.quitarMsg(3);
        },
        quitarMsg(time){
            setTimeout(()=>{
                this.status=false;
                this.msg = '';
                this.error = false;
            }, time*1000);
        },
        obtenerDatos(){
            let store = this.abrirStore('tbllecturas','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.lecturas = data.result;
                console.log( this.lecturas, this.lecturas[0].lecturas );
            };
        },
        mostrarLectura(ltr){
            this.lectura = ltr;
            this.lectura.accion='modificar';
        },
        limpiar(){
            this.lectura.accion='nuevo';
            this.lectura.lecturas = [];
            this.obtenerDatos();
        },
        eliminarLectura(ltr){
            if( confirm(`Esta seguro que desea eliminar el lectura:  ${ new Date(ltr.fecha).toLocaleDateString() }`) ){
                this.lectura = ltr;
                this.lectura.accion='eliminar';
                fetch(`private/modulos/lecturas/administracion.php?lectura=${JSON.stringify(this.lectura)}`,
                    {credentials: 'same-origin'})
                    .then(resp=>resp.json())
                    .then(resp=>{
                        this.obtenerDatos();
                        this.limpiar();
                        
                        this.mostrarMsg('Registro se guardo con exito',false);
                    });

                let store = this.abrirStore("tbllecturas",'readwrite'),
                    req = store.delete(ltr.idLectura);
                req.onsuccess=resp=>{
                    this.mostrarMsg('Registro eliminado con exito',true);
                    this.obtenerDatos();
                };
                req.onerror=resp=>{
                    this.mostrarMsg('Error al eliminar el registro',true);
                    console.log( resp );
                };
            }
        },
        abrirStore(store,modo){
            let tx = db.transaction(store,modo);
            return tx.objectStore(store);
        }
    },
    created(){
        
    },
    template:`
        <form v-on:submit.prevent="guardarLectura" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                            <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE LECTURAS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['lectura'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">FECHA:</div>
                        <div class="col-sm">
                            <input v-model="lectura.fecha" required type="date" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2 bg-success">
                        <div class="col-sm">CLIENTE:</div>
                        <div class="col-sm">Lectura Anterior</div>
                        <div class="col-sm">Lectura Actual</div>
                        <div class="col-sm">Pago</div>
                    </div>
                    <div v-for="lecturaCliente in lectura.lecturas" class="row p-2">
                        <div class="col-sm">{{ lecturaCliente.cliente }}</div>
                        <div class="col-sm">{{ lecturaCliente.lanterior }}</div>
                        <div class="col-sm">
                            <input @change="calcularPago(lecturaCliente)" v-model="lecturaCliente.lactual" required type="text" class="form-control form-control-sm" >
                        </div>
                        <div class="col-sm">{{ lecturaCliente.pago }}</div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm text-center">
                            <a class="btn btn-success" @click="nuevaLectura" >Nuevo</a>
                            <input type="submit" value="Guardar" class="btn btn-dark">
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
                    <div class="row text-center text-white bg-primary">
                        <div class="col"><h5>LECTURAS REGISTRADOS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoLectura" type="text" class="form-control form-contro-sm" placeholder="Buscar lecturas">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>FECHA</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="ltr in lecturas" v-on:click="mostrarLectura(ltr)">
                                        <td>{{ new Date(ltr.fecha).toLocaleDateString() }}</td>
                                        <td>
                                            <a @click.stop="eliminarLectura(ltr)" class="btn btn-danger">DEL</a>
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