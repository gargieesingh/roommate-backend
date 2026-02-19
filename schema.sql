--
-- PostgreSQL database dump
--

\restrict 2VMOaqwQzmBkPgRVole369p6SNmZAojjKZNG11gSSRrnMI0PG2koJr9ZWcPPQHa

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-02-19 18:11:44

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 26739)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 885 (class 1247 OID 26802)
-- Name: Cleanliness; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Cleanliness" AS ENUM (
    'VERY_CLEAN',
    'MODERATELY_CLEAN',
    'RELAXED'
);


ALTER TYPE public."Cleanliness" OWNER TO postgres;

--
-- TOC entry 876 (class 1247 OID 26776)
-- Name: DrinkingPreference; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."DrinkingPreference" AS ENUM (
    'YES',
    'NO',
    'OCCASIONALLY',
    'SOCIALLY'
);


ALTER TYPE public."DrinkingPreference" OWNER TO postgres;

--
-- TOC entry 903 (class 1247 OID 26856)
-- Name: FurnishedStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."FurnishedStatus" AS ENUM (
    'FULLY_FURNISHED',
    'SEMI_FURNISHED',
    'UNFURNISHED'
);


ALTER TYPE public."FurnishedStatus" OWNER TO postgres;

--
-- TOC entry 870 (class 1247 OID 26758)
-- Name: Gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'NON_BINARY',
    'PREFER_NOT_TO_SAY'
);


ALTER TYPE public."Gender" OWNER TO postgres;

--
-- TOC entry 906 (class 1247 OID 26864)
-- Name: GenderPreference; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."GenderPreference" AS ENUM (
    'MALE',
    'FEMALE',
    'ANY'
);


ALTER TYPE public."GenderPreference" OWNER TO postgres;

--
-- TOC entry 897 (class 1247 OID 26838)
-- Name: ListingType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ListingType" AS ENUM (
    'HAVE_ROOM',
    'NEED_ROOM'
);


ALTER TYPE public."ListingType" OWNER TO postgres;

--
-- TOC entry 894 (class 1247 OID 26824)
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."NotificationType" AS ENUM (
    'TEAM_INVITE',
    'TEAM_JOIN_REQUEST',
    'TEAM_MEMBER_ACCEPTED',
    'NEW_MESSAGE',
    'LISTING_INQUIRY',
    'REVIEW_RECEIVED'
);


ALTER TYPE public."NotificationType" OWNER TO postgres;

--
-- TOC entry 879 (class 1247 OID 26786)
-- Name: PetsPreference; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PetsPreference" AS ENUM (
    'HAS_PETS',
    'NO_PETS',
    'OPEN_TO_PETS'
);


ALTER TYPE public."PetsPreference" OWNER TO postgres;

--
-- TOC entry 900 (class 1247 OID 26844)
-- Name: PropertyType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PropertyType" AS ENUM (
    'APARTMENT',
    'HOUSE',
    'STUDIO',
    'SHARED_ROOM',
    'PRIVATE_ROOM'
);


ALTER TYPE public."PropertyType" OWNER TO postgres;

--
-- TOC entry 909 (class 1247 OID 26872)
-- Name: ReportReason; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportReason" AS ENUM (
    'SPAM',
    'INAPPROPRIATE_CONTENT',
    'FAKE_LISTING',
    'SCAM',
    'HARASSMENT',
    'OTHER'
);


ALTER TYPE public."ReportReason" OWNER TO postgres;

--
-- TOC entry 912 (class 1247 OID 26886)
-- Name: ReportStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ReportStatus" AS ENUM (
    'PENDING',
    'REVIEWED',
    'RESOLVED',
    'DISMISSED'
);


ALTER TYPE public."ReportStatus" OWNER TO postgres;

--
-- TOC entry 882 (class 1247 OID 26794)
-- Name: SleepSchedule; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SleepSchedule" AS ENUM (
    'EARLY_BIRD',
    'NIGHT_OWL',
    'FLEXIBLE'
);


ALTER TYPE public."SleepSchedule" OWNER TO postgres;

--
-- TOC entry 873 (class 1247 OID 26768)
-- Name: SmokingPreference; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."SmokingPreference" AS ENUM (
    'YES',
    'NO',
    'OCCASIONALLY'
);


ALTER TYPE public."SmokingPreference" OWNER TO postgres;

