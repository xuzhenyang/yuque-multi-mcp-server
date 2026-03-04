#!/bin/bash
# 请替换以下token为你的实际token
export TECH_TEAM_TOKEN="your_tech_team_token_here"
export ONLINE_MERCHANT_TOKEN="your_merchant_token_here"
exec node "$(dirname "$0")/dist/cli.js"
