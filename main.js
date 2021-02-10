const indexDB = indexedDB.open('db_alumnos', 1);    
var generarIdUnicoDesdeFecha=()=>{
    let fecha = new Date(); // 05/02/21
    return Math.floor(fecha.getTime()/1000).toString(16);
};

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
            /*DB indexDB --> Es una DB NOSQL clave/valor.
              WebSQL --> Esta DB es relacional en el navegador.
              Localstorage --> Esta es NOSQL clave/valor.
            */

           if (this.accion=='nuevo'){
            this.alumno.idAlumno = generarIdUnicoDesdeFecha();
           }
           let db = indexDB.result,
           transaccion = db.transaction('tblalumnos', "readwrite"),
           alumnos = transaccion.objectStore('tblalumnos'),
           query = alumnos.put(JSON.stringify(this.alumno));

           query.onsuccess=event=>{
            this.obtenerAlumnos();
            this.limpiar();
            this.status = true;
            this.msg = 'Registro exitoso.';
            this.error = false;

            setTimeout(()=>{
                this.status=false;
                this.msg = '';
            }, 3000);
         };
             query.onerror=event=>{
              this.status = true;
               this.msg = 'Error al ingresar los datos.';
              this.error = true; 
              console.log( event );
            }; 
        },
           
           obtenerAlumnos(){
            this.alumnos = [];
            for (let index = 0; index < localStorage.length; index++) {
                let key = localStorage.key(index);
                this.alumnos.push( JSON.parse(localStorage.getItem(key)) );
            }
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
        },

        eliminarAlumno(alum){
            if (confirm(`Seguro que deseas eliminar el registro: ${alum.nombre}`) ){
               localStorage.removeItem(alum.idAlumno)
               this.obtenerAlumnos();
            }
        }

    },

    created(){
        indexDB.onupgradeneeded=event=>{
            let db = event.target.result,
            tblalumnos = db.createObjectStore('tblalumnos', {autoIncrement:true});
            tblalumnos.createIndex('idAlumno', 'idAlumno', {unique:true});
        };
        this.obtenerAlumnos();
    }
});
     
        