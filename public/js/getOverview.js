import $ from "../../public/lib/jquery/dist/jquery.js";

export function getOverview() {
    return get("overviewData");
}

function get(url, dateString) {
    return $.ajax(url, {
        type: "post",
        accepts: { "Content-Type": "application/json" },
        data: { "date": dateString },
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        error: onError,
        success: onSuccess
    });
}

function onSuccess(response) {
    return JSON.parse(response);
}

function onError(error) {
    console.log(error);
}