--
-- TOC entry 891 (class 1247 OID 26816)
-- Name: TeamMemberStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TeamMemberStatus" AS ENUM (
    'PENDING',
    'ACCEPTED',
    'REJECTED'
);


ALTER TYPE public."TeamMemberStatus" OWNER TO postgres;

--
-- TOC entry 888 (class 1247 OID 26810)
-- Name: TeamRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TeamRole" AS ENUM (
    'LEADER',
    'MEMBER'
);


ALTER TYPE public."TeamRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 26740)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 29065)
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_notifications (
    id text NOT NULL,
    admin_id text NOT NULL,
    title character varying(100) NOT NULL,
    message character varying(1000) NOT NULL,
    target_type text NOT NULL,
    recipient_ids jsonb,
    channel text NOT NULL,
    scheduled_for timestamp(3) without time zone,
    sent_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_notifications OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 29051)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id text NOT NULL,
    admin_id text NOT NULL,
    action_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    details jsonb,
    ip_address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 26981)
-- Name: blocks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blocks (
    id text NOT NULL,
    blocker_id text NOT NULL,
    blocked_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.blocks OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 26953)
-- Name: conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conversations (
    id text NOT NULL,
    user1_id text NOT NULL,
    user2_id text NOT NULL,
    listing_id text,
    team_id text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.conversations OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 27008)
-- Name: favorites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorites (
    id text NOT NULL,
    user_id text NOT NULL,
    listing_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.favorites OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 26928)
-- Name: listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listings (
    id text NOT NULL,
    user_id text NOT NULL,
    type public."ListingType" NOT NULL,
    title character varying(100) NOT NULL,
    description character varying(1000) NOT NULL,
    rent integer NOT NULL,
    deposit integer NOT NULL,
    currency text DEFAULT 'INR'::text NOT NULL,
    city text NOT NULL,
    area text,
    address text,
    latitude double precision,
    longitude double precision,
    "propertyType" public."PropertyType",
    "furnishedStatus" public."FurnishedStatus",
    bathrooms integer,
    amenities text[],
    "genderPreference" public."GenderPreference",
    "occupationPreference" text[],
    "smokingAllowed" boolean,
    "petsAllowed" boolean,
    "availableFrom" timestamp(3) without time zone NOT NULL,
    "availableUntil" timestamp(3) without time zone,
    photos text[],
    is_active boolean DEFAULT true NOT NULL,
    view_count integer DEFAULT 0 NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    age_range_max integer,
    age_range_min integer,
    house_rules text[],
    "leaseLength" integer,
    "roomType" text,
    state text,
    "utilitiesIncluded" boolean DEFAULT false NOT NULL,
    "zipCode" text,
    flag_reason text,
    is_flagged boolean DEFAULT false NOT NULL
);


ALTER TABLE public.listings OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 26966)
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id text NOT NULL,
    conversation_id text NOT NULL,
    sender_id text NOT NULL,
    content character varying(1000) NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    read_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 27065)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    type public."NotificationType" NOT NULL,
    title character varying(100) NOT NULL,
    message character varying(500) NOT NULL,
    related_user_id text,
    related_team_id text,
    related_listing_id text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 29080)
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.platform_settings (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.platform_settings OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 26915)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_tokens (
    id text NOT NULL,
    user_id text NOT NULL,
    token text NOT NULL,
    expires_at timestamp(3) without time zone NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.refresh_tokens OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 26993)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id text NOT NULL,
    reporter_id text NOT NULL,
    reported_user_id text,
    reported_listing_id text,
    reason public."ReportReason" NOT NULL,
    description character varying(500),
    status public."ReportStatus" DEFAULT 'PENDING'::public."ReportStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 27052)
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id text NOT NULL,
    reviewer_id text NOT NULL,
    reviewed_id text NOT NULL,
    rating integer NOT NULL,
    comment character varying(500),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL
);


