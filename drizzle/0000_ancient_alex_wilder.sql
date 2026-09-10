CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`session_id` text NOT NULL,
	`points` integer NOT NULL,
	`verified_at` integer NOT NULL,
	`source` text DEFAULT 'code' NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_attendance_unique` ON `attendance` (`participant_id`,`session_id`);--> statement-breakpoint
CREATE INDEX `idx_attendance_session` ON `attendance` (`session_id`);--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`detail_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_logs_entity` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_time` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE TABLE `code_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`session_id` text NOT NULL,
	`attempted_at` integer NOT NULL,
	`success` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_code_attempts_rate` ON `code_attempts` (`participant_id`,`attempted_at`);--> statement-breakpoint
CREATE TABLE `draw_participants` (
	`draw_id` text NOT NULL,
	`participant_id` text NOT NULL,
	FOREIGN KEY (`draw_id`) REFERENCES `draws`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_draw_participants_unique` ON `draw_participants` (`draw_id`,`participant_id`);--> statement-breakpoint
CREATE TABLE `draws` (
	`id` text PRIMARY KEY NOT NULL,
	`prize` text NOT NULL,
	`winner_participant_id` text,
	`eligible_json` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`winner_participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`session_id` text NOT NULL,
	`rating` integer NOT NULL,
	`relevance` integer NOT NULL,
	`takeaway` text,
	`points` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_feedback_unique` ON `feedback` (`participant_id`,`session_id`);--> statement-breakpoint
CREATE INDEX `idx_feedback_session` ON `feedback` (`session_id`);--> statement-breakpoint
CREATE TABLE `participant_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`participant_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_participant_sessions_participant` ON `participant_sessions` (`participant_id`);--> statement-breakpoint
CREATE TABLE `participants` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`mobile` text NOT NULL,
	`company` text NOT NULL,
	`designation` text,
	`email` text,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_participants_mobile` ON `participants` (`mobile`);--> statement-breakpoint
CREATE INDEX `idx_participants_name_company` ON `participants` (`full_name`,`company`);--> statement-breakpoint
CREATE TABLE `quiz_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`quiz_id` text NOT NULL,
	`prompt` text NOT NULL,
	`options_json` text NOT NULL,
	`correct_index` integer NOT NULL,
	`points` integer DEFAULT 10 NOT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quiz_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`participant_id` text NOT NULL,
	`answer_index` integer NOT NULL,
	`correct` integer NOT NULL,
	`points` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `quiz_questions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_quiz_response_unique` ON `quiz_responses` (`question_id`,`participant_id`);--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`title` text NOT NULL,
	`time_limit_seconds` integer DEFAULT 60 NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `scores` (
	`participant_id` text PRIMARY KEY NOT NULL,
	`attendance_points` integer DEFAULT 0 NOT NULL,
	`feedback_points` integer DEFAULT 0 NOT NULL,
	`quiz_points` integer DEFAULT 0 NOT NULL,
	`total_points` integer DEFAULT 0 NOT NULL,
	`sessions_attended` integer DEFAULT 0 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`participant_id`) REFERENCES `participants`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_scores_leaderboard` ON `scores` (`total_points`);--> statement-breakpoint
CREATE TABLE `session_codes` (
	`id` text PRIMARY KEY NOT NULL,
	`session_id` text NOT NULL,
	`code_hash` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`revoked_at` integer,
	FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_session_codes_active` ON `session_codes` (`session_id`,`expires_at`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`session_number` integer NOT NULL,
	`name` text NOT NULL,
	`speaker` text NOT NULL,
	`description` text,
	`starts_at` integer NOT NULL,
	`ends_at` integer NOT NULL,
	`status` text DEFAULT 'UPCOMING' NOT NULL,
	`attendance_open` integer DEFAULT false NOT NULL,
	`feedback_open` integer DEFAULT false NOT NULL,
	`quiz_open` integer DEFAULT false NOT NULL,
	`attendance_points` integer DEFAULT 10 NOT NULL,
	`feedback_points` integer DEFAULT 5 NOT NULL,
	`quiz_points` integer DEFAULT 10 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_sessions_number` ON `sessions` (`session_number`);--> statement-breakpoint
CREATE INDEX `idx_sessions_status` ON `sessions` (`status`);