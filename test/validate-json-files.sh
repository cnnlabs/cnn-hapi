#!/bin/bash

# This can be done in one line, but the file that has the error is not captured
#
# find . -name "*.json" -not -path "./node_modules/*" -not -path "./test/*" -not -path "./ruby/*" | xargs -n1 node_modules/.bin/jsonlint -q
# [Error: Parse error on line 14:
# ...       }    }    "mediaStyle-cnn": {
# --------------------^
# Expecting 'EOF', '}', ',', ']', got 'STRING']
#
# Ehh, works, but not ideal.

EXIT_CODE=0
JSON_FILES=(`find . \
                  -name "*.json"\
                  -not -path "./node_modules/*"\
                  -not -path "./test/*"\
                  -not -path "./ruby/*"\
            `)

for file in "${JSON_FILES[@]}"; do
    node_modules/.bin/jsonlint "${file}" -q
    if [ $? -eq 1 ]; then
        echo "${file}"
        EXIT_CODE=1
    fi
done

exit ${EXIT_CODE}
