const { FieldValue, Timestamp } = require('firebase-admin/firestore')
const firestoreAdapter = require('./firestore-adapter.js')

module.exports = (resourceName) => {
    return {
        _increment: FieldValue.increment.bind(FieldValue),
        _arrayUnion: FieldValue.arrayUnion.bind(FieldValue),
        _arrayRemove: FieldValue.arrayRemove.bind(FieldValue),
        _serverTimestamp: FieldValue.serverTimestamp.bind(FieldValue),

        _asTimestamp: (date) => {
            return Timestamp.fromDate(date)
        },

        async getAllRefs() {
            const collection = firestoreAdapter._getCollection(resourceName)
            return firestoreAdapter._getAllDocumentRefs(collection, resourceName)
        },

        async getAll(addMetadata = false) {
            const collection = firestoreAdapter._getCollection(resourceName)
            return firestoreAdapter._getAllDocuments(collection, resourceName, addMetadata)
        },

        async queryAllBy(queries, addMetadata = false) {
            return firestoreAdapter._getDocumentsWhereMultiple(resourceName, resourceName, queries, null, addMetadata)
        },

        async get(id, addMetadata = false) {
            const doc = await firestoreAdapter._getDocument(resourceName, id)
            return firestoreAdapter._getDataIfDocExists(doc, addMetadata)
        },

        async put(id, instance, additionalMetadata = {}) {
            const collection = firestoreAdapter._getCollection(resourceName)
            await firestoreAdapter._verifyIsNotADuplicate(collection, id, instance.name)
            await firestoreAdapter._putDocument(collection, id, instance, additionalMetadata)
        },

        async update(id, update) {
            const collection = await firestoreAdapter._getCollection(resourceName)
            await firestoreAdapter._updateDocument(collection, id, update)
        },

        async delete(id) {
            const collection = await firestoreAdapter._getCollection(resourceName)
            const doc = await firestoreAdapter._getDocument(resourceName, id)
            await firestoreAdapter._getDataIfDocExists(doc)
            await firestoreAdapter._deleteSubCollections(collection, id)
            await doc.delete()
        }
    }
}
