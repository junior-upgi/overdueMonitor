import moment from 'moment-timezone';

export function currentDatetime() {
    return moment(new Date().getTime());
}
