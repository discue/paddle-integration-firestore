module.exports = async (res, handler) => {
    try {
        await handler()
    } catch (e) {
        console.error('Handling error', e)
        if (e.message === 'Not Found') {
            res.status(404).send()
        } else {
            res.status(500).send()
        }
    }
}