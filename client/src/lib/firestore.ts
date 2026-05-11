import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface Room {
  id: string;
  title: string;
  description: string;
  price: number;
  type: string;
  amenities: string[];
  address: string;
  lat: number;
  lng: number;
  photoUrl?: string;
  ownerName: string;
  ownerPhone: string;
  ownerUid: string;
  available: boolean;
  views: number;
  inquiries: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Inquiry {
  id: string;
  roomId: string;
  tenantName: string;
  tenantPhone: string;
  message: string;
  createdAt: Timestamp;
}

const ROOMS_COLLECTION = "rooms";
const INQUIRIES_COLLECTION = "inquiries";

// Room operations
export async function addRoom(roomData: Omit<Room, "id" | "createdAt" | "updatedAt" | "views" | "inquiries">) {
  try {
    const docRef = await addDoc(collection(db, ROOMS_COLLECTION), {
      ...roomData,
      views: 0,
      inquiries: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding room:", error);
    throw error;
  }
}

export async function getRooms() {
  try {
    const q = query(
      collection(db, ROOMS_COLLECTION),
      where("available", "==", true),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];
  } catch (error) {
    console.error("Error getting rooms:", error);
    throw error;
  }
}

export async function getRoomsByOwner(ownerUid: string) {
  try {
    const q = query(
      collection(db, ROOMS_COLLECTION),
      where("ownerUid", "==", ownerUid),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];
  } catch (error) {
    console.error("Error getting owner rooms:", error);
    throw error;
  }
}

export async function getRoomsByCity(city: string) {
  try {
    const q = query(
      collection(db, ROOMS_COLLECTION),
      where("address", ">=", city),
      where("address", "<=", city + "\uf8ff"),
      where("available", "==", true),
      orderBy("address"),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];
  } catch (error) {
    console.error("Error getting rooms by city:", error);
    throw error;
  }
}

export async function updateRoom(roomId: string, updates: Partial<Room>) {
  try {
    const roomRef = doc(db, ROOMS_COLLECTION, roomId);
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating room:", error);
    throw error;
  }
}

export async function deleteRoom(roomId: string) {
  try {
    await deleteDoc(doc(db, ROOMS_COLLECTION, roomId));
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
}

export function subscribeToRooms(callback: (rooms: Room[]) => void) {
  const q = query(
    collection(db, ROOMS_COLLECTION),
    where("available", "==", true),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const rooms = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Room[];
    callback(rooms);
  });
}

// Inquiry operations
export async function addInquiry(inquiryData: Omit<Inquiry, "id" | "createdAt">) {
  try {
    const docRef = await addDoc(collection(db, INQUIRIES_COLLECTION), {
      ...inquiryData,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding inquiry:", error);
    throw error;
  }
}

export async function getInquiriesByRoom(roomId: string) {
  try {
    const q = query(
      collection(db, INQUIRIES_COLLECTION),
      where("roomId", "==", roomId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Inquiry[];
  } catch (error) {
    console.error("Error getting inquiries:", error);
    throw error;
  }
}

export function subscribeToRoomInquiries(roomId: string, callback: (inquiries: Inquiry[]) => void) {
  const q = query(
    collection(db, INQUIRIES_COLLECTION),
    where("roomId", "==", roomId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (querySnapshot) => {
    const inquiries = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Inquiry[];
    callback(inquiries);
  });
}
