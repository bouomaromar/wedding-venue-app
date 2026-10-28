-- Accounts: everyone signs in as a USER; owners get an extra VENUE_OWNER profile.
-- ERD fixes: users.role added, venue_owners.user_id added, refresh_tokens added.

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,   -- always stored lowercase by the API
    phone           VARCHAR(30),
    password_hash   TEXT NOT NULL,
    role            VARCHAR(10) NOT NULL DEFAULT 'couple'
                    CHECK (role IN ('couple', 'owner', 'admin')),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,  -- admins can disable accounts
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE venue_owners (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    company_name    VARCHAR(150) NOT NULL,
    contact_email   VARCHAR(255) NOT NULL UNIQUE,
    contact_phone   VARCHAR(30),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- refresh tokens are stored hashed so a leaked database can't be used to sign in
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash      CHAR(64) NOT NULL UNIQUE,       -- sha256 hex
    expires_at      TIMESTAMPTZ NOT NULL,
    revoked_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
