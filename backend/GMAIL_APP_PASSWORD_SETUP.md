# Gmail App Password Setup

Your current Gmail app password is invalid. Follow these steps to create a new one:

## Steps to Generate Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/security

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "2-Step Verification"
   - Follow the setup process
   - This is REQUIRED for app passwords

3. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - OR search for "App passwords" in your Google Account settings
   - Select "Mail" as the app
   - Select "Other (Custom name)" as the device
   - Enter "PCOS Tracker Backend" as the name
   - Click "Generate"

4. **Copy the 16-character password**
   - It will look like: `abcd efgh ijkl mnop` (with spaces)
   - Remove the spaces: `abcdefghijklmnop`

5. **Update your .env file**
   ```env
   EMAIL_USER=parashbista234@gmail.com
   EMAIL_PASS=abcdefghijklmnop
   ```

6. **Restart your backend server**
   ```bash
   npm run dev
   ```

## Troubleshooting

### "App passwords" option not available?
- Make sure 2-Step Verification is enabled
- Wait a few minutes after enabling 2-Step Verification
- Try accessing directly: https://myaccount.google.com/apppasswords

### Still getting authentication errors?
- Make sure you removed all spaces from the app password
- Make sure you're using the correct Gmail address
- Try generating a new app password
- Check if "Less secure app access" is disabled (it should be, use app passwords instead)

## Alternative: Use a Different Email Service

If Gmail doesn't work, you can use:

### SendGrid (Recommended for production)
- Free tier: 100 emails/day
- More reliable than Gmail
- Better for production apps

### Mailtrap (For testing)
- Catches all emails in a test inbox
- Perfect for development
- No real emails sent

---

**Once you update the app password, your email verification will work!**
