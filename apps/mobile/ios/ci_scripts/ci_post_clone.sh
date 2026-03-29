#!/bin/sh
set -eu

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
IOS_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
MOBILE_ROOT="$(CDPATH= cd -- "$IOS_ROOT/.." && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$MOBILE_ROOT/../.." && pwd)"

export BUN_INSTALL="${BUN_INSTALL:-$HOME/.bun}"
export PATH="$BUN_INSTALL/bin:$PATH"

if ! command -v bun >/dev/null 2>&1; then
  INSTALL_SCRIPT="$(mktemp)"
  trap 'rm -f "$INSTALL_SCRIPT"' EXIT
  curl -fsSL https://bun.sh/install -o "$INSTALL_SCRIPT"
  bash "$INSTALL_SCRIPT"
  rm -f "$INSTALL_SCRIPT"
  trap - EXIT
fi

cd "$REPO_ROOT"
bun install --frozen-lockfile
bun run build

cd "$MOBILE_ROOT"
bun x expo prebuild -p ios --clean --non-interactive
