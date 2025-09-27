"use client";

import { ArrowLeft, ArrowRight, Delete } from "lucide-react";
import { ReactNode } from "react";

type Key = {
  key: string;
  render: ReactNode;
};

const rows: Key[][] = [
  [
    ..."QWERTYUIOP".split("").map((key) => ({ key, render: key })),
    { key: "Backspace", render: <Delete /> },
  ],
  [
    ..."ASDFGHJKL".split("").map((key) => ({ key, render: key })),
    { key: "Enter", render: "Enter" },
  ],
  [
    ..."ZXCVBNM".split("").map((key) => ({ key, render: key })),
    { key: "ArrowLeft", render: <ArrowLeft /> },
    { key: "ArrowRight", render: <ArrowRight /> },
  ],
];

export default function Keyboard() {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-2">
          {row.map((keyboard) => (
            <button
              className="h-12 px-4 rounded flex items-center justify-center bg-gray-300 text-gray-900 hover:bg-gray-400 active:bg-gray-500 disabled:opacity-50"
              onClick={() => {
                window.dispatchEvent(
                  new KeyboardEvent("keydown", { key: keyboard.key })
                );
              }}
            >
              {keyboard.render}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
