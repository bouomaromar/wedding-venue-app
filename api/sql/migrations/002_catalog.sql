-- Catalog: venues, their media and the dates owners have blocked.
-- ERD fixes: price range, description, location, approval status and
-- stored rating average added to venues; venue_availability added.

CREATE TABLE venues (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES venue_owners(id) ON DELETE RESTRICT,
    name            VARCHAR(150) NOT NULL,
    description     TEXT,
    region          VARCHAR(50) NOT NULL,
    address         VARCHAR(255),
    latitude        NUMERIC(9, 6) CHECK (latitude BETWEEN -90 AND 90),
    longitude       NUMERIC(9, 6) CHECK (longitude BETWEEN -180 AND 180),
    capacity_min    INTEGER NOT NULL CHECK (capacity_min >= 0),
    capacity_max    INTEGER NOT NULL,
    price_min       INTEGER NOT NULL CHECK (price_min >= 0),   -- USD for the whole event
    price_max       INTEGER NOT NULL,
    status          VARCHAR(10) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    rating_avg      NUMERIC(3, 2) NOT NULL DEFAULT 0,          -- updated on each review
    rating_count    INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (capacity_max >= capacity_min),
    CHECK (price_max >= price_min)
);

CREATE INDEX idx_venues_owner_id ON venues(owner_id);
CREATE INDEX idx_venues_region ON venues(region);
CREATE INDEX idx_venues_capacity_max ON venues(capacity_max);
CREATE INDEX idx_venues_status ON venues(status);

CREATE TABLE venue_media (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    type            VARCHAR(10) NOT NULL CHECK (type IN ('photo', '360', 'splat')),
    url             TEXT NOT NULL,                  -- CDN link; the file itself lives in object storage
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_venue_media_venue_id ON venue_media(venue_id);

CREATE TABLE venue_availability (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    blocked_date    DATE NOT NULL,
    reason          VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (venue_id, blocked_date)
);
