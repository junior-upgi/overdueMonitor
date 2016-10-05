<?php
	ini_set('display_errors', 1); //顯示錯誤訊息
	ini_set('log_errors', 1); //錯誤log 檔開啟
	ini_set('error_log', dirname(__FILE__) . '/error_log.txt'); //log檔位置
	error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT); //錯誤回報

  include 'serverVariable.php';
	$connection = new PDO($dsn, $user, $password, $option);
  $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  if(@$_GET['YEAR']==''){
    $Y=date("Y");
  }
  else{
    $Y=$_GET['YEAR'];
  }
?>

<!doctype html>
<html lang="zh-Hant">

  <head>
    <meta charset="utf-8">
    <title>逾期款項查詢系統</title>
    <link href="./global.css" rel="stylesheet">
  </head>

<body>
  <h1>逾期款項查詢系統</h1>
<div class="HTL">
<form style="margin:0px;display: inline">
  <select name="YEAR" onchange='location.href=form.YEAR[form.YEAR.selectedIndex].value;'>
  <option value="?">選擇查詢年度</option>
    <?php
      $sql = 'SELECT YEAR FROM UPGI_OverdueMonitor.dbo.observedYear;';
			$resultSet = @$connection->query($sql);
      $resultSet->setFetchMode(PDO::FETCH_ASSOC);
			while ($record = $resultSet->fetch()){
		?>
    <option value="?YEAR=<?php echo $record["YEAR"]?>"><?php echo $record["YEAR"]?></option>
    <?php	} ?>
  </select>
</form>
<?php echo "<span style='color: rgb(95, 74, 121)'>資料年度: ".$Y."</span>";?>
</div>
<div class="HTR">
	下載 CSV 純文字資料檔案: <a href="annualOutstandingCSV.php?YEAR=<?php echo $Y;?>"><?php echo $Y.'年度'?>逾期帳款</a> / <a href="annualPendingCSV.php?YEAR=<?php echo $Y;?>"><?php echo $Y.'年度'?>應收帳款</a>
