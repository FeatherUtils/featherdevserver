// src/index.js
import { world as world2, system as system2 } from "@minecraft/server";

// src/FeatherDB/featherdb.js
import * as mc2 from "@minecraft/server";

// src/FeatherDB/Storage/WorldPesistentStorage.js
import * as mc from "@minecraft/server";
var WorldPersistentStorage = class {
  constructor() {
  }
  load(collection) {
    mc.system.run(() => {
      let val;
      try {
        val = mc.world.getDynamicProperty(`_FEATHERCOLLECTION:${collection}`);
      } catch {
        val = ``;
      }
      if (!val) val = `[]`;
      let data = [];
      try {
        data = JSON.parse(val);
      } catch {
        data = [];
      }
      return data;
    });
  }
  save(collection, data) {
    mc.system.run(() => {
      mc.world.setDynamicProperty(`_FEATHERCOLLECTION:${collection}`, JSON.stringify(data));
      return true;
    });
  }
};
var WorldPesistentStorage_default = new WorldPersistentStorage();

// src/FeatherDB/featherdb.js
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
var Collection = class {
  constructor(name, storage) {
    if (!name) throw new Error("Name is required");
    if (!storage) throw new Error("Storage is required");
    this.name = name;
    this.storage = storage;
    this.data = storage.load(name) || [];
  }
  save(data) {
    this.storage.save(this.name, data);
  }
  random(number) {
    return Math.floor(8e6 + Math.random() * 1e6);
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
      data,
      created: Date.now(),
      updated: Date.now()
    });
    this.save(this.data);
  }
  findDocumentByID(id) {
    let docIndex = this.data.findIndex((document) => document.id === id);
    if (docIndex < 0) return null;
    return this.data[docIndex];
  }
  findDocuments(query) {
    return this.data.filter((doc2) => query == null || isMatch(doc2.data, query));
  }
  findFirst(query) {
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
};
var FeatherDB = class {
  constructor() {
    this.info = {
      version: "0.1"
    };
  }
  collection(name) {
    return new Collection(name, WorldPesistentStorage_default);
  }
};
var featherDB = new FeatherDB();

// src/index.js
import { ActionForm } from "@minecraft/server-ui";
