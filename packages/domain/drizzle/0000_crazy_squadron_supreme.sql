CREATE TYPE "public"."nationality" AS ENUM('US', '日本');--> statement-breakpoint
CREATE TYPE "public"."transfer_status" AS ENUM('success', 'pending', 'failed');--> statement-breakpoint
CREATE TABLE "transfer_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"status" "transfer_status" DEFAULT 'success' NOT NULL,
	"message" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"balance" numeric(10, 2) DEFAULT '0' NOT NULL,
	"nationality" "nationality" DEFAULT 'US',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "transfer_logs" ADD CONSTRAINT "transfer_logs_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfer_logs" ADD CONSTRAINT "transfer_logs_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sender_idx" ON "transfer_logs" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "receiver_idx" ON "transfer_logs" USING btree ("receiver_id");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "transfer_logs" USING btree ("created_at");