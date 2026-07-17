--1. users table (Auth)
CREATE TABLE "users" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    useName TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- TODO: add timestamp for waiting, interviewing and offers.
                  
CREATE TABLE "Jobs" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'applied',
    source TEXT,
    notes TEXT,
    applied_at TIMESTAMP,
    interviewing_at TIMESTAMP, 
    offers_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    role TEXT,  
    website TEXT,
    location TEXT,
    user_id UUID,
    salary TEXT,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT Jobs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);


