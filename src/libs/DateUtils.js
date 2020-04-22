class DateUtils {
    isValidDateStr (dateStr) {
        let dateParts = dateStr.split("-")
        if (dateParts.length !== 3) {
            return false
        }
        let year = parseInt(dateParts[0])
        let month = parseInt(dateParts[1])
        let day = parseInt(dateParts[2])
        return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1000
    }

    getDisplayDate (dateStr) {
        if (!this.isValidDateStr(dateStr)) {
            return null
        }
        let dateParts = dateStr.split("-")
        let year = parseInt(dateParts[0])
        let month = parseInt(dateParts[1])
        return this.getMonthFromNumber(month) + " " + year
    }

    getMonthFromNumber (monthVal) {
        switch (monthVal) {
            case 1:
                return "January"
            case 2:
                return "February"
            case 3:
                return "March"
            case 4:
                return "April"
            case 5:
                return "May"
            case 6:
                return "June"
            case 7:
                return "July"
            case 8:
                return "August"
            case 9:
                return "September"
            case 10:
                return "October"
            case 11:
                return "November"
            case 12:
                return "December"
        }
    }
}

export default new DateUtils()