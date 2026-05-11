import { describe, it, expect } from "vitest";
import app from "./firebase";

describe("Firebase Configuration", () => {
  it("should initialize Firebase app successfully", () => {
    expect(app).toBeDefined();
    expect(app.name).toBe("[DEFAULT]");
  });

  it("should have valid Firebase config", () => {
    const config = app.options;
    expect(config.apiKey).toBeDefined();
    expect(config.projectId).toBe("room-for-rent-fcacb");
    expect(config.authDomain).toBe("room-for-rent-fcacb.firebaseapp.com");
    expect(config.storageBucket).toBe("room-for-rent-fcacb.firebasestorage.app");
  });
});