ALTER TABLE public.reviews OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 27036)
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id text NOT NULL,
    team_id text NOT NULL,
    user_id text NOT NULL,
    role public."TeamRole" NOT NULL,
    status public."TeamMemberStatus" DEFAULT 'PENDING'::public."TeamMemberStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 27020)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id text NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    budget_min integer,
    budget_max integer,
    city text,
    max_members integer DEFAULT 4 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 26895)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    phone text,
    password_hash text,
    google_id text,
    auth_provider text DEFAULT 'email'::text NOT NULL,
    first_name text,
    last_name text,
    age integer,
    gender public."Gender",
    city text,
    bio character varying(500),
    occupation text,
    smoking_preference public."SmokingPreference",
    drinking_preference public."DrinkingPreference",
    pets_preference public."PetsPreference",
    sleep_schedule public."SleepSchedule",
    cleanliness public."Cleanliness",
    budget_min integer,
    budget_max integer,
    preferred_radius integer,
    interests text[],
    languages text[],
    profile_photo text,
    additional_photos text[],
    email_verified boolean DEFAULT false NOT NULL,
    phone_verified boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    last_login_at timestamp(3) without time zone,
    is_looking boolean DEFAULT true NOT NULL,
    admin_notes text,
    ban_reason text,
    is_admin boolean DEFAULT false NOT NULL,
    is_banned boolean DEFAULT false NOT NULL,
    suspended_until timestamp(3) without time zone,
    suspension_reason text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 5232 (class 0 OID 26740)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
25796f09-0f25-4800-aec3-b7eeb6c388ab	b64c0b63bb0a09d098b2728b98849d85228a30122f8d1f460cb42a68d4ddc6b6	2026-02-16 15:31:21.692311+05:30	20260216100058_add_oauth_support	\N	\N	2026-02-16 15:31:21.521989+05:30	1
\.


--
-- TOC entry 5246 (class 0 OID 29065)
-- Dependencies: 233
-- Data for Name: admin_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_notifications (id, admin_id, title, message, target_type, recipient_ids, channel, scheduled_for, sent_at, created_at) FROM stdin;
\.


--
-- TOC entry 5245 (class 0 OID 29051)
-- Dependencies: 232
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, admin_id, action_type, entity_type, entity_id, details, ip_address, created_at) FROM stdin;
\.


--
-- TOC entry 5238 (class 0 OID 26981)
-- Dependencies: 225
-- Data for Name: blocks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.blocks (id, blocker_id, blocked_id, created_at) FROM stdin;
\.


--
-- TOC entry 5236 (class 0 OID 26953)
-- Dependencies: 223
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conversations (id, user1_id, user2_id, listing_id, team_id, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5240 (class 0 OID 27008)
-- Dependencies: 227
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.favorites (id, user_id, listing_id, created_at) FROM stdin;
\.


--
-- TOC entry 5235 (class 0 OID 26928)
-- Dependencies: 222
-- Data for Name: listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listings (id, user_id, type, title, description, rent, deposit, currency, city, area, address, latitude, longitude, "propertyType", "furnishedStatus", bathrooms, amenities, "genderPreference", "occupationPreference", "smokingAllowed", "petsAllowed", "availableFrom", "availableUntil", photos, is_active, view_count, created_at, updated_at, age_range_max, age_range_min, house_rules, "leaseLength", "roomType", state, "utilitiesIncluded", "zipCode", flag_reason, is_flagged) FROM stdin;
f79796e2-162e-4e39-ba89-773358c9aded	8dc95987-583f-4a9a-a98d-789faa9c7441	HAVE_ROOM	third room	very clean and nice room for work and personal space	130	0	INR	Rohtak	\N	Rohtak	\N	\N	SHARED_ROOM	\N	\N	{furnished,wifi,near_subway}	ANY	{}	f	f	2026-02-19 12:16:43.774	\N	{}	t	8	2026-02-19 12:17:52.459	2026-02-19 12:26:52.13	65	18	{}	12	shared	Haryana	f	124003	\N	f
c90017c9-0a25-4c5c-847e-7660969f75f3	8dc95987-583f-4a9a-a98d-789faa9c7441	HAVE_ROOM	Mast room hai re baba	nice and cozy room with nice ventilation and study area	150	0	INR	Rohtak	\N	Rohtak	\N	\N	PRIVATE_ROOM	\N	\N	{furnished,wifi,near_subway}	ANY	{}	f	f	2026-02-19 12:05:12.483	\N	{}	t	2	2026-02-19 12:06:26.66	2026-02-19 12:27:21.519	65	18	{}	3	private	Haryana	f	124003	\N	f
af56642e-158a-42cf-8694-c54ef2fab9c5	8dc95987-583f-4a9a-a98d-789faa9c7441	HAVE_ROOM	second room	nice and cozy apartment , for better personal space and work	129	0	INR	Jamui	\N	Jamui	\N	\N	SHARED_ROOM	\N	\N	{closet,natural_light,parking,doorman,restaurants,grocery}	ANY	{}	f	f	2026-02-19 11:29:12.311	\N	{}	t	6	2026-02-19 11:30:32.612	2026-02-19 12:23:11.114	65	18	{}	3	shared	Bihar	f	198888	\N	f
fae84c76-ff03-45bf-8cf3-24a1d08fa95e	8dc95987-583f-4a9a-a98d-789faa9c7441	HAVE_ROOM	cozyyyyyyyyyyyy room	aaaaaaaaaaaaaaaaaaaahhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh	1200	0	INR	Jamui	\N	Jamui	\N	\N	PRIVATE_ROOM	\N	\N	{furnished,natural_light,wifi,elevator,near_subway,restaurants,safe_area}	MALE	{professional}	f	f	2026-02-19 11:22:21.74	\N	{}	t	0	2026-02-19 11:28:34.497	2026-02-19 12:23:11.119	35	18	{}	12	private	Bihar	f	124003	\N	f
637a21e4-a196-41cb-b646-2bbe0c229afc	8dc95987-583f-4a9a-a98d-789faa9c7441	HAVE_ROOM	rrrrrrrrrr	rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr	1200	0	INR	Rohtak	\N	Rohtak	\N	\N	PRIVATE_ROOM	\N	\N	{furnished,wifi,near_subway}	MALE	{freelancer}	f	f	2026-02-17 17:50:45.553	\N	{https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800}	t	0	2026-02-17 17:56:59.388	2026-02-19 12:14:43.883	39	18	{}	1	private	Haryana	f	124001	\N	f
\.


--
-- TOC entry 5237 (class 0 OID 26966)
-- Dependencies: 224
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, conversation_id, sender_id, content, is_read, read_at, created_at) FROM stdin;
\.


