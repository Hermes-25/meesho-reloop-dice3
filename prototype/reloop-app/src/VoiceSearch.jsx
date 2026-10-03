import React, { useEffect, useRef, useState } from "react";
import { Mic, Square, X, LoaderCircle } from "lucide-react";
import { releaseCapture } from "./capture-cleanup.mjs";
import { encodeVoiceWav, silenceState, VOICE_SECONDS } from "./voice-audio.mjs";

export default function VoiceSearch({ onText, disabled = false }) {
  const [phase, setPhase] = useState("idle"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [level, setLevel] = useState(0);
  const current = useRef(null),
    mounted = useRef(true);
  function release(run) {
    if (!run) return;
    clearInterval(run.meter);
    clearTimeout(run.limit);
    clearTimeout(run.networkLimit);
    releaseCapture(run.recorder, run.stream);
    run.context?.close().catch(() => {});
    run.request?.abort();
  }
  function cancel() {
    const run = current.current;
    current.current = null;
    release(run);
    if (mounted.current) {
      setPhase("idle");
      setLevel(0);
      setMessage("");
      setError("");
    }
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const run = current.current;
      current.current = null;
      release(run);
    };
  }, []);
  const isCurrent = (run) => mounted.current && current.current === run;
  function fail(run, message) {
    if (!isCurrent(run)) return;
    current.current = null;
    release(run);
    setPhase("idle");
    setLevel(0);
    setMessage("");
    setError(message);
  }
  async function sendAudio(run, blob) {
    if (!isCurrent(run)) return;
    setPhase("processing");
    setLevel(0);
    setMessage("Turning your words into a search…");
    clearInterval(run.meter);
    clearTimeout(run.limit);
    run.stream?.getTracks().forEach((t) => t.stop());
    try {
      const decoded = await run.context.decodeAudioData(
        await blob.arrayBuffer(),
      );
      if (!isCurrent(run)) return;
      const offline = new OfflineAudioContext(
          1,
          Math.min(Math.ceil(decoded.duration * 16000), VOICE_SECONDS * 16000),
          16000,
        ),
        source = offline.createBufferSource();
      source.buffer = decoded;
      source.connect(offline.destination);
      source.start();
      const wav = encodeVoiceWav(
        (await offline.startRendering()).getChannelData(0),
      );
      await run.context.close();
      run.context = null;
      if (!isCurrent(run)) return;
      run.request = new AbortController();
      run.networkLimit = setTimeout(() => run.request.abort(), 30000);
      const response = await fetch("/api/voice", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "audio/wav" },
        body: wav,
        signal: run.request.signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw Error(
          result.error || "Voice search could not connect. Please try again.",
        );
      if (!result.text?.trim())
        throw Error("I couldn’t hear a search. Please try again.");
      if (isCurrent(run)) {
        onText(result.text.trim());
        setMessage("Words added. Check or edit them, then search.");
        setError("");
        setPhase("idle");
        current.current = null;
      }
    } catch (e) {
      if (isCurrent(run))
        fail(
          run,
          e.name === "AbortError"
            ? "Voice search took too long. Please try again."
            : e.message,
        );
    } finally {
      release(run);
    }
  }
  async function start() {
    if (current.current || disabled) return;
    const run = {};
    current.current = run;
    setError("");
    setMessage("Allow the microphone to start speaking.");
    setPhase("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder)
        throw Error(
          "This browser cannot record audio. Open this page in Chrome or Safari, or type your search.",
        );
      const Audio = window.AudioContext || window.webkitAudioContext;
      // Resume inside the tap gesture for mobile Safari; no model download.
      run.context = new Audio();
      await run.context.resume();
      if (!isCurrent(run)) {
        release(run);
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      run.stream = stream;
      if (!isCurrent(run)) {
        release(run);
        return;
      }
      const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(
        (x) => MediaRecorder.isTypeSupported(x),
      );
      const recorder = new MediaRecorder(
          stream,
          mime ? { mimeType: mime } : undefined,
        ),
        chunks = [];
      run.recorder = recorder;
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = () => {
        if (isCurrent(run))
          sendAudio(run, new Blob(chunks, { type: recorder.mimeType }));
      };
      recorder.onerror = () =>
        fail(run, "Recording stopped unexpectedly. Tap the mic to try again.");
      recorder.start();
      setPhase("listening");
      setMessage("Listening… speak naturally, then pause.");
      run.limit = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, VOICE_SECONDS * 1000);
      // Meter/silence stop are optional; Done remains available.
      try {
        const input = run.context.createMediaStreamSource(stream),
          analyser = run.context.createAnalyser();
        analyser.fftSize = 2048;
        input.connect(analyser);
        const values = new Float32Array(analyser.fftSize),
          started = performance.now();
        let activity = { frames: 0, heard: false, last: 0 };
        run.meter = setInterval(() => {
          if (!isCurrent(run) || recorder.state !== "recording") return;
          analyser.getFloatTimeDomainData(values);
          const rms = Math.sqrt(
            values.reduce((n, x) => n + x * x, 0) / values.length,
          );
          setLevel(Math.min(1, rms * 9));
          activity = silenceState(activity, rms, performance.now() - started);
          if (activity.quiet)
            fail(run, "I didn’t hear anything. Check your mic and try again.");
          else if (activity.stop) recorder.stop();
        }, 100);
      } catch {}
    } catch (e) {
      fail(
        run,
        e.name === "NotAllowedError"
          ? "Microphone permission is off. Allow it for this site, then tap the mic again."
          : e.name === "NotFoundError"
            ? "No microphone was found. Connect one or type your search."
            : e.message,
      );
    }
  }
  const busy = phase !== "idle";
  return (
    <div className="voice-search voice-simple">
      <div className="voice-inline">
        <button
          type="button"
          className={
            "button " + (phase === "listening" ? "primary" : "secondary")
          }
          disabled={disabled || phase === "starting" || phase === "processing"}
          aria-label={
            phase === "listening" ? "Done speaking" : "Speak to search"
          }
          onClick={() =>
            phase === "listening" ? current.current?.recorder?.stop() : start()
          }
        >
          {phase === "listening" ? (
            <Square size={18} />
          ) : busy ? (
            <LoaderCircle size={18} className="voice-spinner" />
          ) : (
            <Mic size={18} />
          )}
          <span>
            {phase === "listening"
              ? "Done"
              : phase === "starting"
                ? "Opening mic…"
                : phase === "processing"
                  ? "Transcribing…"
                  : "Speak to search"}
          </span>
        </button>
        <span className="voice-hint">Hindi, English or Hinglish</span>
        {busy && (
          <button
            type="button"
            className="icon-button"
            aria-label="Cancel voice search"
            onClick={cancel}
          >
            <X size={18} />
          </button>
        )}
      </div>
      {phase === "listening" && (
        <div className="voice-level" aria-hidden="true">
          <span style={{ width: 8 + level * 92 + "%" }} />
        </div>
      )}
      {message && (
        <p className="voice-status" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <details className="voice-privacy"><summary>Audio privacy</summary><p>Your short recording is processed to turn speech into text. This app does not save the audio.</p></details>
    </div>
  );
}
