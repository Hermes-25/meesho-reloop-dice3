CREATE TABLE `app_demo_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`owner` text NOT NULL,
	`object_key` text NOT NULL,
	`digest` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_app_demo_photo_space` ON `app_demo_photos` (`space_id`);--> statement-breakpoint
CREATE TABLE `app_demo_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`space_id` text NOT NULL,
	`role` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_app_demo_expiry` ON `app_demo_sessions` (`expires_at`);