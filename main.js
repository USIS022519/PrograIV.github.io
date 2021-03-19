var generarIdUnicoDesdeFecha=()=>{
    let fecha = new Date();//03/02/2021
    return Math.floor(fecha.getTime()/1000).toString(16);
}, db;
var appVue = new Vue({
    el:'#appSistema',
    data:{
        forms:{
            'registro_alumnos':{mostrar:false},
            'matricula':{mostrar:false},
            'materias':{mostrar:false},
            'inscripcion':{mostrar:false},
        }
    },
    methods:{
        abrirBd(){
            let indexDb = indexedDB.open('db_sistema_academico',1);
            indexDb.onupgradeneeded=event=>{
                let req=event.target.result,

                    tblmatricula = req.createObjectStore('tblmatricula',{keyPath:'idMatricula'}),
                    tblregistro = req.createObjectStore('tblregistro',{keyPath:'idRegistro'}),
                    tblmateria = req.createObjectStore('tblmateria',{keyPath:'idMateria'}),
                    tblinscripcion = req.createObjectStore('tblinscripcion',{keyPath:'idInscripcion'})

                tblmatricula.createIndex('idMatricula','idMatricula',{unique:true});
                tblmatricula.createIndex('codigo','codigo',{unique:false});
                tblmatricula.createIndex('id','id',{unique:false});
                
                tblregistro.createIndex('idRegistro','idRegistro',{unique:true});
                tblregistro.createIndex('codigo','codigo',{unique:false});

                tblmateria.createIndex('idMateria','idMateria',{unique:true});
                tblmateria.createIndex('codigo','codigo',{unique:false});

                tblinscripcion.createIndex('idInscripcion','idInscripcion',{unique:true});
                tblinscripcion.createIndex('codigo','codigo',{unique:false});

     
            };
            indexDb.onsuccess = evt=>{
                db=evt.target.result;
            };
            indexDb.onerror=e=>{
                console.log("Error al conectar a la BD", e);
            };
        }
    },
    created(){
        /**
             * Estas son las bases de datos con las que se ha trabajado.
             * webSQL -> DB Relacional en el navegador
             * localStorage -> BD NOSQL clave/valor
             * indexedDB -> BD NOSQL clave/valor
             */
        this.abrirBd();
    }
});

document.addEventListener("DOMContentLoaded",event=>{
    let el = document.querySelectorAll(".mostrar").forEach( (element, index)=>{
        element.addEventListener("click",evt=>{
            appVue.forms[evt.target.dataset.form].mostrar = true;
            appVue.$refs[evt.target.dataset.form].obtenerDatos();
        });
    } );
});
     
        