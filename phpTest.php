<?php
	$data = array(
		"title" => "【逾期款項發生警訊】",
		"content" => "【逾期款監控系統】致業務員：郭芳伊 - 客戶【BARALAN】以於昨日產生逾期款項 $6,402 (SA1050818002)。請注意！",
		"messageID" => "1",
		"systemID" => "1",
		"uid" => "05060001",
		"recipientID" => "05060001",
		"url" => "www.google.com.tw",
		"audioFile" => "alarm.mp3"
	);
	$data_string = json_encode($data);
echo $data_string;
	$ch = curl_init('http://upgi.ddns.net/productDevelopment/Service/SendMessage');
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		'Content-Type: application/json',
		'Content-Length: ' . strlen($data_string))
	);
	$result = curl_exec($ch);
?>