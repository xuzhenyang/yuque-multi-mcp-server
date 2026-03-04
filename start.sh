#!/bin/bash
# 请替换以下token为你的实际token
export A_TOKEN="your_first_token_here"
export B_TOKEN="your_second_token_here"
exec node "$(dirname "$0")/dist/cli.js"
