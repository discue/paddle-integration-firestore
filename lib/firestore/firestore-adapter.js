const { FieldValue, getFirestore } = require('firebase-admin/firestore')
const initFirebase = require('./init-firebase')

const app = initFirebase()
const firestore = getFirestore(app)

module.exports = {

    /**
     * @typedef {import('@google-cloud/firestore').CollectionReference} CollectionReference
     */

    /**
     * @typedef {import('@google-cloud/firestore').QuerySnapshot} QuerySnapshot
     */

    /**
     * @typedef {import('@google-cloud/firestore').DocumentReference} DocumentReference
     */

    /**
     * @typedef {import('@google-cloud/firestore').Query} Query
     */

    /**
     * Get a reference to a Firestore collection
     * 
     * @param {String} name the collection name
     * @returns {CollectionReference}
     */
    _getCollection(name) {
        return firestore.collection(name)
    },

    /**
     * Get all Refs (name & id properties) of a collection in a nested array
     * 
     * @param {CollectionReference|Query} target the firestore collection reference or query to execute
     * @param {String} resultName the name of the target resources array
     * @returns {Promise<Object>}
     */
    async _getAllDocumentRefs(target, resultName) {
        const snapshot = await target.get()
        const result = {}
        result[resultName] = []

        snapshot.forEach((doc) => {
            const { id } = doc
            const { name } = doc.data()
            result[resultName].push({ id, name })
        })

        return result
    },

    /**
     * Get all Docs of a collection in a nested array
     * 
     * @param {CollectionReference} collection the firestore collection reference
     * @param {String} resultName the name of the target resources array
     * @param {boolean} [addMetadata=false] true if metadata should be returned
     * @returns {Promise<Object>}
     */
    async _getAllDocuments(collection, resultName, addMetadata) {
        const snapshot = await collection.get()
        return this._snapshotToData(snapshot, resultName, addMetadata)
    },

    /**
     * Get all docs of a snapshot in a nested array
     * 
     * @param {QuerySnapshot} snapshot the firestore snapshot reference
     * @param {String} resultName the name of the target resources array
     * @param {boolean} [addMetadata=false] true if metadata should be returned
     * @returns {Promise<Object>}
     */
    async _snapshotToData(snapshot, resultName, addMetadata) {
        const result = {}
        result[resultName] = []

        snapshot.forEach((doc) => {
            const data = doc.data()
            if (!addMetadata) {
                this._deleteMetadata(data)
            } else {
                // add timestamps
                doc.createTime && (data._meta_data.created_at = doc.createTime)
                doc.updateTime && (data._meta_data.updated_at = doc.updateTime)
                data._meta_data.last_read_at = doc.readTime
            }
            result[resultName].push(data)
        })

        return result
    },

    _deleteMetadata(data) {
        Object.keys(data).forEach(key => {
            if (key.startsWith('_')) {
                delete data[key]
            }
        })
        return data
    },

    /**
     * Get a Document by id
     * 
     * @param {String|CollectionReference} collection the collection name
     * @param {any} byId the document id
     * @returns {Promise.<DocumentReference>}
     */
    async _getDocument(collection, byId) {
        if (typeof collection === 'string') {
            return firestore.collection(collection).doc(byId)
        } else {
            return collection.doc(byId)
        }
    },

    /**
     * Get a document that matches a specific condition / operator
     * 
     * @param {CollectionReference|string} collection the target collection or target collection name (if not a nested one)
     * @param {String} resultName the name of the result field
     * @param {String} field the fieldname
     * @param {String} operator the equality operator. See also https://firebase.google.com/docs/firestore/query-data/queries#query_operators
     * @param {String} target the operation target value
     * @param {boolean} [addMetadata=false] true if metadata should be returned
     * @returns 
     */
    async _getDocumentsWhere(collection, resultName, field, operator, target, addMetadata) {
        return this._getDocumentsWhereMultiple(collection, resultName, [{ field, operator, target }], null, addMetadata)
    },

    /**
     * Get a document that matches a specific set of condition / operators
     * 
     * @param {CollectionReference|string} collection the target collection or target collection name (if not a nested one)
     * @param {String} resultName the name of the result field
     * @param {Array} queries an array containing queries in format {field, operator, target}
     * @param {boolean} [addMetadata=false] true if metadata should be returned
     * @returns 
     */
    async _getDocumentsWhereMultiple(collection, resultName, queries, sortBy, addMetadata) {
        let collectionRef
        if (typeof collection === 'string') {
            collectionRef = firestore.collection(collection)
        } else {
            collectionRef = collection
        }

        let query = queries.reduce((queryOrCollection, nextQueryFunction) => {
            return nextQueryFunction(queryOrCollection)
        }, collectionRef)

        if (sortBy) {
            query = query.orderBy(sortBy, 'desc')
        }

        const snapshot = await query.get()
        return this._snapshotToData(snapshot, resultName, addMetadata)
    },

    /**
     * Insert a document into a collection
     * 
     * @param {CollectionReference} collection 
     * @param {any} id the document id
     * @param {Object} resource the document to add to the collection
     * @param {Object} additionalMetadata additional metadata to add to the document
     */
    async _putDocument(collection, id, resource, additionalMetadata) {
        const metadata = this._createMetadata(additionalMetadata)
        await collection.doc(id).set(Object.assign(resource, { id }, metadata))
    },

    /**
     * Updates a document with given properties
     * 
     * @param {CollectionReference} collection 
     * @param {any} id 
     * @param {Object} update 
     * @throws 'Not Found' if no document with id exists
     */
    async _updateDocument(collection, id, update) {
        const document = await collection.doc(id)
        // make sure document exists before updating
        await this._getDataIfDocExists(document)
        return this._executeDocumentUpdate(document, update)
    },

    /**
     * Update given document with given properties
     * 
     * @param {DocumentReference} document 
     * @param {Object} update 
     */
    async _executeDocumentUpdate(document, update) {
        const metadata = this._createMetadataForUpdate()
        await document.update(Object.assign(update, metadata))
    },

    /**
     * @typedef MetaDataForUpdate
     * @property updated_at
     */

    /**
     * Create a MetaData object for updates
     * 
     * @returns {MetaDataForUpdate}
     */
    _createMetadataForUpdate() {
        // need to use dot notation to enable update of nested value
        // https://firebase.google.com/docs/firestore/manage-data/add-data#update_fields_in_nested_objects
        return {
            '_meta_data.updated_at': FieldValue.serverTimestamp()
        }
    },

    /**
    * @typedef MetaData
    * @property created_at
    * @property updated_at
    */

    /**
     * Create a MetaData object for a new object
     * @param {Object} additionalMetadata additional metadata to add
     * 
     * @returns {MetaData}
     */
    _createMetadata(additionalMetadata) {
        const metadata = {
            _meta_data: {
                created_at: FieldValue.serverTimestamp(),
                updated_at: FieldValue.serverTimestamp()
            }
        }

        Object.entries(additionalMetadata).forEach(([key, value]) => {
            metadata._meta_data[key] = value
        })

        return metadata
    },

    /**
     * Get data of a document if document exists
     * 
     * @param {DocumentReference} doc the document reference
     * @param {boolean} [addMetadata=false] true if metadata should be returned
     * @throws 'Not Found' if document's exists property is false
     * @returns {Promise<any>} data of the document
     */
    async _getDataIfDocExists(doc, addMetadata = false) {
        const result = await doc.get()
        if (result.exists === false || result.empty === true) {
            throw new Error(module.exports.ERROR_NOT_FOUND)
        }
        let data
        let snapshot
        if (result.forEach) {
            snapshot = result.docs[0]
        } else {
            snapshot = result
        }
        data = snapshot.data()
        if (!addMetadata) {
            this._deleteMetadata(data)
        } else {
            // add timestamps
            result.createTime && (data._meta_data.created_at = result.createTime)
            result.updateTime && (data._meta_data.updated_at = result.updateTime)
            data._meta_data.last_read_at = result.readTime
        }
        return data
    },

    /**
     * Verify a document with given name and id does not exists
     * 
     * @param {CollectionReference} collection the firestore collection reference
     * @param {String|number} id the id of the another resource
     * @param {String} [name] optional, the name of another resource
    * @throws 'Exists' if a resource with name or id exists
     * @returns {Promise}
     */
    async _verifyIsNotADuplicate(collection, id, name) {
        let snapshot = await collection.doc(id).get()
        if (snapshot.exists) {
            throw new Error(module.exports.ERROR_EXISTS)
        }
        if (name) {
            snapshot = await collection.where('name', '==', name).get()
            if (!snapshot.empty) {
                throw new Error(module.exports.ERROR_EXISTS)
            }
        }
    },

    /**
     * Return a sub collection of a document of another collection
     * 
     * @param {String} parentCollectionName the name of the parent collection
     * @param {String|number} parentId the id of the parent document
     * @param {String} nestedCollectionName the name of the nested collection
     * @returns {Promise<CollectionReference>}
     */
    async _getNestedCollectionForParentDocument(parentCollectionName, parentId, nestedCollectionName) {
        const doc = await this._getDocument(parentCollectionName, parentId)
        await this._getDataIfDocExists(doc)
        return doc.collection(nestedCollectionName)
    },

    /**
     * Deletes all subcollections of a collection
     * 
     * @param {String} parentCollectionName 
     * @param {String|number} parentId 
     */
    async _deleteSubCollections(parentCollectionName, parentId) {
        const doc = await this._getDocument(parentCollectionName, parentId)
        await this._getDataIfDocExists(doc)
        await firestore.recursiveDelete(doc)
    },

    /**
     * Executes the given query until snapshot size is zero
     * 
     * @param {Query} query the query to execute
     * @param {Function} callback the callback will be called on completion (no more batches to process)
     * @returns 
     */
    async _executeBatch(query, callback) {
        const snapshot = await query.get()
        const batchSize = snapshot.size
        if (batchSize === 0) {
            callback()
            return
        }

        const batch = firestore.batch()
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref)
        })

        await batch.commit()

        // eslint-disable-next-line no-undef
        process.nextTick(() => {
            this._executeBatch(query, callback)
        })
    }
}

module.exports.ERROR_EXISTS = 'Exists'
module.exports.ERROR_NOT_FOUND = 'Not Found'