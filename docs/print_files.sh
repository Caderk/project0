#!/bin/bash

# Capture the list of files from the tree command
FILES=$(tree --gitignore --noreport --prune -i -n -f \
    -P 'Dockerfile' \
    -P '*.py' \
    -P '*.ts' \
    -P '*.tsx' \
    -P '*.css' \
    -P '*.js' \
    -P '*.json' \
    -P '*.conf' \
    -P '*.yml' \
    -I 'package-lock.json')

# Loop through each file in the list
while IFS= read -r file; do
    # Check if the entry is a file
    if [[ -f "$file" ]]; then
        echo "----- Start of file: $file -----"
        cat "$file"
        echo "----- End of file: $file -----"
        echo ""
    fi
done <<< "$FILES"
