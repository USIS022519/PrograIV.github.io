var miDBAlumnos = openDatabase('dbAlumnos', '1.0', 'Aplicacion de registro de alumnos',5*1024*1024);

var generarIdUnicoDesdeFecha=()=>{
    let fecha = new Date(); // 05/02/21
    return Math.floor(fecha.getTime()/1000).toString(16);
};

if(!miDBAlumnos){
    alert("El navegador no soporta web sql");
}

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
            /*Db LocalStorage*/

           if (this.accion=='nuevo'){
            this.alumno.idAlumno = generarIdUnicoDesdeFecha();
           }

           localStorage.setItem( this.alumno.idAlumno, JSON.stringify(this.alumno) );
           this.obtenerAlumnos();
           this.limpiar();
           this.status = true;
           this.msg = 'Registro exitoso.';
           this.error = false;

           setTimeout(()=>{
               this.status=false;
               this.msg = '';
           }, 3000);
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
        this.obtenerAlumnos();
    }
});
     
        