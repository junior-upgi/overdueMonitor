<?php

include 'serverVariable.php';
$connection = new PDO($dsn, $user, $password, $option); 
$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

header('Content-Type: application/csv');
header('Content-Disposition: attachement; filename="'.iconv("UTF-8","BIG5","逾期帳款資料 (輸出日期").date("Y-m-d").').csv"');

echo iconv("UTF-8","big5","逾期款項資料年度:");
echo $_GET["YEAR"]."\n";
echo iconv("UTF-8","big5","客戶名稱,付款條件,一月,二月,三月,四月,五月,六月,七月,八月,九月,十月,十一月,十二月,逾期總額,預收總額,催繳次數,責任業務\n");

$res = @$connection->query("SELECT * FROM UPGI_OverdueMonitor.dbo.annualReportDetail where YEAR='".$_GET["YEAR"]."' order by CUS_SNM");
	foreach ($res->fetchAll(PDO::FETCH_ASSOC) as $row) {
		echo iconv("UTF-8","BIG5",$row["CUS_SNM"].",");
		echo iconv("UTF-8","BIG5",$row["TERM_DESC"].",");
		echo $row["AMTN_PENDING_JAN"].",".
		$row["AMTN_PENDING_FEB"].",".
		$row["AMTN_PENDING_MAR"].",".
		$row["AMTN_PENDING_APR"].",".
		$row["AMTN_PENDING_MAY"].",".
		$row["AMTN_PENDING_JUN"].",".
		$row["AMTN_PENDING_JUL"].",".
		$row["AMTN_PENDING_AUG"].",".
		$row["AMTN_PENDING_SEP"].",".
		$row["AMTN_PENDING_OCT"].",".
		$row["AMTN_PENDING_NOV"].",".
		$row["AMTN_PENDING_DEC"].",".
		$row["TOTAL_AMTN_OVERDUE"].",".
		$row["AMTN_DEPOSIT"].",".
		$row["MAX_LATE_COUNT"].",";
		echo iconv("UTF-8","BIG5",$row["SAL_NAME"]."\n");
	}
?>