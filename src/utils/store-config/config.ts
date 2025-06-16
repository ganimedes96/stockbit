"use server"
import { getStorage } from "firebase-admin/storage";

 
  const storage = getStorage().bucket();
  async function getDownloadURLFromPath(path: string) {
    if (!path) return null;
    
    const file = storage.file(path);
  
    const [url] = await file.getSignedUrl({
      action: "read",
      expires:"03-01-2500", 
    });
  
    return url;
  }
  
  
  export {  getDownloadURLFromPath }
 