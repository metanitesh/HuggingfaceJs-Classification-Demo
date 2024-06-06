"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import Link from "next/link";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bird, Git, Linkedin, Github } from "lucide-react";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  const [result, setResult] = useState(null);
  const [ready, setReady] = useState(null);
  const worker = useRef(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL("./worker.js", import.meta.url), {
        type: "module",
      });
    }

    const onMessageReceived = (e) => {
      switch (e.data.status) {
        case "initiate":
          setReady(false);
          break;
        case "ready":
          setReady(true);
          break;
        case "complete":
          setResult(e.data.output[0]);
          break;
      }
    };

    worker.current.addEventListener("message", onMessageReceived);

    return () =>
      worker.current.removeEventListener("message", onMessageReceived);
  }, [message]);

  const classify = useCallback((text) => {
    if (worker.current) {
      console.log("Classifying...", text);
      worker.current.postMessage({ text });
    }
  }, []);

  const getBgColor = (result) => {
    if (result === null) {
      return "bg-muted";
    } else {
      if (result.label === "POSITIVE") {
        return "bg-green-500";
      } else if (result.label === "NEGATIVE") {
        return "bg-red-500";
      } else {
        return "bg-muted";
      }
    }
  };
  return (
    <div>
      <h3 className="text-2xl font-semibold tracking-tight justify-center flex pt-4 bg-slate-800 text-gray-200">
        Sentiment Analysis Demo (NextJs + HuggingFace TransformerJs)
      </h3>
      <p className="text-sm font-md tracking-tight justify-center flex pt-2 pb-4 bg-slate-800 text-gray-200">
        This demo uses HuggingFace's transformerjs to load and cache a
        pre-trained model to user browser and use it to classify sentiment of
        the text.
      </p>

      <div className="w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px]">
        <div className="flex items-center justify-center py-12">
          <div className="mx-auto grid w-[450px] h-2/3 gap-1">
            <div
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
              x-chunk="dashboard-03-chunk-1"
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className=" h-full *:resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  classify(e.target.value);
                }}
              />
              <div className="flex items-center p-3 pt-0">
                {/* <Button
                type="submit"
                size="sm"
                className="ml-auto gap-1.5"
                // onClick={handleClick}
              >
                Send Message
                <CornerDownLeft className="size-3.5" />
              </Button> */}
              </div>
            </div>
          </div>
        </div>
        <div className={`${getBgColor(result)}`}>
          <div className="flex items-center justify-center -mt-16 h-full">
            {ready !== null && (
              <pre className="text-yellow-50">
                {!ready || !result
                  ? "Loading..."
                  : JSON.stringify(result, null, 2)}
              </pre>
            )}

            {!result && (
              <pre className="text-slate-900">Prediction will appear here</pre>
            )}
          </div>
        </div>
        <div className="fixed"></div>
      </div>
      <footer className="fixed bottom-0 right-0 left-0 bg-gray-900 py-4 px-6 flex items-center justify-end dark:bg-gray-800">
        <div className="flex items-center  space-x-4">
          <Link
            href="https://github.com/metanitesh/HuggingfaceJs-Classification-Demo"
            target="_blank"
            className="text-gray-400 hover:text-gray-300 transition-colors"
            prefetch={false}
          >
            <Github />
          </Link>
          <Link
            href="https://www.linkedin.com/in/nitesh-sharma-profile/"
            target="_blank"
            className="text-gray-400 hover:text-gray-300 transition-colors"
            prefetch={false}
          >
            <Linkedin className="h-6 w-6" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
