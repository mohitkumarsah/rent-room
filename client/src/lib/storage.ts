import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadRoomPhoto(file: File, roomId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileName = `${roomId}-${timestamp}-${file.name}`;
    const storageRef = ref(storage, `room-photos/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw error;
  }
}

export async function uploadProfilePhoto(file: File, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileName = `${userId}-${timestamp}-${file.name}`;
    const storageRef = ref(storage, `profile-photos/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error("Error uploading profile photo:", error);
    throw error;
  }
}
