const { pool } = require("../config/db");

// Fields shown in lists (search results, "my venues").
const listColumns = `
    v.id,
    v.name,
    v.region,
    v.capacity_min AS "capacityMin",
    v.capacity_max AS "capacityMax",
    v.price_min AS "priceMin",
    v.price_max AS "priceMax",
    v.status,
    v.is_featured AS "isFeatured",
    v.rating_avg::float AS "ratingAvg",
    v.rating_count AS "ratingCount",
    (SELECT m.url FROM venue_media m
     WHERE m.venue_id = v.id AND m.type = 'photo'
     ORDER BY m.sort_order, m.created_at
     LIMIT 1) AS "coverUrl",
    COALESCE((SELECT json_agg(st.name ORDER BY st.name)
              FROM venue_styles vs JOIN style_tags st ON st.id = vs.style_id
              WHERE vs.venue_id = v.id), '[]') AS styles
`;

// Turns the filters into a WHERE clause with numbered $ placeholders, so user
// input is always sent as a parameter and never pasted into the SQL text.
const buildWhere = (filters) => {
    const conditions = [];
    const params = [];
    const add = (sql, value) => {
        params.push(value);
        conditions.push(sql.replace("?", `$${params.length}`));
    };

    if (filters.statuses) add("v.status = ANY(?::text[])", filters.statuses);
    if (filters.ownerId) add("v.owner_id = ?", filters.ownerId);
    if (filters.region) add("v.region = ?", filters.region);
    if (filters.guests) {
        add("v.capacity_min <= ?", filters.guests);
        add("v.capacity_max >= ?", filters.guests);
    }
    if (filters.budget !== undefined) add("v.price_min <= ?", filters.budget);
    if (filters.styleId) {
        add("EXISTS (SELECT 1 FROM venue_styles vs WHERE vs.venue_id = v.id AND vs.style_id = ?)", filters.styleId);
    }
    if (filters.amenityId) {
        add("EXISTS (SELECT 1 FROM venue_amenities va WHERE va.venue_id = v.id AND va.amenity_id = ?)", filters.amenityId);
    }
    if (filters.featured !== undefined) add("v.is_featured = ?", filters.featured);
    if (filters.search) {
        // escape LIKE wildcards so "%" in a search box is a literal percent sign
        const escaped = filters.search.replace(/[\\%_]/g, (char) => `\\${char}`);
        add("v.name ILIKE ?", `%${escaped}%`);
    }

    return {
        where: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
        params
    };
};

const findAll = async (filters, { limit, offset }) => {
    const { where, params } = buildWhere(filters);
    const limitIndex = params.length + 1;

    const [rows, count] = await Promise.all([
        pool.query(
            `SELECT ${listColumns}
             FROM venues v
             ${where}
             ORDER BY v.is_featured DESC, v.rating_avg DESC, v.created_at DESC, v.id
             LIMIT $${limitIndex} OFFSET $${limitIndex + 1}`,
            [...params, limit, offset]
        ),
        pool.query(`SELECT COUNT(*)::int AS total FROM venues v ${where}`, params)
    ]);

    return { venues: rows.rows, total: count.rows[0].total };
};

