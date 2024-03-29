import {collection, doc, getDoc, setDoc} from "firebase/firestore";
import type {
  QueryDocumentSnapshot,
  SnapshotOptions,
  DocumentData,
} from "firebase/firestore";

import {db} from "./firebaseInit";

// All firestore models need to meet this interface so that we can consistently
// have methods to setialize data before storing in firestore, which requires
// data to be plain objects.
export class BaseModel {
  id?: string = "";

  withId(id: string) {
    this.id = id;
    return this;
  }

  collectionPath(): string {
    throw new Error("BaseModel:collectionPath - Must implement");
  }

  toObject(): any {
    const copy = {...this};
    delete copy.id;
    return JSON.parse(JSON.stringify(copy));
  }

  fromObject(obj: any): any {
    throw new Error("BaseModel:fromObject - Must implement");
  }

  clone<T extends BaseModel>(): T {
    const id = this.id;
    const clone = this.fromObject(this.toObject());
    clone.id = id;
    return clone;
  }

  static async load<T extends typeof BaseModel>(this: T, id: string): Promise<InstanceType<T> | undefined> {
    if (!id) {
      throw new Error("Must have an id to load");
    }

    const result = new this() as InstanceType<T>;
    const documentReference = await getDoc(doc(db, result.collectionPath(), id));

    if (documentReference.exists()) {
      const data = documentReference.data();
      if (data) {
        return result.fromObject(data).withId(documentReference.id);
      }
    } else {
      throw new Error("Document does not exist");
    }
  }

  async save(): Promise<void> {
    if (!this.id) {
      throw new Error("Must have an id to save");
    }
    return setDoc(doc(db, this.collectionPath(), this.id), this.toObject());
  }
}

type Converter<T> = {
  toFirestore(m: T): DocumentData;
  fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): T;
};

export function converter<T extends BaseModel>(type: (new (...args : any[]) => T)) {
  return {
    toFirestore(m: T): DocumentData {
      return m.toObject() as DocumentData;
    },
    fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): T {
      return type.prototype.fromObject(snap.data(options)).withId(snap.id);
    },
  };
}

export function typedCollection<T extends BaseModel>(collectionPath: string, type: (new (...args : any[]) => T)) {
  return collection(db, collectionPath).withConverter(converter<T>(type));
}

const converterMap = new Map<string, any>();

export function typedDoc<T extends BaseModel>(collectionPath: string, type: (new (...args : any[]) => T)) {
  if (!converterMap.has(collectionPath)) {
    converterMap.set(collectionPath, converter<T>(type));
  }
  const cachedConverter = converterMap.get(collectionPath) as Converter<T>;
  return (docPath: string) => doc(db, collectionPath, docPath).withConverter(cachedConverter);
}

export async function mutate<T extends BaseModel>(model: T, ...fns: Array<(m: T) => Promise<T>>): Promise<T> {
  for (const fn of fns) {
    model = await fn(model);
  }
  await model.save();
  return model;
}
