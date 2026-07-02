const { execSync } = require('child_process');

const currentPid = process.pid;
console.log("Current Process PID:", currentPid);

try {
  const output = execSync('wmic process where "name=\'node.exe\'" get processid').toString();
  const pids = output.split('\n')
    .map(line => line.trim())
    .filter(line => line && !isNaN(line))
    .map(Number);
  
  console.log("Found Node PIDs:", pids);
  
  for (const pid of pids) {
    if (pid !== currentPid) {
      console.log(`Killing Node process ${pid}...`);
      try {
        process.kill(pid, 'SIGKILL');
      } catch (e) {
        // Fallback for Windows
        try {
          execSync(`taskkill /F /PID ${pid}`);
        } catch (err) {
          console.error(`Failed to kill ${pid}:`, err.message);
        }
      }
    }
  }
  console.log("Cleanup complete!");
} catch (err) {
  console.error("Failed to query processes:", err.message);
}
