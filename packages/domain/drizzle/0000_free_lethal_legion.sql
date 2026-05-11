CREATE TABLE `customer` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`name` varchar(100) NOT NULL,
	`started_date` date NOT NULL,
	`position_id` smallint NOT NULL,
	`created_date` date NOT NULL DEFAULT (CURRENT_DATE),
	`updated_date` date NOT NULL DEFAULT (CURRENT_DATE),
	`deleted_date` date,
	CONSTRAINT `customer_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order` (
	`order_id` bigint AUTO_INCREMENT NOT NULL,
	`item_name` varchar(15) NOT NULL,
	`item_code` varchar(7),
	`item_quantity` int NOT NULL,
	`customer_id` bigint NOT NULL,
	`created_date` date NOT NULL DEFAULT (CURRENT_DATE),
	`updated_date` date NOT NULL DEFAULT (CURRENT_DATE),
	`deleted_date` date,
	CONSTRAINT `order_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
ALTER TABLE `order` ADD CONSTRAINT `order_customer_id_customer_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customer`(`id`) ON DELETE restrict ON UPDATE restrict;