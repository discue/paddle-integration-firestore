const { FieldValue, Timestamp } = require('firebase-admin/firestore')
const firestoreAdapter = require('./firestore-adapter.js')

module.exports = ({ documentPath, resourceName, allowNameNotUnique = false }) => {
    const documentPathSplit = documentPath.split('/').filter(path => path)

    return {
        _arrayUnion: FieldValue.arrayUnion.bind(FieldValue),
        _arrayRemove: FieldValue.arrayRemove.bind(FieldValue),
        _increment: FieldValue.increment.bind(FieldValue),
        _serverTimestamp: FieldValue.serverTimestamp.bind(FieldValue),
        _asTimestamp: (date) => {
            return Timestamp.fromDate(date)
        },

        _expandPath: (resourceIds) => {
            const expandedPath = []
            expandedPath.push(documentPathSplit[0])
            documentPathSplit.slice(1).forEach((path, index) => {
                expandedPath.push(resourceIds[index])
                expandedPath.push(path)
            })
            const result = '/' + expandedPath.join('/')
            return result
        },

        _expandPathByResourceIds: (resourceIds) => {
            const expandedPath = []
            expandedPath.push(documentPathSplit[0])
            resourceIds.slice(0, -1).forEach((id, index) => {
                expandedPath.push(id)
                expandedPath.push(documentPathSplit[index + 1])
            })
            const result = '/' + expandedPath.join('/')
            return result
        },

        _getTargetIdFromResourceIds(resourceIds) {
            return resourceIds[resourceIds.length - 1]
        },

        _getNestedCollectionFromParentDocument(resourceIds) {
            const expandedPath = this._expandPath(resourceIds)
            if (!resourceIds || resourceIds.length <= 1) {
                return firestoreAdapter._getCollection(expandedPath)
            }

            let parentId = resourceIds.slice(-2, -1)[0]
            return firestoreAdapter._getNestedCollectionForParentDocument(expandedPath, parentId, resourceName)
        },

        async _traverseDocumentByParentsParent(resourceIds, eachCollectionCallback) {
            if (!resourceIds || resourceIds.length == 0 || resourceIds.length >= documentPathSplit.length) {
                console.error(`Invalid Request. Arguments for traverst must point to parent's parent.`)
                console.error(`Invalid Request >> Received ${resourceIds} while configured path is ${documentPath}`)
                throw new Error('Invalid Request')
            }
            const parentId = this._getTargetIdFromResourceIds(resourceIds)
            const expandedPath = this._expandPathByResourceIds(resourceIds)
            const parentDocument = await firestoreAdapter._getDocument(expandedPath, parentId)
            const parentCollections = await parentDocument.listCollections()
            const resources = {
                [resourceName]: []
            }
            for (let parentCollection of parentCollections) {
                const { path } = parentCollection
                // make sure that all resource ids are actually part of the path
                // to ensure we are not exposing other data
                if (resourceIds.every((id) => path.includes(id))) {
                    const { docs } = await parentCollection.get()
                    for (let { id } of docs) {
                        const collection = await firestoreAdapter._getNestedCollectionForParentDocument(path, id, resourceName)
                        await eachCollectionCallback(collection)
                    }
                }
            }
            return resources
        },

        /**
         * Get references to all stored resources
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @returns 
         */
        async getAllRefs(resourceIds) {
            const parentId = this._getTargetIdFromResourceIds(resourceIds)
            const expandedPath = this._expandPath(resourceIds)
            const collection = await firestoreAdapter._getNestedCollectionForParentDocument(expandedPath, parentId, resourceName)
            return firestoreAdapter._getAllDocumentRefs(collection, resourceName)
        },

        async getAllRefsTraversing(resourceIds) {
            const resources = {
                [resourceName]: []
            }

            await this._traverseDocumentByParentsParent(resourceIds, async (collection) => {
                const split = collection.path.split('/')
                const parent = split[split.length - 3]
                const childId = split[split.length - 2]
                const result = await firestoreAdapter._getAllDocumentRefs(collection, resourceName)
                result[resourceName].forEach(resource => {
                    resource.id = `${parent}/${childId}/${resourceName}/${resource.id}`
                    resources[resourceName].push(resource)
                })
            })

            return resources
        },

        /**
         * Get all stored resources
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {boolean} [addMetadata=false] add meta data to the return objects
         * @returns 
         */
        async getAll(resourceIds, addMetadata = false) {
            const parentId = this._getTargetIdFromResourceIds(resourceIds)
            const expandedPath = this._expandPath(resourceIds)
            const collection = await firestoreAdapter._getNestedCollectionForParentDocument(expandedPath, parentId, resourceName)
            return firestoreAdapter._getAllDocuments(collection, resourceName, addMetadata)
        },

        /**
         * Get all resources by traversing from the parent's parent
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {boolean} [addMetadata=false] add meta data to the return objects 
        * @returns 
         */
        async getAllTraversing(resourceIds, addMetadata = false) {
            const resources = {
                [resourceName]: []
            }

            await this._traverseDocumentByParentsParent(resourceIds, async (collection) => {
                const split = collection.path.split('/')
                const parent = split[split.length - 3]
                const childId = split[split.length - 2]
                const result = await firestoreAdapter._getAllDocuments(collection, resourceName, addMetadata)
                result[resourceName].forEach(resource => {
                    resource.id = `${parent}/${childId}/${resourceName}/${resource.id}`
                    resources[resourceName].push(resource)
                })
            })

            return resources
        },

        /**
         * Get all stored resources that match the query
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {Array} queries an array of query items
         * @param {boolean} [addMetadata=false] add meta data to the return objects
         * @see https://firebase.google.com/docs/firestore/query-data/queries
         * @returns 
         */
        async queryAllBy(resourceIds, query, addMetadata) {
            let collection
            const expandedPath = this._expandPath(resourceIds)
            if (resourceIds) {
                const parentId = this._getTargetIdFromResourceIds(resourceIds)
                collection = await firestoreAdapter._getNestedCollectionForParentDocument(expandedPath, parentId, resourceName)
            } else {
                collection = firestoreAdapter._getCollection(expandedPath)

            }
            return firestoreAdapter._getDocumentsWhereMultiple(collection, resourceName, query, null, addMetadata)
        },

        /**
         * Get a reference to a resource by ids
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {boolean} [addMetadata=false] add meta data to the return objects
         * @returns 
         */
        async getRef(resourceIds, addMetadata = false) {
            const { id, name } = await this.get(resourceIds, addMetadata)
            return {
                id, name
            }
        },

        /**
         * Get a resource by ids
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {boolean} [addMetadata=false] add meta data to the return objects
         * @returns 
         */
        async get(resourceIds, addMetadata = false) {
            const targetId = this._getTargetIdFromResourceIds(resourceIds)
            const collection = await this._getNestedCollectionFromParentDocument(resourceIds)
            const document = await firestoreAdapter._getDocument(collection, targetId)
            return firestoreAdapter._getDataIfDocExists(document, addMetadata)
        },

        /**
         * Add a resource to a collection by ids
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {Object} resource the resource to be stored
         * @param {boolean} [addMetadata=false] add meta data to the return objects
         * @returns 
         */
        async put(resourceIds, resource, additionalMetadata = false) {
            const targetId = this._getTargetIdFromResourceIds(resourceIds)
            const collection = await this._getNestedCollectionFromParentDocument(resourceIds)
            await firestoreAdapter._verifyIsNotADuplicate(collection, targetId, allowNameNotUnique ? null : resource.name)
            await firestoreAdapter._putDocument(collection, targetId, resource, additionalMetadata)
        },

        /**
         * Update a resource by ids
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @param {Object} resource values that should be updated
         * @returns 
         */
        async update(resourceIds, update) {
            const targetId = this._getTargetIdFromResourceIds(resourceIds)
            const collection = await this._getNestedCollectionFromParentDocument(resourceIds)
            await firestoreAdapter._updateDocument(collection, targetId, update)
        },

        /**
         * Delete a resource by ids
         * 
         * @param {Array.<String>} resourceIds resource ids that will added to the resource path i.e. /users/${id}/documents/${id}
         * @returns 
         */
        async delete(resourceIds) {
            const targetId = this._getTargetIdFromResourceIds(resourceIds)
            const collection = await this._getNestedCollectionFromParentDocument(resourceIds)
            const document = collection.doc(targetId)
            await firestoreAdapter._getDataIfDocExists(document)
            await firestoreAdapter._deleteSubCollections(collection, targetId)
            await document.delete()
        }
    }
}