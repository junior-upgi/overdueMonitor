import $ from 'jquery';
import numeral from 'numeral';
import moment from 'moment-timezone';

import config from './config.js';

$('document').ready(function() {
    $('#currentDate').text(moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'));

    $.getJSON(config.serverUrl + '/overdueMonitor/overview')
        .done((overviewData) => {
            $('td#AMTN_PENDING_SUMMARY').text(numeral(overviewData[0].AMTN_PENDING).format('$0,0'));
            $('td#AMTN_OVERDUE_SUMMARY').text(numeral(overviewData[0].AMTN_OVERDUE).format('$0,0'));
            $('td#AMTN_DEPOSIT_SUMMARY').text(numeral(overviewData[0].AMTN_DEPOSIT).format('$0,0'));
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/annualReportSummary')
        .done((annualReportSummaryDataList) => {
            annualReportSummaryDataList.forEach((annualReportSummaryData) => {
                $('tbody#annualReportSummary').append(
                    `<tr>
                    <td class="text-center">${annualReportSummaryData.YEAR}</td>
                    <td class="text-center">${numeral(annualReportSummaryData.AMTN_OVERDUE).format('$0,0')}</td>
                    <td class="text-center danger">${numeral(annualReportSummaryData.AMTN_PENDING).format('$0,0')}</td>
                    </tr>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_OneWeek')
        .done((warning_OneWeekDataList) => {
            warning_OneWeekDataList.forEach((warning_OneWeekData) => {
                $('ol#oneWeekWarningList').append(
                    `<li class="panel panel-success">
                        <div class="panel-heading">
                            <strong>${warning_OneWeekData.verboseMessage}<strong>
                        </div>
                    </li>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_TwoWeek')
        .done((warning_TwoWeekDataList) => {
            warning_TwoWeekDataList.forEach((warning_TwoWeekData) => {
                $('ol#twoWeekWarningList').append(
                    `<li class="panel panel-info">
                        <div class="panel-heading">
                            <strong>${warning_TwoWeekData.verboseMessage}<strong>
                        </div>
                    </li>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_NewOverdue')
        .done((warning_NewOverdueDataList) => {
            warning_NewOverdueDataList.forEach((warning_NewOverdueData) => {
                $('ol#newOverdueList').append(
                    `<li class="panel panel-danger">
                        <div class="panel-heading">
                            <strong>${warning_NewOverdueData.verboseMessage}<strong>
                        </div>
                    </li>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_PastWeekOverdue')
        .done((warning_PastWeekOverdueDataList) => {
            warning_PastWeekOverdueDataList.forEach((warning_PastWeekOverdueData) => {
                $('ol#recentOverdueList').append(
                    `<li class="panel panel-warning">
                        <div class="panel-heading">
                            <strong>${warning_PastWeekOverdueData.verboseMessage}<strong>
                        </div>
                    </li>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_ProlongedOverdue')
        .done((warning_ProlongedOverdueDataList) => {
            warning_ProlongedOverdueDataList.forEach((warning_ProlongedOverdueData) => {
                $('ol#prolongedOverdueList').append(
                    `<li class="panel panel-primary">
                        <div class="panel-heading">
                            <strong>${warning_ProlongedOverdueData.verboseMessage}<strong>
                        </div>
                    </li>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
});
