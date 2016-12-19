import $ from 'jquery';
import numeral from 'numeral';
import moment from 'moment-timezone';

import config from './config.js';
import utility from './utility.js';

$('document').ready(function() {
    const userID = utility.getAllUrlParams().SAL_NO;

    $('#currentDate').text(moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD'));

    $.getJSON(config.serverUrl + '/overdueMonitor/overview')
        .done((overviewData) => {
            $('td#AMTN_PENDING_SUMMARY').text(numeral(overviewData[0].AMTN_PENDING).format('$0,0'));
            $('span#AMTN_OVERDUE_SUMMARY').text(numeral(overviewData[0].AMTN_OVERDUE).format('$0,0'));
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
                        <td class="text-center danger">
                            <span class="text-danger">${numeral(annualReportSummaryData.AMTN_PENDING).format('$0,0')}<span>
                        </td>
                    </tr>`);
            });
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_OneWeek')
        .done((warning_OneWeekDataList) => {
            warning_OneWeekDataList.forEach((warning_OneWeekData) => {
                if ((userID === undefined) || (userID === '08030005') || (userID === warning_OneWeekData.recipientID)) {
                    $('ol#oneWeekWarningList').append(
                        `<li class="panel panel-success">
                        <div class="panel-heading">
                            <strong>${warning_OneWeekData.verboseMessage}<strong>
                        </div>
                    </li>`);
                }
            });
            $('span[data-list="oneWeekWarningList"]').addClass('dataReady');
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_TwoWeek')
        .done((warning_TwoWeekDataList) => {
            warning_TwoWeekDataList.forEach((warning_TwoWeekData) => {
                if ((userID === undefined) || (userID === '08030005') || (userID === warning_TwoWeekData.recipientID)) {
                    $('ol#twoWeekWarningList').append(
                        `<li class="panel panel-info">
                        <div class="panel-heading">
                            <strong>${warning_TwoWeekData.verboseMessage}<strong>
                        </div>
                    </li>`);
                }
            });
            $('span[data-list="twoWeekWarningList"]').addClass('dataReady');
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_NewOverdue')
        .done((warning_NewOverdueDataList) => {
            warning_NewOverdueDataList.forEach((warning_NewOverdueData) => {
                if ((userID === undefined) || (userID === '08030005') || (userID === warning_NewOverdueData.recipientID)) {
                    $('ol#newOverdueList').append(
                        `<li class="panel panel-danger">
                        <div class="panel-heading">
                            <strong>${warning_NewOverdueData.verboseMessage}<strong>
                        </div>
                    </li>`);
                }
            });
            $('span[data-list="newOverdueList"]').addClass('dataReady');
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_PastWeekOverdue')
        .done((warning_PastWeekOverdueDataList) => {
            warning_PastWeekOverdueDataList.forEach((warning_PastWeekOverdueData) => {
                if ((userID === undefined) || (userID === '08030005') || (userID === warning_PastWeekOverdueData.recipientID)) {
                    $('ol#recentOverdueList').append(
                        `<li class="panel panel-warning">
                        <div class="panel-heading">
                            <strong>${warning_PastWeekOverdueData.verboseMessage}<strong>
                        </div>
                    </li>`);
                }
            });
            $('span[data-list="recentOverdueList"]').addClass('dataReady');
        })
        .fail((error) => {
            alert(error);
        });
    $.getJSON(config.serverUrl + '/overdueMonitor/warning_ProlongedOverdue')
        .done((warning_ProlongedOverdueDataList) => {
            warning_ProlongedOverdueDataList.forEach((warning_ProlongedOverdueData) => {
                if ((userID === undefined) || (userID === '08030005') || (userID === warning_ProlongedOverdueData.recipientID)) {
                    $('ol#prolongedOverdueList').append(
                        `<li class="panel panel-primary">
                        <div class="panel-heading">
                            <strong>${warning_ProlongedOverdueData.verboseMessage}<strong>
                        </div>
                    </li>`);
                }
            });
            $('span[data-list="prolongedOverdueList"]').addClass('dataReady');
        })
        .fail((error) => {
            alert(error);
        });
    $('span.listControl').click(function() {
        if ($(this).hasClass('dataReady') === true) { // only allow expand and retract to hide data list if data loading is ready (dataReady class attrib)
            let clickedGlyphicon = $(this);
            if ($(this).hasClass('glyphicon-triangle-top')) {
                $('ol#' + $(this).data('list')).slideUp(1000, function() {
                    clickedGlyphicon.removeClass('glyphicon-triangle-top').addClass('glyphicon-triangle-bottom');
                });
            } else {
                $('ol#' + $(this).data('list')).slideDown(1000, function() {
                    clickedGlyphicon.removeClass('glyphicon-triangle-bottom').addClass('glyphicon-triangle-top');
                });
            }
        }
    });
});