--
-- TOC entry 5244 (class 0 OID 27065)
-- Dependencies: 231
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, type, title, message, related_user_id, related_team_id, related_listing_id, is_read, created_at) FROM stdin;
\.


--
-- TOC entry 5247 (class 0 OID 29080)
-- Dependencies: 234
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.platform_settings (id, key, value, description, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5234 (class 0 OID 26915)
-- Dependencies: 221
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
b6c53801-3417-43db-8119-a35b4e13f7ea	a4f4ec4c-dcf8-4e79-a940-ea91b5dce96a	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhNGY0ZWM0Yy1kY2Y4LTRlNzktYTk0MC1lYTkxYjVkY2U5NmEiLCJlbWFpbCI6InNnLmdhcmcwMjFAZ21haWwuY29tIiwianRpIjoiYjgzMTcyOGItOTlkOS00NTU5LWI5YTYtZDk5YzZhYjgyODVkIiwiaWF0IjoxNzcxMjM5MzMzLCJleHAiOjE3NzM4MzEzMzN9.c_8Vq4H3UClqd8hGev3Oh89WT8x_Eja90BFUtYBkOgw	2026-03-18 10:55:33.66	2026-02-16 10:55:33.663
9ccc73fc-5525-4bd7-b737-c059f0ce04c7	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjQ0MTYwZGFhLTZjYWQtNGRlYS05OWFkLTBlNjM1MjBiYzg1MiIsImlhdCI6MTc3MTI2Mjg5NiwiZXhwIjoxNzczODU0ODk2fQ.61plfQUwkT3EUlcsz9w1GR6sPkZdcuWvsaCn7bkx3gQ	2026-03-18 17:28:16.348	2026-02-16 17:28:16.35
506d75ec-a59f-452d-a1bf-941ac3b69553	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6ImViZDZiMzUxLWNhYzktNGU5MC05ZmU4LWEzMGY4NGNhYmM5NiIsImlhdCI6MTc3MTMwMjQ4NSwiZXhwIjoxNzczODk0NDg1fQ.UkESVDGIZjbeS8koHm4PtZWPY51ATd-1jG0M4E16OjQ	2026-03-19 04:28:05.709	2026-02-17 04:28:05.711
f0a5c8d1-f30d-40aa-aab3-99450b692dab	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjRlZTVjOTYwLTU2NjQtNDZjMC04ZjJkLWEwZmE2MThhYjVhNyIsImlhdCI6MTc3MTMwMjg4MCwiZXhwIjoxNzczODk0ODgwfQ.JgJRuVNeshH7dq_x7Ej2Zi5hSD2mZZW5PW3Wq_i4SEI	2026-03-19 04:34:40.431	2026-02-17 04:34:40.433
894143c8-e1ba-474e-a68f-1576a28d2c59	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjBlMTA2NTVkLWNhOWItNGVkNS1hZjg1LWY5OWM5MDAxMjJiNiIsImlhdCI6MTc3MTMwNDMxMSwiZXhwIjoxNzczODk2MzExfQ.yXmG3sq9maJQobBNxqcAov02d_SyYt4Su7_adepdFb0	2026-03-19 04:58:31.482	2026-02-17 04:58:31.484
01d47486-c46f-4566-a36b-55177259ae24	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6ImJjNGNkYjNhLTMxMDMtNDY2MS05MGQyLWM0YzhlNDUwYWExMSIsImlhdCI6MTc3MTMwNDU5MywiZXhwIjoxNzczODk2NTkzfQ.icWwJyTSxyIAQs3RGktlo1k3jIh_7B4DI-6Qi0hFx1I	2026-03-19 05:03:13.043	2026-02-17 05:03:13.045
74d793a4-d759-426c-8847-a59f2e2c6a4d	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6ImQwODM3YmQzLWM2OTEtNGIzOS05ZmY4LWU2NTU3ZGQ1NDMyOSIsImlhdCI6MTc3MTMwNTg5NywiZXhwIjoxNzczODk3ODk3fQ.uyTCUCIoiUx4qwCAzSiZogPsKJnD4PJzgXHbmlwdGEE	2026-03-19 05:24:57.053	2026-02-17 05:24:57.059
3dd78933-51bd-4269-8c66-2e249ba14017	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjM3N2UxNzA1LWY5MWUtNDUwNC1iZTkyLTg1OGVkMGUxMDQ1ZCIsImlhdCI6MTc3MTMwNjk1OSwiZXhwIjoxNzczODk4OTU5fQ.cwnzE1x7UA0IhI9loOaQCwStQGem1BCxXX3j5eDcHLg	2026-03-19 05:42:39.772	2026-02-17 05:42:39.773
a6d1c617-245c-4d59-b704-ba6bf9f9c819	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjRmMzQxYjViLTIxMGMtNDYzNi1hNTc3LTliMTRlZTdjMmM2YSIsImlhdCI6MTc3MTMwNzQ2MywiZXhwIjoxNzczODk5NDYzfQ.gtjoU8QWOm0UDjEntCskzGlYEYK99GkaqhEkigoc2Qg	2026-03-19 05:51:03.617	2026-02-17 05:51:03.62
0b08fed9-369a-401c-9d41-87a8b7dbe685	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjQ2MmI2ZmU2LTk4MGYtNGI4Yi1iZTNiLTM5NmMxNmUyNDY2OCIsImlhdCI6MTc3MTMwNzQ5MCwiZXhwIjoxNzczODk5NDkwfQ.rxnsIxymbrlgu_4ozA5KdPM7gZdnfzFF-l_Fka0S6Uo	2026-03-19 05:51:30.458	2026-02-17 05:51:30.46
ec64cfdc-9970-4bf8-9003-c1a0ddcf272e	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjgxN2FjOTZhLWU5NTItNGUyMy04OTYwLWZlOTQ0N2MwN2Y3MyIsImlhdCI6MTc3MTMwNzUxMywiZXhwIjoxNzczODk5NTEzfQ.dNVUr7_r5bhyH6aT0Az8p7CAnp858b4m1RZshyYnS2s	2026-03-19 05:51:53.901	2026-02-17 05:51:53.903
d13f5e60-6221-4685-8a4c-52ab6834077c	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjQ5OGU3ZThhLTRkMDAtNDAwZi05YTcyLTNiZDA0OWYzZmQ5NiIsImlhdCI6MTc3MTMwODE4NywiZXhwIjoxNzczOTAwMTg3fQ.7DSJjFD-BG9SPmijg5qwh3aVvHG5hODHOI_sJf8Imz0	2026-03-19 06:03:07.335	2026-02-17 06:03:07.336
25e5ce9e-e6ce-4b93-a18c-ea5145cb4476	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjBhMTQyOGFjLTEyZjYtNGE0ZS1iYzc3LTQyMjgzOGE5YmVlNSIsImlhdCI6MTc3MTMwODM5MCwiZXhwIjoxNzczOTAwMzkwfQ.AJXeD1aaEVaF6pYcHYPJVkpCtSYkLlwW09h99vthROc	2026-03-19 06:06:30.284	2026-02-17 06:06:30.287
ddd15f68-9f8d-46fd-a14a-0647ce74d895	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6ImVlMDViNDU5LTZkNTItNGY2ZC04NDRlLTMxYmQ3NjllZjI0ZSIsImlhdCI6MTc3MTMwODU3OCwiZXhwIjoxNzczOTAwNTc4fQ.7CdfvgSSejXGmEzd0ifdZsnMpuWI7pHT-dMarlXEdwU	2026-03-19 06:09:38.829	2026-02-17 06:09:38.831
59acb420-a340-441a-965a-4a76ef31eb24	8dc95987-583f-4a9a-a98d-789faa9c7441	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI4ZGM5NTk4Ny01ODNmLTRhOWEtYTk4ZC03ODlmYWE5Yzc0NDEiLCJlbWFpbCI6ImdhcmdpZXNpbmdoMzIxQGdtYWlsLmNvbSIsImp0aSI6IjU3YmQxZmQ0LTA2NTQtNDcyNS1hNzAzLTgxMDY5YjUyMTEyZCIsImlhdCI6MTc3MTMxMDMwNiwiZXhwIjoxNzczOTAyMzA2fQ.uleOGrPrvVahaGMxkMah-orD5TFVQqcweiml8zdjRfE	2026-03-19 06:38:26.841	2026-02-17 06:38:26.843
\.


--
-- TOC entry 5239 (class 0 OID 26993)
-- Dependencies: 226
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reports (id, reporter_id, reported_user_id, reported_listing_id, reason, description, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5243 (class 0 OID 27052)
-- Dependencies: 230
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reviews (id, reviewer_id, reviewed_id, rating, comment, created_at, is_hidden) FROM stdin;
\.


--
-- TOC entry 5242 (class 0 OID 27036)
-- Dependencies: 229
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, team_id, user_id, role, status, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5241 (class 0 OID 27020)
-- Dependencies: 228
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, name, description, budget_min, budget_max, city, max_members, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5233 (class 0 OID 26895)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, phone, password_hash, google_id, auth_provider, first_name, last_name, age, gender, city, bio, occupation, smoking_preference, drinking_preference, pets_preference, sleep_schedule, cleanliness, budget_min, budget_max, preferred_radius, interests, languages, profile_photo, additional_photos, email_verified, phone_verified, is_active, created_at, updated_at, last_login_at, is_looking, admin_notes, ban_reason, is_admin, is_banned, suspended_until, suspension_reason) FROM stdin;
a4f4ec4c-dcf8-4e79-a940-ea91b5dce96a	sg.garg021@gmail.com	\N	\N	107245268906629839215	google	Gargie	Singh	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocJGKTam6H62Oh1cc1FFbw1vI0PNmCSOVoYTFyutaaP7VHQo8YdF=s96-c	\N	t	f	t	2026-02-16 10:07:28.705	2026-02-16 10:55:33.617	2026-02-16 10:55:33.615	t	\N	\N	f	f	\N	\N
4a977ca7-6c5c-4299-add1-3bb6386b75f0	singhgargie94@gmail.com	\N	\N	116125160521513042899	google	038 Gargie	Singh	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocJqB_XlNz7M25QVBb6ApDAnbK0JJbW0r1DbYP8oa2B23Aj7LeWmDA=s96-c	\N	t	f	t	2026-02-16 13:32:01.833	2026-02-16 13:32:01.833	2026-02-16 13:32:01.828	t	\N	\N	f	f	\N	\N
8dc95987-583f-4a9a-a98d-789faa9c7441	gargiesingh321@gmail.com	\N	\N	118255281567548083718	google	Gargie	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	https://lh3.googleusercontent.com/a/ACg8ocK9nodFrYOuLR_AUFAGGV8g1jCvwROXPzRVnShwClG57x40QvY=s96-c	\N	t	f	t	2026-02-16 10:05:27.781	2026-02-17 06:38:26.808	2026-02-17 06:38:26.805	t	\N	\N	f	f	\N	\N
\.


--
-- TOC entry 4997 (class 2606 OID 26753)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 5061 (class 2606 OID 29079)
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5058 (class 2606 OID 29064)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 5025 (class 2606 OID 26992)
-- Name: blocks blocks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_pkey PRIMARY KEY (id);


--
-- TOC entry 5013 (class 2606 OID 26965)
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 5034 (class 2606 OID 27019)
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- TOC entry 5009 (class 2606 OID 26952)
-- Name: listings listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_pkey PRIMARY KEY (id);


--
-- TOC entry 5019 (class 2606 OID 26980)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- TOC entry 5052 (class 2606 OID 27080)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 5064 (class 2606 OID 29092)
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 5004 (class 2606 OID 26927)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 5027 (class 2606 OID 27007)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 5048 (class 2606 OID 27064)
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- TOC entry 5042 (class 2606 OID 27051)
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_pkey PRIMARY KEY (id);


--
-- TOC entry 5040 (class 2606 OID 27035)
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- TOC entry 5002 (class 2606 OID 26914)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5059 (class 1259 OID 29096)
-- Name: admin_notifications_admin_id_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX admin_notifications_admin_id_created_at_idx ON public.admin_notifications USING btree (admin_id, created_at);


--
-- TOC entry 5054 (class 1259 OID 29095)
-- Name: audit_logs_action_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_action_type_idx ON public.audit_logs USING btree (action_type);


--
-- TOC entry 5055 (class 1259 OID 29093)
-- Name: audit_logs_admin_id_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_admin_id_created_at_idx ON public.audit_logs USING btree (admin_id, created_at);


--
-- TOC entry 5056 (class 1259 OID 29094)
-- Name: audit_logs_entity_type_entity_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_type_entity_id_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- TOC entry 5021 (class 1259 OID 27095)
-- Name: blocks_blocked_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blocks_blocked_id_idx ON public.blocks USING btree (blocked_id);


--
-- TOC entry 5022 (class 1259 OID 27096)
-- Name: blocks_blocker_id_blocked_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX blocks_blocker_id_blocked_id_key ON public.blocks USING btree (blocker_id, blocked_id);


--
-- TOC entry 5023 (class 1259 OID 27094)
-- Name: blocks_blocker_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX blocks_blocker_id_idx ON public.blocks USING btree (blocker_id);


--
-- TOC entry 5014 (class 1259 OID 27089)
-- Name: conversations_user1_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_user1_id_idx ON public.conversations USING btree (user1_id);


--
-- TOC entry 5015 (class 1259 OID 27091)
-- Name: conversations_user1_id_user2_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX conversations_user1_id_user2_id_key ON public.conversations USING btree (user1_id, user2_id);


--
-- TOC entry 5016 (class 1259 OID 27090)
-- Name: conversations_user2_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX conversations_user2_id_idx ON public.conversations USING btree (user2_id);


--
-- TOC entry 5032 (class 1259 OID 27102)
-- Name: favorites_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX favorites_listing_id_idx ON public.favorites USING btree (listing_id);


--
-- TOC entry 5035 (class 1259 OID 27101)
-- Name: favorites_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX favorites_user_id_idx ON public.favorites USING btree (user_id);


--
-- TOC entry 5036 (class 1259 OID 27103)
-- Name: favorites_user_id_listing_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX favorites_user_id_listing_id_key ON public.favorites USING btree (user_id, listing_id);


--
-- TOC entry 5007 (class 1259 OID 27086)
-- Name: listings_city_rent_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX listings_city_rent_is_active_idx ON public.listings USING btree (city, rent, is_active);


--
-- TOC entry 5010 (class 1259 OID 27087)
-- Name: listings_type_city_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX listings_type_city_created_at_idx ON public.listings USING btree (type, city, created_at);


--
-- TOC entry 5011 (class 1259 OID 27088)
-- Name: listings_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX listings_user_id_idx ON public.listings USING btree (user_id);


--
-- TOC entry 5017 (class 1259 OID 27092)
-- Name: messages_conversation_id_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_conversation_id_created_at_idx ON public.messages USING btree (conversation_id, created_at);


--
-- TOC entry 5020 (class 1259 OID 27093)
-- Name: messages_sender_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX messages_sender_id_idx ON public.messages USING btree (sender_id);


--
-- TOC entry 5053 (class 1259 OID 27112)
-- Name: notifications_user_id_is_read_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX notifications_user_id_is_read_created_at_idx ON public.notifications USING btree (user_id, is_read, created_at);


--
-- TOC entry 5062 (class 1259 OID 29097)
-- Name: platform_settings_key_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX platform_settings_key_key ON public.platform_settings USING btree (key);


--
-- TOC entry 5005 (class 1259 OID 27084)
-- Name: refresh_tokens_token_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX refresh_tokens_token_key ON public.refresh_tokens USING btree (token);


--
-- TOC entry 5006 (class 1259 OID 27085)
-- Name: refresh_tokens_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX refresh_tokens_user_id_idx ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 5028 (class 1259 OID 27099)
-- Name: reports_reported_listing_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_reported_listing_id_idx ON public.reports USING btree (reported_listing_id);


--
-- TOC entry 5029 (class 1259 OID 27098)
-- Name: reports_reported_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_reported_user_id_idx ON public.reports USING btree (reported_user_id);


--
-- TOC entry 5030 (class 1259 OID 27097)
-- Name: reports_reporter_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_reporter_id_idx ON public.reports USING btree (reporter_id);


--
-- TOC entry 5031 (class 1259 OID 27100)
-- Name: reports_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reports_status_idx ON public.reports USING btree (status);


--
-- TOC entry 5046 (class 1259 OID 27110)
-- Name: reviews_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_created_at_idx ON public.reviews USING btree (created_at);


--
-- TOC entry 5049 (class 1259 OID 27109)
-- Name: reviews_reviewed_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX reviews_reviewed_id_idx ON public.reviews USING btree (reviewed_id);


--
-- TOC entry 5050 (class 1259 OID 27111)
-- Name: reviews_reviewer_id_reviewed_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX reviews_reviewer_id_reviewed_id_key ON public.reviews USING btree (reviewer_id, reviewed_id);


--
-- TOC entry 5043 (class 1259 OID 27107)
-- Name: team_members_team_id_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX team_members_team_id_status_idx ON public.team_members USING btree (team_id, status);


--
-- TOC entry 5044 (class 1259 OID 27108)
-- Name: team_members_team_id_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX team_members_team_id_user_id_key ON public.team_members USING btree (team_id, user_id);


--
-- TOC entry 5045 (class 1259 OID 27106)
-- Name: team_members_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX team_members_user_id_idx ON public.team_members USING btree (user_id);


--
-- TOC entry 5037 (class 1259 OID 27104)
-- Name: teams_city_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX teams_city_is_active_idx ON public.teams USING btree (city, is_active);


--
-- TOC entry 5038 (class 1259 OID 27105)
-- Name: teams_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX teams_created_at_idx ON public.teams USING btree (created_at);


--
-- TOC entry 4998 (class 1259 OID 27081)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 4999 (class 1259 OID 27083)
-- Name: users_google_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_google_id_key ON public.users USING btree (google_id);


--
-- TOC entry 5000 (class 1259 OID 27082)
-- Name: users_phone_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_phone_key ON public.users USING btree (phone);


--
-- TOC entry 5073 (class 2606 OID 27158)
-- Name: blocks blocks_blocked_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocked_id_fkey FOREIGN KEY (blocked_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5074 (class 2606 OID 27153)
-- Name: blocks blocks_blocker_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blocks
    ADD CONSTRAINT blocks_blocker_id_fkey FOREIGN KEY (blocker_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5067 (class 2606 OID 27133)
-- Name: conversations conversations_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5068 (class 2606 OID 27138)
-- Name: conversations conversations_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5069 (class 2606 OID 27123)
-- Name: conversations conversations_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5070 (class 2606 OID 27128)
-- Name: conversations conversations_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5078 (class 2606 OID 27183)
-- Name: favorites favorites_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5079 (class 2606 OID 27178)
-- Name: favorites favorites_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5066 (class 2606 OID 27118)
-- Name: listings listings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listings
    ADD CONSTRAINT listings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5071 (class 2606 OID 27143)
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5072 (class 2606 OID 27148)
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5084 (class 2606 OID 27208)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5065 (class 2606 OID 27113)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5075 (class 2606 OID 27173)
-- Name: reports reports_reported_listing_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_listing_id_fkey FOREIGN KEY (reported_listing_id) REFERENCES public.listings(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5076 (class 2606 OID 27168)
-- Name: reports reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5077 (class 2606 OID 27163)
-- Name: reports reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5082 (class 2606 OID 27203)
-- Name: reviews reviews_reviewed_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewed_id_fkey FOREIGN KEY (reviewed_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 27198)
-- Name: reviews reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5080 (class 2606 OID 27188)
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5081 (class 2606 OID 27193)
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5253 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-02-19 18:11:45

--
-- PostgreSQL database dump complete
--

\unrestrict 2VMOaqwQzmBkPgRVole369p6SNmZAojjKZNG11gSSRrnMI0PG2koJr9ZWcPPQHa

