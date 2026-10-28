-- Classification: fixed lists of style tags and amenities, linked to venues
-- through bridge tables. ERD fixes: amenities and venue_amenities added.

CREATE TABLE style_tags (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE venue_styles (
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    style_id        UUID NOT NULL REFERENCES style_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (venue_id, style_id)
);

CREATE INDEX idx_venue_styles_style_id ON venue_styles(style_id);

CREATE TABLE amenities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE venue_amenities (
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    amenity_id      UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (venue_id, amenity_id)
);

CREATE INDEX idx_venue_amenities_amenity_id ON venue_amenities(amenity_id);
