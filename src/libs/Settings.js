import ColorSchemeList from './ColorSchemeList.js'

class Settings {
    constructor () {
        this.colorScheme = ColorSchemeList.colorSchemes[0]
        this.timerInactivity = 60
    }

    isEqualTo (otherSettings) {
        return otherSettings.colorScheme === this.colorScheme &&
                otherSettings.timerInactivity === this.timerInactivity
    }

    isDefault () {
        return this.colorScheme === ColorSchemeList.colorSchemes[0] && this.timerInactivity === 60
    }

    restoreDefaults () {
        this.colorScheme = ColorSchemeList.colorSchemes[0]
        this.timerInactivity = 60
    }

    setSettingsFromUserCall (settings) {
        this.colorScheme = ColorSchemeList.colorSchemes[settings.colorScheme]
        this.timerInactivity = settings.inactivityTimer
    }
}

export default new Settings()