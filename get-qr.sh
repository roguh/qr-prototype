#!/usr/bin/env bash
# Read from first argument or default to TEST-SN-1234
CONTENT="${1:-"TEST-SN-1234"}"

qrencode -s 15 "$CONTENT" -o testqr.png && open testqr.png
