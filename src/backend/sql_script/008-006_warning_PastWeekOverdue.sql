SELECT
    CAST('【上週逾期款項】' AS VARCHAR(255)) AS manualTopic
    ,'【' + b.CUS_SNM + '】上週逾期 $' + FORMAT(a.AMTN_OUT, N'N0', 'zh-TW') AS [content]
    ,4 AS messageCategoryID
    ,1 AS systemCategoryID
    ,'05060001' AS uid
    ,b.SAL_NO AS recipientID
    ,'http://upgi.ddns.net:9003/overdueMonitor?SAL_NO='+b.SAL_NO AS url
    ,'alarm.mp3' AS audioFile
    ,'【逾期款監控系統】致業務員：' + b.SAL_NAME + ' - 客戶【' + b.CUS_SNM + '】於上週產生逾期款項 $' + FORMAT(a.AMTN_OUT, N'N0', 'zh-TW') + ' (' + a.PS_NO + ') 仍未付款。請注意！' AS verboseMessage
    ,b.SAL_NAME
    ,a.CUS_NO
    ,b.CUS_SNM
    ,b.TERM_DESC
    ,a.PS_NO
    ,a.PS_DD
    ,a.YEAR
    ,a.MONTH
    ,a.AMTN_OUT
    ,0 AS G_PERIOD_REMAIN
    ,DATEADD(day, c.G_PERIOD, a.PS_DD) AS DUE_DATE
    ,CURRENT_TIMESTAMP AS generated
FROM overdueMonitor.dbo.outstanding a
    LEFT JOIN overdueMonitor.dbo.clientData b ON a.CUS_NO = b.CUS_NO
    LEFT JOIN overdueMonitor.dbo.paymentTerm c ON a.CUS_NO = c.CUS_NO
WHERE (a.STATUS = 1) AND (DATEADD(day, c.G_PERIOD, a.PS_DD) BETWEEN CAST(DATEADD(day, - 7, GETDATE()) AS DATE) AND CAST(DATEADD(day, - 1, GETDATE()) AS DATE));
