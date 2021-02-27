 var generarIdUnicoDesdeFecha=()=>{
    let fecha = new Date(); // 05/02/21
    return Math.floor(fecha.getTime()/1000).toString(16);
}, db;

var appVue = new Vue({
    el: '#appSistema',
    data:{
        forms : {
            'categoria': {mostrar:false},
            'producto': {mostrar:false},
            'cliente': {mostrar:false},
        }
    },

    methods:{

        abrirBd(){

            let indexDb = indexedDB.open('db_sistema_facturacion',1);
            indexDb.onupgradeneeded=event=>{
                let req=event.target.result,
                    tblproductos = req.createObjectStore('tblproductos', {keyPath:'idProducto'}),
                    tblcategorias = req.createObjectStore('tblcategorias', {keyPath:'idCategoria'}),
                    tblclientes = req.createObjectStore('tblclientes', {keyPath:'idCliente'}),
                    tblproveedores = req.createObjectStore('tblproveedores', {keyPath:'idProveedor'})

                tblproductos.createIndex('idProducto','idProducto',{unique:true});
                tblproductos.createIndex('codigo','codigo',{unique:false});
                tblproductos.createIndex('id','id',{unique:false});

                tblcategorias.createIndex('idCategoria','idCategoria',{unique:true});
                tblcategorias.createIndex('codigo','codigo',{unique:false});

                tblclientes.createIndex('idCliente','idCliente',{unique:true});
                tblclientes.createIndex('codigo','codigo',{unique:false});

                tblproveedores.createIndex('idProveedor','idProveedor',{unique:true});
                tblproveedores.createIndex('codigo','codigo',{unique:false});
            };
            indexDb.onsuccess=evt=>{

                db=evt.target.result;

              };

               indexDb.onerror=e=>{
               console.log("Error al conectar la BD", e);
            };

        }
    },
    created(){
       this.abrirBd();
    }
});

    document.addEventListener("DOMContentLoaded",event=>{
        let el = document.querySelectorAll(".mostrar").forEach( (element, index)=>{
            element.addEventListener("click", evt=>{
                appVue.forms[evt.target.dataset.form].mostrar = true;
                appVue.$refs[evt.target.dataset.form].obtenerDatos();
            });
        });
    });
     
        