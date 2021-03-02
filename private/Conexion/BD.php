<?php

class DB_Conexion{
    private $conexion, $result;

    public function DB_Conexion($server, $user, $pass, $db){
        $this-> conexion = mysqli_connect($server, $user, $pass, $db) or die('No se pudo conectar a la base de datos');
    }

    public function consultas($sql){
        $this-> result = mysqli_query($this->conexion,$sql) or die(mysqli_error($this->conexion));
    }

    public function obtener_datos(){
        return $this-> result-> fetch_all(MYSQLI_ASSOC);
    }

    public function obtener_respuesta(){
        return $this-> result;
    }

    public function obtenerUltimoId(){
        return $this->result->id();
    }
}
