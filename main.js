 var generarIdUnicoDesdeFecha=()=>{
    let fecha = new Date(); // 05/02/21
    return Math.floor(fecha.getTime()/1000).toString(16);
}, db;

var appVue = new Vue({
    el: '#appAlumnos',
    data:{
        accion : 'nuevo',
        msg : '',
        status : false,
        error :  false,
        buscar : "",
        alumno:{
            idAlumno : 0,
            codigo : '',
            nombre : '',
            direccion : '',
            municipio : '',
            departamento : '',
            telefono : '',
            fechaN : '',
            sexo : ''
        },
        alumnos:[]
    },
    methods:{

        buscandoAlumnos(){
            this.alumnos = this.alumnos.filter((element,index,alumnos) => element.nombre.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 || element.codigo.toUpperCase().indexOf(this.buscar.toUpperCase())>=0 );
            if( this.buscar.length<=0){
                this.obtenerAlumnos();
            }
        },

        guardarAlumno(){
            /*DB indexedDB --> Es una DB NOSQL clave/valor.
              WebSQL --> Esta DB es relacional en el navegador.
              Localstorage --> Esta es NOSQL clave/valor.
            */

            let store = this.abrirStore("tblalumnos", 'readwrite'),
            duplicado = false;

            if ( this.accion == 'nuevo' ){
                this.alumno.idAlumno = generarIdUnicoDesdeFecha();
                let index = store.index("codigo"),
                    data = index.get(this.alumno.codigo);
                data.onsuccess=evt=>{
                    duplicado = evt.target.result!=undefined;
                };
            }
            if ( duplicado == false){
                let query = store.put(this.alumno);
                query.onsuccess=event=>{
                    this.obtenerAlumnos();
                    this.limpiar();
                    this.mostrarMsg('Registro guardado con exito',false);
                };
                query.onerror=event=>{
                    this.mostrarMsg('error al guardar registro',true);
                    console.log( event );
                };
            } else{
                this.mostrarMsg('Codigo del alumno duplicado',true);
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
                    this.status = false;
                    this.msg = '';
                    this.error = false;
                 }, time*1000);
             }, 
           
           obtenerAlumnos(){
            /*this.alumnos = [];
            for (let index = 0; index < localStorage.length; index++) {
                let key = localStorage.key(index);
                this.alumnos.push( JSON.parse(localStorage.getItem(key)) );
            }*/
            let store = this.abrirStore('tblalumnos', 'readonly'),
                data = store.getAll();
            data.onsuccess=resp=>{
                this.alumnos = data.result;
            };
        },

        mostrarAlumno(alum){
        this.alumno = alum;
        this.accion= 'modificar';
        },
    
        limpiar(){
            this.accion = 'nuevo';
            this.alumno.idAlumno='';
            this.alumno.codigo='';
            this.alumno.nombre='';
            this.alumno.direccion='';
            this.alumno.municipio='';
            this.alumno.departamento='';
            this.alumno.telefono='';
            this.alumno.fechaN='';
            this.alumno.sexo='';
            this.obtenerAlumnos();
        },

        eliminarAlumno(alum){
            if (confirm(`Seguro que deseas eliminar el registro: ${alum.nombre}`) ){
               let store = this.abrirStore("tblalumnos", 'readwrite'),
                   req = store.delete(alum.idAlumno);
               req.onsuccess=resp=>{
                   this.mostrarMsg('Registro eliminado con exito',true);
                   this.obtenerAlumnos();
               };
               req.onerror=resp=>{
                   this.mostrarMsg('Error al eliminar registro',true);
                   console.log( resp );
               };
            };
        },
        abrirBd(){
            let indexDb = indexedDB.open('db_alumnos',1);
            indexDb.onupgradeneeded=event=>{
                let req=event.target.result,
                    tblalumnos = req.createObjectStore('tblalumnos', {keyPath:'idAlumno'});
                tblalumnos.createIndex('idAlumno', 'idAlumno', {unique:true});
                tblalumnos.createIndex('codigo', 'codigo', {unique:false});
            };
            indexDb.onsuccess=evt=>{
                db=evt.target.result;
                this.obtenerAlumnos();
            };
            indexDb.onerror=e=>{
                console.log("Error al conectar la BD", e);
            };
        },
        abrirStore(store,modo){
           let tx = db.transaction(store,modo);
           return tx.objectStore(store);
        }
    },
    created(){
       this.abrirBd();
    }
});
     
        