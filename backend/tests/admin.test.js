import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/User.js";

const registerAndLogin = async (email, role = "citizen") => {
  const res = await request(app).post("/api/auth/register").send({
    name: "Test User",
    email,
    password: "password123",
  });
  // Simulates the manual Atlas role edit used in real admin onboarding —
  // there is no public API to self-promote to admin, by design.
  if (role !== "citizen") {
    const user = await User.findOneAndUpdate({ email }, { role, twoFactorEnabled: true }, { new: true });
    const { default: generateToken } = await import("../src/utils/generateToken.js");
    const token = generateToken(user, true);
    return [`token=${token}`];
  }
  return res.headers["set-cookie"];
};

describe("Admin route protection", () => {
  it("blocks a citizen from the admin stats endpoint", async () => {
    const cookie = await registerAndLogin("citizen@test.com");
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", cookie);
    expect(res.status).toBe(403);
  });

  it("blocks an unauthenticated request entirely", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
  });

  it("allows an admin through", async () => {
    const cookie = await registerAndLogin("admin@test.com", "admin");
    const res = await request(app)
      .get("/api/admin/stats")
      .set("Cookie", cookie);
    expect(res.status).toBe(200);
    expect(res.body.stats).toBeDefined();
  });

  describe("Citizen deletion (super_admin only)", () => {
    it("allows super_admin to delete a citizen account", async () => {
      const citizenEmail = "delete_me@test.com";
      await registerAndLogin(citizenEmail, "citizen");
      const citizenUser = await User.findOne({ email: citizenEmail });
      expect(citizenUser).toBeDefined();

      const superAdminCookie = await registerAndLogin("superadmin@test.com", "super_admin");
      const res = await request(app)
        .delete(`/api/admin/users/${citizenUser._id}`)
        .set("Cookie", superAdminCookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const deletedUser = await User.findById(citizenUser._id);
      expect(deletedUser).toBeNull();
    });

    it("blocks super_admin from deleting another admin account", async () => {
      const adminEmail = "other_admin@test.com";
      await registerAndLogin(adminEmail, "admin");
      const adminUser = await User.findOne({ email: adminEmail });

      const superAdminCookie = await registerAndLogin("superadmin2@test.com", "super_admin");
      const res = await request(app)
        .delete(`/api/admin/users/${adminUser._id}`)
        .set("Cookie", superAdminCookie);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);

      const checkUser = await User.findById(adminUser._id);
      expect(checkUser).toBeDefined();
    });

    it("blocks a regular admin from deleting a citizen account", async () => {
      const citizenEmail = "citizen_safety@test.com";
      await registerAndLogin(citizenEmail, "citizen");
      const citizenUser = await User.findOne({ email: citizenEmail });

      const adminCookie = await registerAndLogin("regular_admin@test.com", "admin");
      const res = await request(app)
        .delete(`/api/admin/users/${citizenUser._id}`)
        .set("Cookie", adminCookie);

      expect(res.status).toBe(403);
    });
  });
});
