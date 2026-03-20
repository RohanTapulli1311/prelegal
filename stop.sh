#!/usr/bin/env bash

ROOT="$(cd "$(dirname "$0")" && pwd)"
PIDS_FILE="$ROOT/.pids"

if [ ! -f "$PIDS_FILE" ]; then
  echo "No .pids file found — nothing to stop."
  exit 0
fi

read -r BACKEND_PID FRONTEND_PID < "$PIDS_FILE"

echo "Stopping backend (PID $BACKEND_PID)..."
kill "$BACKEND_PID" 2>/dev/null && echo "Backend stopped." || echo "Backend already stopped."

echo "Stopping frontend (PID $FRONTEND_PID)..."
kill "$FRONTEND_PID" 2>/dev/null && echo "Frontend stopped." || echo "Frontend already stopped."

rm -f "$PIDS_FILE"
echo "Done."
