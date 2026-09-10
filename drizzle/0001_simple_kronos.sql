ALTER TABLE `session_codes` ADD `display_code` text DEFAULT '' NOT NULL;
--> statement-breakpoint
PRAGMA optimize;
