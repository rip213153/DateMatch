# SMTP Email Notes

This project now sends email through personal mailbox SMTP instead of Resend.

Supported environment variables:

```bash
# Legacy single-account config still works
SMTP_HOST=smtp.qq.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_account@qq.com
SMTP_PASS=your_smtp_authorization_code
SMTP_FROM=DateMatch <your_account@qq.com>

# Optional dual-account config
SMTP_PRIMARY_HOST=smtp.qq.com
SMTP_PRIMARY_PORT=465
SMTP_PRIMARY_SECURE=true
SMTP_PRIMARY_USER=primary_account@qq.com
SMTP_PRIMARY_PASS=primary_smtp_authorization_code
SMTP_PRIMARY_FROM=DateMatch <primary_account@qq.com>

SMTP_SECONDARY_HOST=smtp.163.com
SMTP_SECONDARY_PORT=465
SMTP_SECONDARY_SECURE=true
SMTP_SECONDARY_USER=secondary_account@163.com
SMTP_SECONDARY_PASS=secondary_smtp_authorization_code
SMTP_SECONDARY_FROM=DateMatch <secondary_account@163.com>

# Optional per-scene routing
EMAIL_ROUTE_CONFIRMATION=primary,secondary
EMAIL_ROUTE_MATCH_RESULT=primary,secondary
EMAIL_ROUTE_CHAT_REMINDER=secondary,primary
EMAIL_ROUTE_FEEDBACK=secondary,primary

# Optional daily caps
EMAIL_DAILY_LIMIT_TIMEZONE=Asia/Shanghai
EMAIL_DAILY_LIMIT_MATCH_RESULT_PRIMARY=100
```

Notes:

- If `SMTP_PRIMARY_*` is omitted, the app falls back to the legacy `SMTP_*` variables as the primary account.
- If the preferred account for a scene fails, delivery automatically retries with the next configured account.
- If a configured daily cap is reached, that account is skipped for the scene and the next account takes over.

Behavior:

- `submit-profile` keeps sending the existing profile confirmation email.
- `feedback` keeps sending the existing feedback email.
- match result emails are now sent automatically after the release countdown ends.
- chat reminder emails reuse `chat_notification_events` and are rate-limited to one email per sender/receiver pair every 2 hours.

Implementation entry points:

- `lib/email.ts`
- `lib/email-jobs.ts`
- `instrumentation.ts`
- `register.node.ts`
