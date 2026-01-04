CREATE TABLE "guest_registration_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" integer,
	"guest_name" varchar(255) NOT NULL,
	"reg_number" text NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"action" varchar(100) NOT NULL,
	"details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guest_registration_logs" ADD CONSTRAINT "guest_registration_logs_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;