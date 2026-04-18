CREATE TABLE "ml_bookmark" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_message" (
	"author_email" text,
	"author_name" text,
	"body_html" text,
	"body_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"dedupe_hash" text,
	"external_url" text,
	"id" text PRIMARY KEY,
	"in_reply_to" text,
	"references_header" text,
	"rfc_message_id" text UNIQUE,
	"sent_at" timestamp,
	"source_id" text NOT NULL,
	"subject" text NOT NULL,
	"thread_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_patch_meta" (
	"id" text PRIMARY KEY,
	"message_id" text NOT NULL UNIQUE,
	"patchwork_patch_id" integer,
	"patchwork_project" text,
	"raw" jsonb,
	"series_url" text,
	"state" text
);
--> statement-breakpoint
CREATE TABLE "ml_source" (
	"adapter_type" text NOT NULL,
	"archive_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"display_name" text NOT NULL,
	"feed_url" text,
	"id" text PRIMARY KEY,
	"last_cursor" text,
	"last_sync_error" text,
	"last_synced_at" timestamp,
	"last_sync_status" text,
	"name" text NOT NULL,
	"poll_interval_seconds" integer DEFAULT 3600 NOT NULL,
	"rate_limit_class" text DEFAULT 'normal' NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"supports_patch_meta" boolean DEFAULT false NOT NULL,
	"supports_threading" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"visibility" text DEFAULT 'public' NOT NULL,
	"volume_class" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_thread" (
	"id" text PRIMARY KEY,
	"last_message_at" timestamp,
	"message_count" integer DEFAULT 0 NOT NULL,
	"root_message_id" text,
	"source_id" text NOT NULL,
	"subject" text NOT NULL,
	"subject_key" text NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_user_follow_source" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"source_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_user_follow_thread" (
	"created_at" timestamp DEFAULT now() NOT NULL,
	"id" text PRIMARY KEY,
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ml_user_read_state" (
	"id" text PRIMARY KEY,
	"last_read_at" timestamp,
	"last_read_message_id" text,
	"thread_id" text NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "ml_bookmark_user_thread_unique" ON "ml_bookmark" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "ml_bookmark_user_id_idx" ON "ml_bookmark" ("user_id");--> statement-breakpoint
CREATE INDEX "ml_message_thread_id_sent_at_idx" ON "ml_message" ("thread_id","sent_at");--> statement-breakpoint
CREATE INDEX "ml_message_source_id_idx" ON "ml_message" ("source_id");--> statement-breakpoint
CREATE INDEX "ml_patch_meta_message_id_idx" ON "ml_patch_meta" ("message_id");--> statement-breakpoint
CREATE INDEX "ml_source_adapter_type_idx" ON "ml_source" ("adapter_type");--> statement-breakpoint
CREATE INDEX "ml_source_volume_class_idx" ON "ml_source" ("volume_class");--> statement-breakpoint
CREATE INDEX "ml_thread_source_id_idx" ON "ml_thread" ("source_id");--> statement-breakpoint
CREATE INDEX "ml_thread_last_message_at_idx" ON "ml_thread" ("last_message_at");--> statement-breakpoint
CREATE INDEX "ml_thread_source_subject_key_idx" ON "ml_thread" ("source_id","subject_key");--> statement-breakpoint
CREATE UNIQUE INDEX "ml_user_follow_source_user_source_unique" ON "ml_user_follow_source" ("user_id","source_id");--> statement-breakpoint
CREATE INDEX "ml_user_follow_source_user_id_idx" ON "ml_user_follow_source" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ml_user_follow_thread_user_thread_unique" ON "ml_user_follow_thread" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "ml_user_follow_thread_user_id_idx" ON "ml_user_follow_thread" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ml_user_read_state_user_thread_unique" ON "ml_user_read_state" ("user_id","thread_id");--> statement-breakpoint
CREATE INDEX "ml_user_read_state_user_id_idx" ON "ml_user_read_state" ("user_id");--> statement-breakpoint
ALTER TABLE "ml_bookmark" ADD CONSTRAINT "ml_bookmark_thread_id_ml_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ml_thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_bookmark" ADD CONSTRAINT "ml_bookmark_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_message" ADD CONSTRAINT "ml_message_source_id_ml_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "ml_source"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_message" ADD CONSTRAINT "ml_message_thread_id_ml_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ml_thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_patch_meta" ADD CONSTRAINT "ml_patch_meta_message_id_ml_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "ml_message"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_thread" ADD CONSTRAINT "ml_thread_source_id_ml_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "ml_source"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_user_follow_source" ADD CONSTRAINT "ml_user_follow_source_source_id_ml_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "ml_source"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_user_follow_source" ADD CONSTRAINT "ml_user_follow_source_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_user_follow_thread" ADD CONSTRAINT "ml_user_follow_thread_thread_id_ml_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ml_thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_user_follow_thread" ADD CONSTRAINT "ml_user_follow_thread_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_user_read_state" ADD CONSTRAINT "ml_user_read_state_last_read_message_id_ml_message_id_fkey" FOREIGN KEY ("last_read_message_id") REFERENCES "ml_message"("id") ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE "ml_user_read_state" ADD CONSTRAINT "ml_user_read_state_thread_id_ml_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "ml_thread"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "ml_user_read_state" ADD CONSTRAINT "ml_user_read_state_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;