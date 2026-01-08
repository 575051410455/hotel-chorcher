CREATE TABLE "guests" (
	"id" serial PRIMARY KEY NOT NULL,
	"reg_number" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"flight_number" text,
	"guest2_first_name" text,
	"guest2_last_name" text,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"checked_in" boolean DEFAULT false NOT NULL,
	CONSTRAINT "guests_reg_number_unique" UNIQUE("reg_number")
);
