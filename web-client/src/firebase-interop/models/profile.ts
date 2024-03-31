import {setDoc, query, where, getDocs} from "firebase/firestore";
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

export async function userNameExists(userName: string): Promise<boolean> {
    try {
        const usernameQuery = query(profilesCollection, where("userName", "==", userName));
        const docsReference = await getDocs(usernameQuery);
        return !docsReference.empty;
    } catch (e) {
        console.log("Failed to query profiles for userName", e)
        return true;
    }
}

type GetUserIdResponse = {
    userID: string;
    failureReason: "User Not Found" | "Too Many Users" | "ERROR" | null;
}

export async function getUserId(userName: string): Promise<GetUserIdResponse> {
    try {
        const usernameQuery = query(profilesCollection, where("userName", "==", userName));
        const docsReference = await getDocs(usernameQuery);
        if (docsReference.empty) {
            return {
                userID: "",
                failureReason: "User Not Found",
            };
        }

        const profiles = docsReference.docs;
        if (profiles.length > 1) {
            return {
                userID: "",
                failureReason: "Too Many Users",
            };
        }

        return {
            userID: profiles[0].id,
            failureReason: null,
        };
    } catch (e) {
        console.log("Failed to get userID", e);
        return {
            userID: "",
            failureReason: "ERROR",
        };
    }
}
