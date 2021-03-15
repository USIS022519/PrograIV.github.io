<?php

include('../../config/config.php');
EXTRACT($_REQUEST);

$class_categoria = new categoria($conexion);
$categoria = isset($categoria) ? $categoria : '[]';
print_r($class_categoria->recibirDatos($categoria));


/**
 *  @class categoria, representa la administracion de nuestra tabla de categorias
 */

class categoria{
    /**
     * @__construct @param  $db representa a nuestra BD
     */
    private $datos = [], $db;
    public $respuesta = ['msg'=>'correcto'];
    public function __construct($db=''){
        $this->db = $db;
    }

    /**
     * @function recibira los datos de la categoria (recibirDatos). 
     * @param $categoria son los datos que vienen de el front-end.
     */
    public function recibirDatos($categoria){
        $this->datos = json_decode($categoria, true);
        $this->validarDatos();
        return $this->validarDatos();
    }

    private function validarDatos(){
        if( empty(trim($this->datos['codigo'])) ){
            $this->respuesta['msg'] = 'Por favor ingrese el codigo de la categoria';
        }
        if( empty(trim($this->datos['descripcion'])) ){
            $this->respuesta['msg'] = 'Por favor ingrese la descripcion de la categoria';
        }
        if( empty(trim($this->datos['idCategoria'])) ){
            $this->respuesta['msg'] = 'Algo inesperado paso, no se obtuvo el ID de la categoria';
        }
        return $this->almacenarDatos();
    }

    private function almacenarDatos(){
        if( $this->respuesta['msg']==='correcto' ){
            if( $this->datos['accion']==='nuevo' ){
                $this->db->consultas('
                    INSERT INTO categorias (codigo,descripcion, idC) VALUES(
                        "'.$this->datos['codigo'].'",
                        "'.$this->datos['descripcion'].'",
                        "'.$this->datos['idCategoria'].'"
                    )
                ');
                return $this->db->obtenerUltimoId();
            } else if( $this->datos['accion']==='modificar' ){
                $this->db->consultas('
                    UPDATE categorias SET
                        codigo        = "'.$this->datos['codigo'].'",
                        descripcion   = "'.$this->datos['descripcion'].'"
                    WHERE idC = "'.$this->datos['idCategoria'].'"
                ');
                return $this->db->obtener_respuesta();
            } else if( $this->datos['accion']==='eliminar' ){
                $this->db->consultas('
                    DELETE categorias 
                    FROM categorias
                    WHERE idC = "'.$this->datos['idCategoria'].'"
                ');
                return $this->db->obtener_respuesta();
            }
        } else{
            return $this->respuesta;
        }
    }
} 