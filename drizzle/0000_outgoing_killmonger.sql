CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`page` text NOT NULL,
	`product` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`country` text NOT NULL,
	`product` text NOT NULL,
	`quantity` text NOT NULL,
	`packaging` text NOT NULL,
	`customization` text NOT NULL,
	`timeline` text NOT NULL,
	`message` text NOT NULL,
	`source` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`is_test` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `inquiries_reference_unique` ON `inquiries` (`reference`);