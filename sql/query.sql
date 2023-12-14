DROP TABLE IF EXISTS ufos;
CREATE TABLE ufos (
    id SERIAL PRIMARY KEY,
    datetime DATE NOT NULL,
    city VARCHAR NOT NULL,
    "state" VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    shape VARCHAR,
    duration_seconds NUMERIC NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    date_posted DATE,
    "comments" TEXT
);

COPY ufos FROM 'C:\Users\andre\Documents\GitHub\project-3\data\final_data_comments.csv' DELIMITER ',' CSV HEADER;