<?php
    $user = 'overdueMonitor';
    $password = 'overdueMonitor';
    $host = 'sunlikeerp';
    $dsn = 'odbc:DRIVER=FreeTDS;SERVERNAME='.$host.';dbname=overdueMonitor;charset=UTF-8';
    $option = array('PDO::ATTR_ERRMODE' => 'PDO::ERRMODE_EXCEPTION', 'PDO::ATTR_DEFAULT_FETCH_MODE' => 'PDO::FETCH_ASSOC', 'PDO::ATTR_EMULATE_PREPARES' => 'false');
?>