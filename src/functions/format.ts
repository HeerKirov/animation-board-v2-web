
function isLeapYear(year: number) {
    return !(year % (year % 100 ? 4 : 400))
}

const generalDayCount = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export function getDayCountOfMonth(year: number, month: number) {
    return generalDayCount[month - 1] + ((isLeapYear(year) && month === 2) ? 1 : 0)
}