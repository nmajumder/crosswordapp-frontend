import api from "./api.js"

class RatingsService {
    async getRatings() {
        if (this.ratings === null || this.ratings === undefined) {
            await this.refreshRatings()
        }
        return this.ratings
    }

    async refreshRatings () {
        let response
        let requestSuccess
        try {
            response = await api.getAllRatings()
            requestSuccess = true
        } catch (error) {
            requestSuccess = false
        }

        if (!requestSuccess) {
            console.log("Failed to get all average ratings of crosswords")
        } else {
            this.ratings = response.data
        }
    }

    getRatingByCrosswordId (id) {
        let rating = this.ratings.find(r => r.crosswordId === id)
        return rating
    }
}

export default new RatingsService()