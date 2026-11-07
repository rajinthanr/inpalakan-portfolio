#!/usr/bin/env bash
# Publish the site without GitHub Actions minutes: build dist/ locally and push it to the gh-pages branch.
# GitHub Pages is set to "Deploy from a branch" (gh-pages, /), so GitHub's free built-in
# "pages build and deployment" serves it at https://rajinthan.com/inpalakan-portfolio/ within a minute or two.
# Usage: scripts/deploy-pages-branch.sh            (run from anywhere; deploys the current checkout)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BASE="${PUBLIC_BASE_URL:-https://rajinthanr.github.io/inpalakan-portfolio}"
REV="$(git rev-parse --short HEAD)"
[ -z "$(git status --porcelain)" ] || echo "note: uncommitted changes are included in this build"

PUBLIC_BASE_URL="$BASE" node scripts/build.mjs

TMP="$(mktemp -d)"
trap 'rm -rf -- "$TMP"' EXIT
cp -a dist/. "$TMP/"
touch "$TMP/.nojekyll"                      # serve files as-is (no Jekyll processing)
git -C "$TMP" init -q -b gh-pages
git -C "$TMP" add -A
git -C "$TMP" -c user.name="$(git config user.name)" -c user.email="$(git config user.email)" \
    commit -q -m "Site build of $(git rev-parse --abbrev-ref HEAD) $REV"
git -C "$TMP" push -q --force "$(git remote get-url origin)" gh-pages
echo "Pushed build of $REV to gh-pages. GitHub Pages publishes it in 1-2 minutes:"
echo "  https://rajinthan.com/inpalakan-portfolio/"
