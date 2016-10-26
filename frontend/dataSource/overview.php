<?php
    header('Content-Type:application/json;charset=utf-8');

    $databaseName = "overdueMonitor";
    $user = 'overdueMonitor';
    $password = 'overdueMonitor';
    $queryString = "SELECT * FROM overdueMonitor.dbo.overview;";
    $dsn = "odbc:DRIVER=FreeTDS;SERVERNAME=sunlikeerp;dbname=".$databaseName.";charset=UTF-8";
    $option = array('PDO::ATTR_ERRMODE' => 'PDO::ERRMODE_EXCEPTION', 'PDO::ATTR_DEFAULT_FETCH_MODE' => 'PDO::FETCH_ASSOC', 'PDO::ATTR_EMULATE_PREPARES' => 'false');
    try {
        $connection = new PDO($dsn, $user, $password, $option);
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $resultSet = $connection->query($queryString);
        $resultSet->setFetchMode(PDO::FETCH_ASSOC);
        while ($record = $resultSet->fetch()) {
            $resultSetArray[] = $record;
        }
        $resultSet->closeCursor();
        if (empty($resultSetArray)) {
            echo json_encode(json_decode('{}'));
        } else {
            echo json_encode($resultSetArray, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_PRESERVE_ZERO_FRACTION);
        }
        $connection = null;
    } catch (PDOException $error) {
        die('整體統計資料讀取發生錯誤...<br>'.$error->getMessage());
    }
?>