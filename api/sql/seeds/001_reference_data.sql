-- Fixed lists the app filters and recommends on. Safe to run more than once.

INSERT INTO style_tags (name) VALUES
    ('Garden'),
    ('Beach'),
    ('Mountain View'),
    ('Ballroom'),
    ('Rooftop'),
    ('Rustic'),
    ('Heritage'),
    ('Modern')
ON CONFLICT (name) DO NOTHING;

INSERT INTO amenities (name) VALUES
    ('Parking'),
    ('Valet'),
    ('In-house Catering'),
    ('Bridal Suite'),
    ('Outdoor Ceremony Area'),
    ('Indoor Backup'),
    ('Accommodation'),
    ('Generator'),
    ('Wheelchair Access'),
    ('Sound System')
ON CONFLICT (name) DO NOTHING;
