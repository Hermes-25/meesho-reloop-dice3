ALTER TABLE `review_comments` ADD `parent_id` text REFERENCES review_comments(id);--> statement-breakpoint
ALTER TABLE `review_comments` ADD `thread_id` text REFERENCES review_comments(id);--> statement-breakpoint
CREATE INDEX `idx_comments_thread_created` ON `review_comments` (`thread_id`,`created_at`);