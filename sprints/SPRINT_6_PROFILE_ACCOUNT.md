# SPRINT 6: Profile & Account Management
**Duration:** Week 11-12  
**Goal:** Complete user profile and account features  
**Total Story Points:** 21

---

## PCOS-11: Profile Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to view my profile so that I can see my personal information and health summary.

**Acceptance Criteria:**
- [ ] Header with gradient background
- [ ] Profile picture (or initials avatar)
- [ ] User name display
- [ ] User email display
- [ ] Quick stats cards:
  - 🔥 Mood streak (X days)
  - ⭐ Sleep streak (X days)
  - 📅 Last period (X days ago)
- [ ] Action buttons:
  - Edit Profile
  - Settings
- [ ] Quick navigation cards:
  - Mood Tracking
  - Sleep Tracking
- [ ] Responsive design
- [ ] Pull to refresh stats

**UI Layout:**
```
┌─────────────────────────┐
│   [Profile Picture]     │
│      User Name          │
│      user@email.com     │
├─────────────────────────┤
│ [Edit Profile] [Settings]│
├─────────────────────────┤
│  Stats Cards (3 cols)   │
│  🔥 5 days │ ⭐ 3 days │ 📅 12 days │
├─────────────────────────┤
│  Quick Actions          │
│  [Mood] [Sleep]         │
└─────────────────────────┘
```

---

## PCOS-12: Edit Profile Screen
**Type:** Story | **Priority:** High | **Points:** 5

**User Story:**  
As a user, I want to edit my profile so that I can update my personal information.

**Acceptance Criteria:**
- [ ] Header with back button and "Edit Profile" title
- [ ] Profile picture section:
  - Current image or initials
  - Camera icon overlay
  - Tap to open image picker
- [ ] expo-image-picker integration:
  - Option: Take Photo
  - Option: Choose from Library
  - Image cropping (optional)
- [ ] Form fields:
  - Name (TextInput, pre-filled)
  - Email (TextInput, pre-filled, validated)
- [ ] Save Changes button
- [ ] Cancel/Back navigation
- [ ] Loading state during save
- [ ] Success toast/message
- [ ] Image stored as base64 in AsyncStorage
- [ ] Profile data updated in AuthContext

**Image Handling:**
```typescript
// Use expo-image-picker
const result = await ImagePicker.launchImageLibraryAsync({
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  allowsEditing: true,
  aspect: [1, 1],
  quality: 0.5, // Compress for storage
  base64: true,
});
```

---

## PCOS-8: Forgot Password Flow
**Type:** Story | **Priority:** Medium | **Points:** 5

**User Story:**  
As a user who forgot my password, I want to reset it via email so that I can regain access to my account.

**Acceptance Criteria:**

**Frontend - Forgot Password Screen:**
- [ ] Email input field
- [ ] "Send Reset Link" button
- [ ] Loading state
- [ ] Success message: "Check your email for reset instructions"
- [ ] Back to login link

**Backend - POST /api/auth/forgot-password:**
- [ ] Validate email exists
- [ ] Generate reset token (crypto.randomBytes)
- [ ] Store token with expiry (1 hour)
- [ ] Send email with reset link/code
- [ ] Return success (don't reveal if email exists)

**Backend - POST /api/auth/reset-password:**
- [ ] Validate token and expiry
- [ ] Validate new password
- [ ] Hash and update password
- [ ] Clear reset token
- [ ] Return success

**Frontend - Reset Password Screen:**
- [ ] Token/code input (if using code)
- [ ] New password field
- [ ] Confirm password field
- [ ] Reset button
- [ ] Success: redirect to login

**Email Service (Nodemailer):**
```typescript
// email.service.ts
async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `yourapp://reset-password?token=${token}`;
  // Or use a 6-digit code for mobile
  await transporter.sendMail({
    to: email,
    subject: 'Reset Your PCOS Tracker Password',
    html: `<p>Your reset code is: <strong>${code}</strong></p>`
  });
}
```

---

## PCOS-9: Change Password Feature
**Type:** Story | **Priority:** Medium | **Points:** 3

**User Story:**  
As a logged-in user, I want to change my password so that I can maintain account security.

**Acceptance Criteria:**

**Frontend - Change Password Screen:**
- [ ] Current password field
- [ ] New password field
- [ ] Confirm new password field
- [ ] Validation:
  - Current password required
  - New password min 8 chars
  - Passwords must match
- [ ] Change Password button
- [ ] Loading state
- [ ] Success message
- [ ] Error handling (wrong current password)

**Backend - PUT /api/auth/change-password:**
- [ ] Auth middleware required
- [ ] Validate current password
- [ ] Validate new password requirements
- [ ] Hash new password
- [ ] Update in database
- [ ] Return success

**API Contract:**
```
PUT /api/auth/change-password
Authorization: Bearer <token>
Body: {
  "currentPassword": "string",
  "newPassword": "string"
}

Success (200): { "message": "Password changed successfully" }
Error (401): { "error": "Current password is incorrect" }
```

---
