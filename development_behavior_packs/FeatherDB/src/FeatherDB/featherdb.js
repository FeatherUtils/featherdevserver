import * as mc from '@minecraft/server'
import WorldPesistentStorage from './Storage/WorldPesistentStorage'

function isMatch(object2, attrs) {
    let keys = Object.keys(attrs), length = keys.length;
    if (object2 == null) return !length;
    let obj = Object(object2);
    for (let i = 0; i < length; i++) {
        let key = keys[i];
        if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
}

class Collection {
    constructor(name, storage) {
        if(!name) throw new Error('Name is required')
        if(!storage) throw new Error('Storage is required')
        this.name = name
        this.storage = storage
        this.data = storage.load(name) || [];
    }
    save(data) {
        this.storage.save(this.name, data)
    }
    random(number) { 
        return Math.floor(8000000 + Math.random() * 1000000);
    }
    deleteDocumentByID(id) {
        let docIndex2 = this.data.findIndex((document) => document.id === id);
        if (docIndex2 < 0) return false;
        this.data.splice(docIndex2, 1);
        this.save(this.data);
        return true;
    }

    clear() {
        this.data = [];
        this.save(this.data);
    }

    insertDocument(data) {
        let id2 = this.random();
        this.data.push({
            id: id2,
            data: data,
            created: Date.now(),
            updated: Date.now(),
        });
        this.save(this.data);
    }

    findDocumentByID(id) {
        let docIndex = this.data.findIndex((document) => document.id === id);
        if (docIndex < 0) return null;
        return this.data[docIndex];
    }

    findDocuments(query) {
        return this.data.filter(doc2 => query == null || isMatch(doc2.data, query));
    }

    findFirst(query){
        return this.findDocuments(query)[0] || null;
    }

    overwriteDataByID(id, data) {
        let docIndex = this.data.findIndex((document) => document.id === id);
        if (docIndex < 0) return null;
        this.data[docIndex].data = data;
        this.data[docIndex].updated = Date.now();
        this.save(this.data);
        return data;
    }
}
class FeatherDB {
    constructor() {
        this.info = {
            version: "0.1"
        }
    }
    collection(name) {
        return new Collection(name,WorldPesistentStorage)
    }
}
var featherDB = new FeatherDB()
export { featherDB, Collection }