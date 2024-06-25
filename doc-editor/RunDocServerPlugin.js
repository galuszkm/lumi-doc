const { exec } = require('child_process');

class RunDocServerPlugin {
  constructor() {
    this.docServerProcess = null;
  }

  apply(compiler) {
    compiler.hooks.done.tap('RunDocServerPlugin', (stats) => {
      if (!this.docServerProcess) {
        this.docServerProcess = exec('cd ../doc-view && npm run start-hidden', (err, stdout, stderr) => {
          if (err) {
            console.error(`Error starting the doc server: ${err}`);
            return;
          }
          console.log(`Doc server output: ${stdout}`);
          if (stderr) {
            console.error(`Doc server error output: ${stderr}`);
          }
        });

        this.docServerProcess.on('exit', (code, signal) => {
          console.log(`Doc server process exited with code ${code} and signal ${signal}`);
          this.docServerProcess = null;
        });
      }
    });

    // Listen for the process exit event
    process.on('exit', () => {
      if (this.docServerProcess) {
        this.docServerProcess.kill();
      }
    });

    // Also handle termination signals
    ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
      process.on(signal, () => {
        if (this.docServerProcess) {
          this.docServerProcess.kill();
        }
        process.exit();
      });
    });
  }
}

module.exports = RunDocServerPlugin;
