class User {
    constructor() {
        this.email = null
        this.username = null
        this.token = null
    }

    logout () {
        this.email = null
        this.username = null
        this.token = null
    }
}

export default new User()