// Everything the venue details screen needs, in one query.
const findById = async (id, db = pool) => {
    const result = await db.query(
        `SELECT
            v.id,
            v.name,
            v.description,
            v.region,
            v.address,
            v.latitude::float AS latitude,
            v.longitude::float AS longitude,
            v.capacity_min AS "capacityMin",
            v.capacity_max AS "capacityMax",
            v.price_min AS "priceMin",
            v.price_max AS "priceMax",
            v.status,
            v.is_featured AS "isFeatured",
            v.rating_avg::float AS "ratingAvg",
            v.rating_count AS "ratingCount",
            v.created_at AS "createdAt",
            v.updated_at AS "updatedAt",
            vo.user_id AS "ownerUserId",
            json_build_object(
                'id', vo.id,
                'companyName', vo.company_name,
                'contactEmail', vo.contact_email,
                'contactPhone', vo.contact_phone
            ) AS owner,
            COALESCE((SELECT json_agg(json_build_object('id', st.id, 'name', st.name) ORDER BY st.name)
                      FROM venue_styles vs JOIN style_tags st ON st.id = vs.style_id
                      WHERE vs.venue_id = v.id), '[]') AS styles,
            COALESCE((SELECT json_agg(json_build_object('id', a.id, 'name', a.name) ORDER BY a.name)
                      FROM venue_amenities va JOIN amenities a ON a.id = va.amenity_id
                      WHERE va.venue_id = v.id), '[]') AS amenities,
            COALESCE((SELECT json_agg(json_build_object('id', m.id, 'type', m.type, 'url', m.url, 'sortOrder', m.sort_order)
                                      ORDER BY m.sort_order, m.created_at)
                      FROM venue_media m
                      WHERE m.venue_id = v.id), '[]') AS media
         FROM venues v
         JOIN venue_owners vo ON vo.id = v.owner_id
         WHERE v.id = $1`,
        [id]
    );
    return result.rows[0];
};

// Just enough to check who may change a venue.
const findOwnership = async (id) => {
    const result = await pool.query(
        `SELECT v.id, v.status, vo.user_id AS "ownerUserId"
         FROM venues v
         JOIN venue_owners vo ON vo.id = v.owner_id
         WHERE v.id = $1`,
        [id]
    );
    return result.rows[0];
};

const create = async (ownerId, venue, db = pool) => {
    const result = await db.query(
        `INSERT INTO venues (owner_id, name, description, region, address, latitude, longitude,
                             capacity_min, capacity_max, price_min, price_max)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [ownerId, venue.name, venue.description, venue.region, venue.address, venue.latitude,
            venue.longitude, venue.capacityMin, venue.capacityMax, venue.priceMin, venue.priceMax]
    );
    return result.rows[0].id;
};

const update = async (id, venue, db = pool) => {
    const result = await db.query(
        `UPDATE venues SET
            name = $1,
            description = $2,
            region = $3,
            address = $4,
            latitude = $5,
            longitude = $6,
            capacity_min = $7,
            capacity_max = $8,
            price_min = $9,
            price_max = $10,
            updated_at = now()
         WHERE id = $11
         RETURNING id`,
        [venue.name, venue.description, venue.region, venue.address, venue.latitude, venue.longitude,
            venue.capacityMin, venue.capacityMax, venue.priceMin, venue.priceMax, id]
    );
    return result.rows[0]?.id;
};

// Replace the venue's tags with exactly this list.
const setStyles = async (venueId, styleIds, db = pool) => {
    await db.query("DELETE FROM venue_styles WHERE venue_id = $1", [venueId]);
    await db.query(
        `INSERT INTO venue_styles (venue_id, style_id)
         SELECT DISTINCT $1::uuid, tag_id FROM unnest($2::uuid[]) AS tag_id`,
        [venueId, styleIds]
    );
};

const setAmenities = async (venueId, amenityIds, db = pool) => {
    await db.query("DELETE FROM venue_amenities WHERE venue_id = $1", [venueId]);
    await db.query(
        `INSERT INTO venue_amenities (venue_id, amenity_id)
         SELECT DISTINCT $1::uuid, tag_id FROM unnest($2::uuid[]) AS tag_id`,
        [venueId, amenityIds]
    );
};

const updateModeration = async (id, { status, isFeatured }) => {
    const result = await pool.query(
        `UPDATE venues SET
            status = COALESCE($1, status),
            is_featured = COALESCE($2, is_featured),
            updated_at = now()
         WHERE id = $3
         RETURNING id`,
        [status ?? null, isFeatured ?? null, id]
    );
    return result.rows[0]?.id;
};

const remove = async (id) => {
    const result = await pool.query("DELETE FROM venues WHERE id = $1 RETURNING id", [id]);
    return result.rows[0]?.id;
};

module.exports = {
    findAll,
    findById,
    findOwnership,
    create,
    update,
    setStyles,
    setAmenities,
    updateModeration,
    remove
};
