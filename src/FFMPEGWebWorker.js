const workerFile = () => {
  const workerPath = "https://archive.org/download/ffmpeg_asm/ffmpeg_asm.js";
  importScripts(workerPath);
  const now = Date.now;
  function print(text) {
    postMessage({ type: "stdout", data: text });
  }
  onmessage = function(event) {
    const message = event.data;
    if (message.type === "command") {
      const Module = {
        print: print,
        printErr: print,
        files: message.files || [],
        arguments: message.arguments || [],
        TOTAL_MEMORY: message.TOTAL_MEMORY || false
      };
      postMessage({ type: "start", data: Module.arguments.join(" ") });
      postMessage({
        type: "stdout",
        data:
          "Received command: " +
          Module.arguments.join(" ") +
          (Module.TOTAL_MEMORY
            ? ".  Processing with " + Module.TOTAL_MEMORY + " bits."
            : "")
      });
      const time = now();
      const result = ffmpeg_run(Module);
      const totalTime = now() - time;
      postMessage({
        type: "stdout",
        data: "Finished processing (took " + totalTime + "ms)"
      });
      postMessage({ type: "done", data: result, time: totalTime });
    }
  };
  postMessage({ type: "ready" });
};

export default workerFile;