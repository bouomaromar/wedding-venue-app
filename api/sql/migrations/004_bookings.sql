-- Bookings: one request for one venue on one date, plus an audit trail.
-- ERD fix: booking_status_history added.

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    venue_id        UUID NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
    event_date      DATE NOT NULL,
    guest_count     INTEGER NOT NULL CHECK (guest_count > 0),
    status          VARCHAR(10) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_venue_date ON bookings(venue_id, event_date);

-- the database itself refuses a second confirmed booking for the same venue and date
CREATE UNIQUE INDEX uq_bookings_confirmed_venue_date
    ON bookings(venue_id, event_date)
    WHERE status = 'confirmed';

CREATE TABLE booking_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    from_status     VARCHAR(10),                    -- NULL for the first entry
    to_status       VARCHAR(10) NOT NULL,
    changed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    changed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_status_history_booking_id ON booking_status_history(booking_id);
