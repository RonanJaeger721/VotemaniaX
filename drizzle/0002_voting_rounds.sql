CREATE TABLE `voting_rounds` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` integer NOT NULL,
  `name` text NOT NULL,
  `week_number` integer NOT NULL,
  `slug` text NOT NULL,
  `public_token` text NOT NULL,
  `start_at` integer NOT NULL,
  `end_at` integer NOT NULL,
  `status` text DEFAULT 'draft' NOT NULL,
  `created_by` text NOT NULL,
  `created_at` integer NOT NULL,
  `published_at` integer,
  `closed_at` integer,
  FOREIGN KEY (`event_id`) REFERENCES `events`(`id`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `voting_rounds_slug_unique` ON `voting_rounds` (`slug`);
--> statement-breakpoint
CREATE UNIQUE INDEX `voting_rounds_public_token_unique` ON `voting_rounds` (`public_token`);
--> statement-breakpoint
ALTER TABLE `payments` ADD `round_id` integer REFERENCES `voting_rounds`(`id`);
--> statement-breakpoint
ALTER TABLE `votes` ADD `round_id` integer REFERENCES `voting_rounds`(`id`);
