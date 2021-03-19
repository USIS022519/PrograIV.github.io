
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
        error : false,
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

            let sql = '';
            if(this.accion == 'nuevo'){
                this.alumno.idAlumno = generarIdUnicoDesdeFecha();
                sql = ' INSERT INTO alumnos(codigo,nombre,direccion,municipio,departamento,telefono,fechaN,sexo,idAlumno) VALUES (?,?,?,?,?,?,?,?,?)';
            }else if (this.accion == 'modificar'){
                sql = 'UPDATE alumnos SET codigo=?,nombre=?,direccion=?,municipio=?,departamento=?,telefono=?,fechaN=?,sexo=? where idAlumno=?';
            }
            miDBAlumnos.transaction(tran=>{
                tran.executeSql( sql,
                    [this.alumno.codigo,this.alumno.nombre,this.alumno.direccion,this.alumno.municipio,this.alumno.departamento,this.alumno.telefono,
                        this.alumno.fechaN,this.alumno.sexo,this.alumno.idAlumno]);
                        this.obtenerAlumnos();
                        this.limpiar();
                        this.status = true;
                        this.msg = 'Registro exitoso.';
                        this.error = false;
    
                        setTimeout(()=>{
                            this.status = false;
                            this.msg = '';
                        }, 3000)
                   }, err=> {
                       this.status = true;
                       this.msg = err.message;
                       this.error = true;
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
                        miDBAlumnos.transaction(tran=>{
                            tran.executeSql('DELETE FROM alumnos WHERE idAlumno=?',
                                [alum.idAlumno]);
                            this.obtenerAlumnos();
                        }, err=>{
                            console.log( err );
                        });
                    }
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
     
        