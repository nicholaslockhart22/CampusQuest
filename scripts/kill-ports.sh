#!/bin/bash
# Free ports 3000-3009 by killing the Node processes using them.
# Usage: ./scripts/kill-ports.sh
# Then run: npm run dev  (will use port 3000)

for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009; do
  pid=$(lsof -ti :$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $port"
    kill $pid 2>/dev/null || kill -9 $pid 2>/dev/null
  fi
done
echo "Done. Run 'npm run dev' to start on port 3000."
