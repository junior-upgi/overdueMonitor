<?php
    $user = 'sunlikeReader'; 
    $password = 'sunlikeReader';
    $host = 'svd13216pwb'; //production server is to be connected to 'sunv9'
    $dsn = 'odbc:DRIVER=FreeTDS;SERVERNAME='.$host.';dbname=UPGI_OverdueMonitor;charset=UTF-8';
    $option = array('PDO::ATTR_ERRMODE' => 'PDO::ERRMODE_EXCEPTION', 'PDO::ATTR_DEFAULT_FETCH_MODE' => 'PDO::FETCH_ASSOC', 'PDO::ATTR_EMULATE_PREPARES' => 'false');
?>