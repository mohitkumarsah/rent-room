import { addInquiry } from "./firestore";
import { updateRoom } from "./firestore";

export interface ContactNotification {
  roomId: string;
  tenantName: string;
  tenantPhone: string;
  message: string;
  timestamp: Date;
}

/**
 * Send a contact inquiry notification when a tenant clicks the WhatsApp/contact button
 * This creates an inquiry record in Firestore and can trigger email notifications
 */
export async function sendContactNotification(
  roomId: string,
  tenantName: string,
  tenantPhone: string,
  message: string = "Interested in this room"
): Promise<void> {
  try {
    // Add inquiry to Firestore
    const inquiryId = await addInquiry({
      roomId,
      tenantName,
      tenantPhone,
      message,
    });

    // Increment inquiry count for the room
    await updateRoom(roomId, {
      inquiries: (await getInquiryCount(roomId)) + 1,
    } as any);

    console.log(`Inquiry created: ${inquiryId}`);

    // In a production app, you would also:
    // 1. Send an email to the room owner
    // 2. Send a push notification
    // 3. Log analytics event
  } catch (error) {
    console.error("Error sending contact notification:", error);
    throw error;
  }
}

/**
 * Get the count of inquiries for a room
 */
export async function getInquiryCount(roomId: string): Promise<number> {
  try {
    // This would query Firestore to count inquiries
    // For now, returning 0 as placeholder
    return 0;
  } catch (error) {
    console.error("Error getting inquiry count:", error);
    return 0;
  }
}

/**
 * Track room view when a user opens a listing detail
 */
export async function trackRoomView(roomId: string): Promise<void> {
  try {
    await updateRoom(roomId, {
      views: (await getRoomViewCount(roomId)) + 1,
    } as any);
  } catch (error) {
    console.error("Error tracking room view:", error);
  }
}

/**
 * Get the current view count for a room
 */
export async function getRoomViewCount(roomId: string): Promise<number> {
  try {
    // This would query Firestore to get current views
    // For now, returning 0 as placeholder
    return 0;
  } catch (error) {
    console.error("Error getting room view count:", error);
    return 0;
  }
}
