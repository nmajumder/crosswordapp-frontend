import api from "./api.js"

class MiniStatsService {
    
    async getMiniStats (userid) {
        if (this.ministats === null || this.ministats === undefined) {
            let response
            let requestSuccess = false
            try {
                console.log('Getting mini stats...')
                response = await api.getMiniStats(userid)
                console.log(response)
                requestSuccess = response.status === 200
            } catch (error) {
                requestSuccess = false
            }

            if (requestSuccess) {
                this.ministats = response.data
                return this.ministats
            }
        } else {
            return this.ministats
        }
    }

    getLoadedMiniStats () {
        return this.ministats
    }

    updateMiniStats (ministats) {
        this.ministats = ministats
    }

    async addStartedGame (userid, size, diff) {
        if (this.ministats === null || this.ministats === undefined) {
            // if we need to refresh ministats bc they are null, 
            // no need to increment game count bc will have pulled from db
            this.getMiniStats(userid)
        } else {
            // if ministats is non-null, we can just increment on client side and
            // count will be sync'd with next completed game
            let ind = (size-5)*3
            if (diff === "Moderate") ind++
            else if (diff === "Hard") ind++
            this.ministats.startedGames[ind] = this.ministats.startedGames[ind] + 1
        }
    }
}

export default new MiniStatsService()