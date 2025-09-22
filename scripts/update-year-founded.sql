-- Update existing NULL yearFounded values to current year
UPDATE institution_data
SET
    "yearFounded" = EXTRACT(
        YEAR
        FROM CURRENT_DATE
    )
WHERE
    "yearFounded" IS NULL;