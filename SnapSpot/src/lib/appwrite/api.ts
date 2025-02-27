import { INewUser } from "@/types";
import { ID ,Query} from 'appwrite';
import { account, appwriteConfig, avatars, databases } from "./config";


export async function createUserAccount(user: INewUser) {
    try {
        const newAccount = await account.create(
            ID.unique(),
            user.email,
            user.password,
            user.name
        );
        if (!newAccount) throw Error;

        // Get the initials as a string
        const avatarUrlString = avatars.getInitials(user.name);

        // Convert the string to a URL object
        const avatarUrl = avatarUrlString; // It's already a string

        const newUser = await saveUserToDB({
            accountId: newAccount.$id,
            name: newAccount.name,
            email: newAccount.email,
            username: user.username,
            imageUrl: avatarUrl, // Now it's a URL object
        });

        return newUser;

    } catch (error) {
        console.log(error);
        return error;
    }
}

export async function saveUserToDB(user: {
    accountId: string;
    email: string;
    name: string;
    imageUrl: string;
    username?: string;
  }) {
    try {
      const newUser = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        ID.unique(),
        user
      );
  
      return newUser;
    } catch (error) {
      console.log(error);
    }
  }

export async function signInAccount(user: { email: string; password: string }) {
    try {
      // Check if there's an active session
      const currentSession = await account.get();
      if (currentSession) {
        // Optional: log out the current session if re-login is required
        await account.deleteSession("current");
      }
    } catch (error) {
      // If no session exists, account.get() might throw an error
      console.log("No active session found, proceeding with login.");
    }
    try {
      const session = await account.createEmailPasswordSession(user.email, user.password);
      
      return session;
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }

export async function getAccount() {
    try {   
      const currentAccount = await account.get();
  
      return currentAccount;
    } catch (error) {
    //   console.log(error);
    }
  }

export async function getCurrentUser() {
    try {
      const currentAccount = await getAccount();
  
      if (!currentAccount) throw Error;
  
      const currentUser = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("accountId", currentAccount.$id)]
      );
      return currentUser.documents[0];
      console.log(currentUser);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  export async function signOutAccount()
  {
    try{
        const session= await account.deleteSession("current");
        return session;
        console.log("session deleted" + session);
        
    }
    catch(error){
        console.log(error);
    }
  }