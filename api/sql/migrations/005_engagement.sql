-- Engagement: reviews (one per couple per venue) and favorites.
-- ERD fix: favorites added.

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, venue_id)
);

CREATE INDEX idx_reviews_venue_id ON reviews(venue_id);

CREATE TABLE favorites (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, venue_id)
);

CREATE INDEX idx_favorites_venue_id ON favorites(venue_id);
