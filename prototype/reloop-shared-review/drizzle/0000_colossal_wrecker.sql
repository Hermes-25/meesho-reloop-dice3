CREATE TABLE `review_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`screen` text NOT NULL,
	`name` text NOT NULL,
	`body` text NOT NULL,
	`context` text NOT NULL,
	`created_at` integer NOT NULL,
	`rate_key` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_comments_screen_created` ON `review_comments` (`screen`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_rate_created` ON `review_comments` (`rate_key`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_comments_created` ON `review_comments` (`created_at`);