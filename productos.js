Vue.component('v-select-categorias', VueSelect.VueSelect);
Vue.component('component-productos',{
    data:()=>{
        return {
            accion : 'nuevo',
            msg    : '',
            status : false,
            error  : false,
            buscar : "",
            producto:{
                idProducto  : 0,
                categoria : {
                    id : 0,
                    label : '' 
                },
                codigo      : '',
                descripcion : '',
                precio      : ''
            },
            productos:[],
            categorias:[]
        }
    },
    methods:{
        buscandoProducto(){
            this.productos = this.productos.filter((element,index,productos) => element.descripcion.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerDatos();
            }
        },
        buscandoCodigoProducto(store){
            let buscarCodigo = new Promise( (resolver,rechazar)=>{
                let index = store.index("codigo"),
                    data = index.get(this.producto.codigo);
                data.onsuccess=evt=>{
                    resolver(data);
                };
                data.onerror=evt=>{
                    rechazar(data);
                };
            });
            return buscarCodigo;
        },
        async guardarProducto(){

            let store = this.abrirStore("tblproductos",'readwrite'),
                duplicado = false;
            if( this.accion=='nuevo' ){
                this.producto.idProducto = generarIdUnicoDesdeFecha();

                let data = await this.buscandoCodigoProducto(store);
                duplicado = data.result!=undefined;
            }
            if( duplicado==false){
                let query = store.put(this.producto);
                query.onsuccess=event=>{
                    this.obtenerDatos();
                    this.limpiar();

                    this.mostrarMsg('Registro se guardo con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('Error al guardar el registro',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo de producto duplicado',true);
            }
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
            let store = this.abrirStore('tblproductos','readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.productos = data.result;
            };
            let storeCategoria = this.abrirStore('tblcategorias','readonly'),
                dataCategoria = storeCategoria.getAll();
            this.categorias = [];
            dataCategoria.onsuccess=resp=>{
                dataCategoria.result.forEach(element => {
                    this.categorias.push({id:element.idCategoria, label:element.descripcion});
                });

            };
        },
        mostrarProducto(pro){
            this.producto = pro;
            this.accion='modificar';
        },
        limpiar(){
            this.accion='nuevo';
            this.producto.categoria.id=0;
            this.producto.categoria.label="";
            this.producto.idProducto='';
            this.producto.codigo='';
            this.producto.descripcion='';
            this.producto.precio='';
            this.obtenerDatos();
        },
        eliminarProducto(pro){
            if( confirm(`Esta seguro que desea eliminar el producto:  ${pro.descripcion}`) ){
                let store = this.abrirStore("tblproductos",'readwrite'),
                    req = store.delete(pro.idProducto);
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
        <form v-on:submit.prevent="guardarProducto" v-on:reset="limpiar">
            <div class="row">
                <div class="col-sm-5">
                    <div class="row p-2">
                        <div class="col-sm text-center text-white bg-primary">
                           <div class="row">
                                <div class="col-11">
                                    <h5>REGISTRO DE PRODUCTOS</h5>
                                </div>
                                <div class="col-1 align-middle" >
                                    <button type="button" onclick="appVue.forms['producto'].mostrar=false" class="btn-close" aria-label="Close"></button>
                                </div>
                            </div> 
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">CATEGORIA:</div>
                        <div class="col-sm">
                            <v-select-categorias v-model="producto.categoria" :options="categorias" placeholder="Por favor seleccione la categoria"/>
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">CODIGO:</div>
                        <div class="col-sm">
                            <input v-model="producto.codigo" required type="text" class="form-control form-control-sm" >
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">DESCRIPCION: </div>
                        <div class="col-sm">
                            <input v-model="producto.descripcion" required pattern="[A-ZÑña-z0-9, ]{5,65}" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm">PRECIO:</div>
                        <div class="col-sm">
                            <input v-model="producto.precio" required pattern="^[0-9](.)+?[0-9]$" type="text" class="form-control form-control-sm">
                        </div>
                    </div>
                    <div class="row p-2">
                        <div class="col-sm text-center">
                            <input type="submit" value="Guardar" class="btn btn-danger">
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
                        <div class="col"><h5>PRODUCTOS REGISTRADOS</h5></div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <table class="table table-sm table-hover">
                                <thead>
                                    <tr>
                                        <td colspan="5">
                                            <input v-model="buscar" v-on:keyup="buscandoProducto" type="text" class="form-control form-contro-sm" placeholder="Buscar productos">
                                        </td>
                                    </tr>
                                    <tr>
                                        <th>CODIGO</th>
                                        <th>DESCRIPCION</th>
                                        <th>PRECIO</th>
                                        <th>CATEGORIA</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="pro in productos" v-on:click="mostrarProducto(pro)">
                                        <td>{{ pro.codigo }}</td>
                                        <td>{{ pro.descripcion }}</td>
                                        <td>{{ pro.precio }}</td>
                                        <td>{{ pro.categoria.label }}</td>
                                        <td>
                                            <a @click.stop="eliminarProducto(pro)" class="btn btn-danger">DEL</a>
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