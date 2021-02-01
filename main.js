var miDBAlumnos = openDatabase('dbAlumnos', '1.0', 'Aplicacion de registro de alumnos',5*1024*1024);

window.id = 0;

if(!miDBAlumnos){
    alert("El navegador no soporta web sql");
}

var appVue = new Vue({
    el: '#appAlumnos',
    data:{
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
        guardarAlumno(){
            /*db web sql*/
            miDBAlumnos.transaction(tran=> {
                tran.executeSql('INSERT INTO alumnos(idAlumno,codigo,nombre,direccion,municipio,departamento,telefono,fechaN,sexo) VALUES (?,?,?,?,?,?,?,?,?)',
                [++id,this.alumno.codigo,this.alumno.nombre,this.alumno.direccion,this.alumno.municipio,this.alumno.departamento,this.alumno.telefono,
                    this.alumno.fechaN,this.alumno.sexo]);
                    this.obtenerAlumnos();
                    this.limpiar();
               }, err=> {
                   console.log( err );
               });
           },
           
           obtenerAlumnos(){
            miDBAlumnos.transaction(tran=>{
                tran.executeSql('SELECT * FROM alumnos',[],(index,data)=>{
                    this.alumnos = data.rows;
                    id=data.rows.length;
                });
            }, err=>{
                console.log( err );
            });
        },

        mostrarAlumno(alum){
        this.alumno = alum;
        },
    
        limpiar(){
            this.alumno.codigo='';
            this.alumno.nombre='';
            this.alumno.direccion='';
            this.alumno.municipio='';
            this.alumno.departamento='';
            this.alumno.telefono='';
            this.alumno.fechaN='';
            this.alumno.sexo='';
        }

    },

    created(){
        miDBAlumnos.transaction(tran=>{
        tran.executeSql('CREATE TABLE IF NOT EXISTS alumnos(idAlumno int PRIMARY KEY NOT NULL, codigo varchar(10), nombre varchar(40), direccion varchar(50), municipio varchar(50), departamento varchar(25), telefono varchar(10), fechaN date, sexo varchar(10))');
        }, err=>{
            console.log( err );
        });
        this.obtenerAlumnos();
    }
});
     
        