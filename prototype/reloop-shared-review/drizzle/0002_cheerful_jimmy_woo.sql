CREATE TABLE `demo_captures` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `demo_rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `demo_events` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`version` integer NOT NULL,
	`actor` text NOT NULL,
	`state` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `demo_rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_demo_events_room_version` ON `demo_events` (`room_id`,`version`);--> statement-breakpoint
CREATE TABLE `demo_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text NOT NULL,
	`slot` integer NOT NULL,
	`object_key` text NOT NULL,
	`mime` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`room_id`) REFERENCES `demo_rooms`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_demo_photos_room_slot` ON `demo_photos` (`room_id`,`slot`,`created_at`);--> statement-breakpoint
CREATE TABLE `demo_rooms` (
	`id` text PRIMARY KEY NOT NULL,
	`key_hash` text NOT NULL,
	`state` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`rate_key` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_demo_rooms_rate_created` ON `demo_rooms` (`rate_key`,`created_at`);