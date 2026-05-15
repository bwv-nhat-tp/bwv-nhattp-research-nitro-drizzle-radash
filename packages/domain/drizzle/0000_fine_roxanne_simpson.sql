CREATE TABLE `transfer_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sender_id` int NOT NULL,
	`receiver_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`status` enum('success','pending','failed') NOT NULL DEFAULT 'success',
	`message` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transfer_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`name` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`balance` decimal(10,2) NOT NULL DEFAULT '0',
	`nationality` enum('US','日本') DEFAULT 'US',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `transfer_logs` ADD CONSTRAINT `transfer_logs_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transfer_logs` ADD CONSTRAINT `transfer_logs_receiver_id_users_id_fk` FOREIGN KEY (`receiver_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sender_idx` ON `transfer_logs` (`sender_id`);--> statement-breakpoint
CREATE INDEX `receiver_idx` ON `transfer_logs` (`receiver_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `transfer_logs` (`created_at`);