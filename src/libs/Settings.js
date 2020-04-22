import ColorSchemeList from './ColorSchemeList.js'

class Settings {
    constructor () {
        this.colorScheme = ColorSchemeList.colorSchemes[0]
        this.playSound = true
        this.showTimer = true
        this.timerInactivity = 60
    }

    isEqualTo (otherSettings) {
        return otherSettings.colorScheme === this.colorScheme &&
                otherSettings.playSound === this.playSound &&
                otherSettings.showTimer === this.showTimer &&
                otherSettings.timerInactivity === this.timerInactivity
    }

    isDefault () {
        return this.colorScheme === ColorSchemeList.colorSchemes[0] &&
            this.playSound && this.showTimer && this.timerInactivity === 60
    }

    restoreDefaults () {
        this.colorScheme = ColorSchemeList.colorSchemes[0]
        this.playSound = true
        this.showTimer = true
        this.timerInactivity = 60
    }
}

export default Settings