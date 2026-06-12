-- Add apartment image keys for S3-backed image attachments
ALTER TABLE "Apartment"
ADD COLUMN "imageKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];