-- Saved search preferences used by the recommendation engine.
-- ERD fixes: one row per user, region added, preferred styles linked to
-- style_tags through a bridge table instead of free text.

CREATE TABLE user_preferences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    budget_min      INTEGER CHECK (budget_min >= 0),
    budget_max      INTEGER,
    guest_count     INTEGER CHECK (guest_count > 0),
    region          VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (budget_max IS NULL OR budget_min IS NULL OR budget_max >= budget_min)
);

CREATE TABLE user_preference_styles (
    preference_id   UUID NOT NULL REFERENCES user_preferences(id) ON DELETE CASCADE,
    style_id        UUID NOT NULL REFERENCES style_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (preference_id, style_id)
);
