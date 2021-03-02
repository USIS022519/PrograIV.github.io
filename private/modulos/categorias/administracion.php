<?php

include('../../config/config.php');

/**
 *  @class categoria, representa la administracion de nuestra tabla de categorias
 */

class categoria{
    /**
     * @__construct @param  $db representa a nuestra BD
     */
    private $datos = [], $db;
    public $respuesta = ['mgs' => 'correcto'];
    public function __construct($db=''){
        $this-> db = $db;
    }

    /**
     * @function recibira los datos de la categoria (recibirDatos)
     * @param $categoria son los datos que vienen de el front-end
     */
    public function recibirDatos($categoria){
        $this->datos = json_decode($categoria, true);
        $this->validadDatos();
    }

    private function validadDatos(){
        if(empty(trim($this->datos['codigo']))){
            $this->respuesta['msg'] = 'Por favor ingrese el codigo';
        }
        if(empty(trim($this->datos['descripcion']))){
            $this->respuesta['msg'] = 'Por favor ingrese la descripcionde la categoria';
        }
        if(empty(trim($this->datos['idCategoria']))){
            $this->respuesta['msg'] = 'No sea podido obtener el Id de la categoria';
        }
        $this->almacenarDatos();
    }

    private function almacenarDatos(){
        if($this->respuesta['msg']==='correcto'){
            if($this->datos['accion']==='nuevo'){
                $this->db->consultas('
                   INSERT INTO categorias (codigo, descripcion, idC) VALUES (
                       "'.$this->datos['codigo'].'",
                       "'.$this->datos['descripcion'].'",
                       "'.$this->datos['idC'].'"
                   )              
                ');
            }
        }
    }
}