</div>
<table width="100%" border="0" cellpadding="0" cellspacing="1" id="table">
  <tbody>
    <tr class="tableTop">
      <th align="center" style="color: rgba(255,255,255,1)">客戶名稱</th>
      <th align="center" style="color: rgba(255,255,255,1)">付款條件</th>
      <th align="center" style="color: rgba(255,255,255,1)">類別</th>
      <th align="center" style="color: rgba(255,255,255,1)">一月</th>
      <th align="center" style="color: rgba(255,255,255,1)">二月</th>
      <th align="center" style="color: rgba(255,255,255,1)">三月</th>
      <th align="center" style="color: rgba(255,255,255,1)">四月</th>
      <th align="center" style="color: rgba(255,255,255,1)">五月</th>
      <th align="center" style="color: rgba(255,255,255,1)">六月</th>
      <th align="center" style="color: rgba(255,255,255,1)">七月</th>
      <th align="center" style="color: rgba(255,255,255,1)">八月</th>
      <th align="center" style="color: rgba(255,255,255,1)">九月</th>
      <th align="center" style="color: rgba(255,255,255,1)">十月</th>
      <th align="center" style="color: rgba(255,255,255,1)">十一月</th>
      <th align="center" style="color: rgba(255,255,255,1)">十二月</th>
      <th align="center" style="color: rgba(255,255,255,1)">逾期合計</th>
      <th align="center" style="color: rgba(255,255,255,1)">未逾應收合計</th>
      <th align="center" style="color: rgba(255,255,255,1)">預收合計</th>
      <th align="center" style="color: rgba(255,255,255,1)">催收次數</th>
      <th align="center" style="color: rgba(255,255,255,1)">責任業務</th>
    </tr>
    
    <?php
		$resultSet = @$connection->query("SELECT * FROM UPGI_OverdueMonitor.dbo.annualReportDetail where YEAR='".$Y."' order by CUS_SNM;");
		if($resultSet->rowCount()!=0){
		foreach ($resultSet->fetchAll(PDO::FETCH_ASSOC) as $record) {
	?>
   <tr>
      <td rowspan="2" align="center"><?php echo $record['CUS_SNM']; ?></td>
      <td rowspan="2" align="center"><?php echo $record['TERM_DESC']; ?></td>
      <td align="center" style="color: #FF3636">逾期</td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_JAN"]!=NULL){echo number_format($record["AMTN_OVERDUE_JAN"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_FEB"]!=NULL){echo number_format($record["AMTN_OVERDUE_FEB"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_MAR"]!=NULL){echo number_format($record["AMTN_OVERDUE_MAR"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_APR"]!=NULL){echo number_format($record["AMTN_OVERDUE_APR"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_MAY"]!=NULL){echo number_format($record["AMTN_OVERDUE_MAY"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_JUN"]!=NULL){echo number_format($record["AMTN_OVERDUE_JUN"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_JUL"]!=NULL){echo number_format($record["AMTN_OVERDUE_JUL"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_AUG"]!=NULL){echo number_format($record["AMTN_OVERDUE_AUG"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_SEP"]!=NULL){echo number_format($record["AMTN_OVERDUE_SEP"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_OCT"]!=NULL){echo number_format($record["AMTN_OVERDUE_OCT"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_NOV"]!=NULL){echo number_format($record["AMTN_OVERDUE_NOV"],0);}?></td>
      <td class="overdue" align="center"><?php if($record["AMTN_OVERDUE_DEC"]!=NULL){echo number_format($record["AMTN_OVERDUE_DEC"],0);}?></td>
      <td class="overdue" rowspan="2" align="center"><?php echo number_format($record["TOTAL_AMTN_OVERDUE"]);?></td>
      <td class="pending" rowspan="2" align="center"><?php echo number_format($record["TOTAL_AMTN_PENDING"]);?></td>
      <td rowspan="2" align="center"><?php echo number_format($record["AMTN_DEPOSIT"]);?></td>
      <td rowspan="2" align="center"><?php echo $record["MAX_LATE_COUNT"];?></td>
      <td rowspan="2" align="center"><?php echo $record['SAL_NAME'];?></td>
    </tr>
    <tr>
      <td align="center" style="color: #3E90FF">應收</td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_JAN"]!=NULL){echo number_format($record["AMTN_PENDING_JAN"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_FEB"]!=NULL){echo number_format($record["AMTN_PENDING_FEB"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_MAR"]!=NULL){echo number_format($record["AMTN_PENDING_MAR"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_MAY"]!=NULL){echo number_format($record["AMTN_PENDING_APR"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_MAY"]!=NULL){echo number_format($record["AMTN_PENDING_MAY"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_JUN"]!=NULL){echo number_format($record["AMTN_PENDING_JUN"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_JUL"]!=NULL){echo number_format($record["AMTN_PENDING_JUL"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_AUG"]!=NULL){echo number_format($record["AMTN_PENDING_AUG"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_SEP"]!=NULL){echo number_format($record["AMTN_PENDING_SEP"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_OCT"]!=NULL){echo number_format($record["AMTN_PENDING_OCT"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_NOV"]!=NULL){echo number_format($record["AMTN_PENDING_NOV"]);}?></td>
      <td class="pending" align="center" style="color: #3E90FF"><?php if($record["AMTN_PENDING_DEC"]!=NULL){echo number_format($record["AMTN_PENDING_DEC"]);}?></td>
    </tr>
	  <?php }}else{?>
    <tr>
      <td colspan="20">尚無資料....</td>
    </tr>
    <?php } ?>
  </tbody>
<?php
  $resultSet = @$connection->query("SELECT * FROM UPGI_OverdueMonitor.dbo.annualReportMonthlySummary where YEAR='".$Y."';");
  if($resultSet->rowCount()!=0){
    foreach ($resultSet->fetchAll(PDO::FETCH_ASSOC) as $record) {
?>
  <tfoot>
    <tr>
      <th colspan="2" rowspan="2">合計</th>
      <th>逾期</th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_JAN"]!=NULL){echo number_format($record["AMTN_OVERDUE_JAN"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_FEB"]!=NULL){echo number_format($record["AMTN_OVERDUE_FEB"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_MAR"]!=NULL){echo number_format($record["AMTN_OVERDUE_MAR"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_APR"]!=NULL){echo number_format($record["AMTN_OVERDUE_APR"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_MAY"]!=NULL){echo number_format($record["AMTN_OVERDUE_MAY"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_JUN"]!=NULL){echo number_format($record["AMTN_OVERDUE_JUN"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_JUL"]!=NULL){echo number_format($record["AMTN_OVERDUE_JUL"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_AUG"]!=NULL){echo number_format($record["AMTN_OVERDUE_AUG"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_SEP"]!=NULL){echo number_format($record["AMTN_OVERDUE_SEP"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_OCT"]!=NULL){echo number_format($record["AMTN_OVERDUE_OCT"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_NOV"]!=NULL){echo number_format($record["AMTN_OVERDUE_NOV"],0);}?></th>
      <th class="overdue" align="center"><?php if($record["AMTN_OVERDUE_DEC"]!=NULL){echo number_format($record["AMTN_OVERDUE_DEC"],0);}?></th>
<?php }} ?>
<?php
  $resultSet = @$connection->query("SELECT * FROM UPGI_OverdueMonitor.dbo.annualReportSummary where YEAR='".$Y."';");
  if($resultSet->rowCount()!=0){
    foreach ($resultSet->fetchAll(PDO::FETCH_ASSOC) as $record) {
?>
      <th class="overdue" rowspan="2" align="center"><?php if($record["AMTN_OVERDUE"]!=NULL){echo number_format($record["AMTN_OVERDUE"],0);}?></th>
      <th class="pending" rowspan="2" align="center"><?php if($record["AMTN_PENDING"]!=NULL){echo number_format($record["AMTN_PENDING"],0);}?></th>
<?php }} ?>
<?php
  if($Y==2016){
    $resultSet = @$connection->query("SELECT AMTN_DEPOSIT FROM UPGI_OverdueMonitor.dbo.overview;");
    if($resultSet->rowCount()!=0){
      foreach ($resultSet->fetchAll(PDO::FETCH_ASSOC) as $record) {
?>
      <th rowspan="2"><?php echo number_format($record["AMTN_DEPOSIT"]);?></th>
<?php }}} else { ?>
      <th rowspan="2">0</th>
<?php }?>
      <th rowspan="2" colspan="2"></th>
    </tr>
<?php
  $resultSet = @$connection->query("SELECT * FROM UPGI_OverdueMonitor.dbo.annualReportMonthlySummary where YEAR='".$Y."';");
  if($resultSet->rowCount()!=0){
    foreach ($resultSet->fetchAll(PDO::FETCH_ASSOC) as $record) {
?>
    <tr>
      <th>應收</th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_JAN"]!=NULL){echo number_format($record["AMTN_PENDING_JAN"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_FEB"]!=NULL){echo number_format($record["AMTN_PENDING_FEB"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_MAR"]!=NULL){echo number_format($record["AMTN_PENDING_MAR"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_APR"]!=NULL){echo number_format($record["AMTN_PENDING_APR"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_MAY"]!=NULL){echo number_format($record["AMTN_PENDING_MAY"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_JUN"]!=NULL){echo number_format($record["AMTN_PENDING_JUN"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_JUL"]!=NULL){echo number_format($record["AMTN_PENDING_JUL"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_AUG"]!=NULL){echo number_format($record["AMTN_PENDING_AUG"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_SEP"]!=NULL){echo number_format($record["AMTN_PENDING_SEP"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_OCT"]!=NULL){echo number_format($record["AMTN_PENDING_OCT"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_NOV"]!=NULL){echo number_format($record["AMTN_PENDING_NOV"]);}?></th>
      <th class="pending" align="center"><?php if($record["AMTN_PENDING_DEC"]!=NULL){echo number_format($record["AMTN_PENDING_DEC"]);}?></th>
    </tr>
  </tfoot>
<?php }} ?>
</table>
</body>
</html>