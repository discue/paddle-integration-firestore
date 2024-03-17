module.exports = async (callback, { maxRetries = 10, delay = 500, backOff = 2 } = {}) => {
    for (let i = 1; i <= maxRetries; i++) {
        try {
            return await callback()
        } catch (e) {
            if (i === maxRetries) {
                throw e
            }

            console.log(`Caught error ${e}. Will retry ${maxRetries - i} more times.`)
            await new Promise((resolve) => setTimeout(resolve, delay * i * backOff))
        }
    }
}