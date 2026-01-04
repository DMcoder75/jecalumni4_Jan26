ALTER TABLE `users` ADD `firstName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `lastName` text;--> statement-breakpoint
ALTER TABLE `users` ADD `description` text;--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false;