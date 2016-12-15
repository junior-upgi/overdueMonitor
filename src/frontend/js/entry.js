import $ from 'jquery';
import numeral from 'numeral';

$('document').ready(function() {
    $.getJSON('http://127.0.0.1:9003/overdueMonitor/overview')
        .done((overviewData) => {
            $('td#AMTN_PENDING_SUMMARY').text(numeral(overviewData[0].AMTN_PENDING).format('$0,0'));
            $('td#AMTN_OVERDUE_SUMMARY').text(numeral(overviewData[0].AMTN_OVERDUE).format('$0,0'));
            $('td#AMTN_DEPOSIT_SUMMARY').text(numeral(overviewData[0].AMTN_DEPOSIT).format('$0,0'));
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON('http://127.0.0.1:9003/overdueMonitor/annualReport')
        .done((annualReportListData) => {
            annualReportListData.forEach((annualReportData) => {
                $('tbody#annualReportSummary').append(
                    `<tr>
                    <td class="text-center">${annualReportData.YEAR}</td>
                    <td class="text-center">${numeral(annualReportData.AMTN_OVERDUE).format('$0,0')}</td>
                    <td class="text-center danger">${numeral(annualReportData.AMTN_PENDING).format('$0,0')}</td>
                    </tr>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
});
