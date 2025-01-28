# Use this file to auto-generate the SQL needed to put mapset_background_pictures into the database

IMAGES_DIR="../mapset_background_pictures"

echo "INSERT IGNORE INTO mapsets_tags (mapset_id, image_filename) VALUES" > mapset_tags.sql

find "$IMAGES_DIR" -type f \( -name "*.jpg" -o -name "*.png" \) | while read -r file; do
    filename=$(basename "$file")
    mapset_id="${filename%.*}"
    echo "    ($mapset_id, '$filename'),"
done | sed '$ s/,$/;/' >> mapset_tags.sql
