export interface Calendar {
    year: number
    month: number
    day?: number
    hour?: number
    minute?: number
    second?: number
}

export function calendarToDate(calendar: Calendar): Date {
    return new Date(calendar.year, calendar.month - 1, calendar.day ?? 1, calendar.hour ?? 0, calendar.minute ?? 0, calendar.second ?? 0)
}

export function dateToCalendar(date: Date): Calendar {
    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
    }
}

export function calendarToString(calendar: Calendar): string {
    function fmt(n: number): string { return n >= 10 ? n + '' : `0${n}` }

    return calendar.year + '-' + fmt(calendar.month) + 
        (calendar.day === undefined ? '' : ('-' + fmt(calendar.day!) +
        (calendar.hour === undefined ? '' : (' ' + fmt(calendar.hour!) +
        (calendar.minute === undefined ? '' : (':' + fmt(calendar.minute!) +
        (calendar.second === undefined ? '' : (':' + fmt(calendar.second!)))))))))
}

function isLeapYear(year: number) {
    return !(year % (year % 100 ? 4 : 400))
}

const generalDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function getDayCountOfMonth(year: number, month: number) {
    return generalDayCount[month - 1] + ((isLeapYear(year) && month === 2) ? 1 : 0)
}