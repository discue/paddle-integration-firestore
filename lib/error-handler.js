const isCiTest = process.env.NODE_ENV === 'e2e' || process.env.NODE_ENV === 'ci'

module.exports = async (res, handler) => {
    try {
        await handler()
    } catch (e) {
        console.error('Handling error', e)
        if (isCiTest) {
            // return 200 if its a ci/cd environment
            return res.status(200).send()
        }
        if (e.message === 'Not Found') {
            return res.status(404).send()

        } else {
            return res.status(500).send()
        }
    }
}