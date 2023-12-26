import { collection, doc } from "firebase/firestore";
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
  toObject(): any {
    return JSON.parse(JSON.stringify(this));
  }
  fromObject(obj: any): any {
    throw new Error("BaseModel:fromObject - Must implement");
  }
}

export function converter<T extends BaseModel>(type: (new (...args : any[]) => T)) {
  return {
    toFirestore(m: T): DocumentData {
      return m.toObject() as DocumentData;
    },
    fromFirestore(snap: QueryDocumentSnapshot, options: SnapshotOptions): T {
      return type.prototype.fromObject(snap.data(options));
    },
  };
}

export function typedCollection<T extends BaseModel>(collectionPath: string, type: (new (...args : any[]) => T)) {
  return collection(db, collectionPath).withConverter(converter<T>(type));
}

export function typedDoc<T extends BaseModel>(collectionPath: string, type: (new (...args : any[]) => T)) {
  const closedConverter = converter<T>(type);
  return (docPath: string) => doc(db, collectionPath, docPath).withConverter(closedConverter);
}
