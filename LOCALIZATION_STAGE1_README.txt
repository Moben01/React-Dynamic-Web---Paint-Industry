ALIMI PAINT — 3 LANGUAGE MIGRATION / STAGE 1
=============================================

This stage is intentionally NON-DESTRUCTIVE.

What it does:
1. Adds the central localized content helpers for fa / ps / en.
2. On the first app start, creates a backup of current CMS content.
3. Creates a localized SHADOW copy of all translatable content where every old Dari string becomes:
   { "fa": "old Dari text", "ps": "", "en": "" }
4. Keeps the current live storage unchanged, so the existing website/Admin continues working during Stage 1.
5. Fixes the Header LTR spacing hack (removes margin-right: -78px), so English layout no longer gets the extra logo/navigation gap.

Migration marker:
  alimi-i18n-migration-v1

Backups:
  alimi-i18n-backup-v1:<original-storage-key>

Localized shadow data:
  alimi-i18n-shadow-v1:<original-storage-key>

Important:
Do not delete the backup keys until the complete 3-language migration is finished and tested.

Next stage:
Products + Categories Admin/Public pages will switch from plain strings to localized objects and use LocalizedField + localizedText().
