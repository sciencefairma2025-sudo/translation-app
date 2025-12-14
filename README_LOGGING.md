# How to Run Server So I Can See Logs

## Method 1: Run with Logging Script (Recommended)

Run this command in your terminal:

```bash
./run-with-logging.sh
```

This will:
- Start the server
- Save ALL output (including errors) to `server-debug.log`
- Show output in your terminal too
- I can read `server-debug.log` to see any errors

**After running this, just tell me "I started the server" and I'll check the log file!**

## Method 2: Manual Logging

If you prefer to run it manually:

```bash
npm run dev 2>&1 | tee server-debug.log
```

This does the same thing - saves everything to `server-debug.log`

## Method 3: Background Process with Logging

If you want to run it in the background:

```bash
npm run dev > server-debug.log 2>&1 &
```

Then I can check the log file anytime.

## What I'll Do

Once you run the server with logging:
1. You tell me "I started the server" or "check the logs"
2. I'll read `server-debug.log` to see any errors
3. I'll debug and fix any issues I find

## Tips

- Keep the terminal open while testing translation
- Try translating something to generate errors
- Then tell me to check the logs
- I'll read the file and fix any issues!



