import {setDoc} from "firebase/firestore";
import {typedCollection, typedDoc, BaseModel} from "../baseModel";

export const COLLECTION_PATH = "profiles";

export class Profile extends BaseModel {
  userName: string;
  description: string;

  constructor(userName: string = "", description: string = "") {
    super();

    this.userName = userName ?? "";
    this.description = description ?? "";
  }

  collectionPath(): string {
    return COLLECTION_PATH;;
  }

  fromObject(obj: any): Profile {
    return new Profile(obj.userName, obj.description);
  }
};

export const profilesCollection = typedCollection(COLLECTION_PATH, Profile);
export const profileDoc = typedDoc(COLLECTION_PATH, Profile);

export async function addProfile(uid: string, profile: Profile): Promise<Profile> {

  try {
    await setDoc(profileDoc(uid), profile);
  } catch (e) {
    console.error("Error adding document: ", e);
  }

  return profile;
}

export async function getOrCreateProfile(uid: string, defaultUserName: string = ""): Promise<Profile | undefined> {
    let profile = undefined;

    try {
        profile = await Profile.load(uid);
    } catch (e) {}

    if (profile) {
        return profile;
    }

    try {
        return addProfile(uid, new Profile(defaultUserName));
    } catch (e) {
        console.error("Error creating document: ", e);
    }

    return undefined;
}
