"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { deepCopy } from "@/lib/utils";
import { allWords, getWordOfTheDay } from "./words";

type HighlightState = "correct" | "present" | "absent" | "unsubmitted";
type AnimationState = "awaiting" | "animating" | "done";

const ANIMATION_DURATION = 500;
const alphabetRegex = /^[A-Za-z]$/;

export default function Wordle() {
  const solution = getWordOfTheDay();

  const [letters, setLetters] = useState<string[][]>(
    Array(6).fill(Array(5).fill(""))
  );
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);

  const [notification, setNotification] = useState("");

  function getNextEmptyCol(row: string[], currentCol: number) {
    // Find the next empty column after the current column
    const colAfter = row.findIndex(
      (letter, index) => letter === "" && index > currentCol
    );

    // Else find the first empty column
    if (colAfter === -1) {
      return row.findIndex((letter) => letter === "");
    }

    return colAfter;
  }

  const [isGameOver, setIsGameOver] = useState(false);

  const globalOnKeyDown = useCallback(
    (e: KeyboardEvent) => {
      function isRowFilled(row: string[]) {
        return row.every((letter) => letter !== "");
      }

      function handleEnter() {
        setCurrentRow((prev) => prev + 1);
        setCurrentCol(0);
        if (letters[currentRow].join("") === solution) {
          setIsGameOver(true);
          return;
        }
      }

      function handleBackSpace() {
        setLetters((prevLetters) => {
          const newLetters = deepCopy(prevLetters);
          // Clear current column if not empty, else clear previous column
          if (newLetters[currentRow][currentCol] !== "") {
            newLetters[currentRow][currentCol] = "";
          } else if (currentCol > 0) {
            newLetters[currentRow][currentCol - 1] = "";
          }
          return newLetters;
        });
        setCurrentCol((prev) => (prev > 0 ? prev - 1 : 0));
      }

      if (isGameOver) {
        return;
      }

      if (e.key === "Enter") {
        if (!isRowFilled(letters[currentRow])) {
          return;
        }

        if (!allWords.includes(letters[currentRow].join(""))) {
          setNotification("Not in word list!");
          return setTimeout(() => setNotification(""), 2000);
        }

        handleEnter();
      } else if (e.key === "Backspace") {
        handleBackSpace();
      } else if (e.key === "ArrowLeft") {
        setCurrentCol((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === "ArrowRight") {
        setCurrentCol((prev) => (prev < 4 ? prev + 1 : 4));
      }

      // Not A-Z
      if (!alphabetRegex.test(e.key)) {
        return;
      }

      setLetters((prevLetters) => {
        const newLetters = deepCopy(prevLetters);
        newLetters[currentRow][currentCol] = e.key.toUpperCase();
        return newLetters;
      });

      const nextCol = getNextEmptyCol(letters[currentRow], currentCol);
      if (nextCol !== -1) {
        setCurrentCol(nextCol);
      } else {
        setCurrentCol((prev) => (prev < 4 ? prev + 1 : 4));
      }
    },
    [letters, setLetters, currentRow, currentCol, isGameOver]
  );

  useEffect(() => {
    window.addEventListener("keydown", globalOnKeyDown);
    return () => {
      window.removeEventListener("keydown", globalOnKeyDown);
    };
  }, [globalOnKeyDown]);

  function getHighlightState(
    rowIndex: number,
    string: string,
    solution: string
  ): HighlightState[] {
    const result = Array(5).fill("absent");

    if (rowIndex >= currentRow) {
      return Array(5).fill("unsubmitted");
    }

    const remainingLetters: Record<string, number> = {};
    for (let i = 0; i < solution.length; i++) {
      const letter = solution[i];
      remainingLetters[letter] = (remainingLetters[letter] || 0) + 1;
    }

    for (let i = 0; i < string.length; i++) {
      if (string[i] === solution[i]) {
        remainingLetters[string[i]]--;
        result[i] = "correct";
      }
    }

    for (let i = 0; i < string.length; i++) {
      if (result[i] === "correct") continue;
      if (remainingLetters[string[i]] > 0) {
        remainingLetters[string[i]]--;
        result[i] = "present";
      }
    }

    return result;
  }

  const [animatingIndexes, setAnimatingIndexes] = useState<
    Array<AnimationState>
  >(Array(5).fill("awaiting"));

  useEffect(() => {
    if (currentRow === 0) {
      return;
    }
    setAnimatingIndexes(Array(5).fill("awaiting"));

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setAnimatingIndexes((prev) => {
          const newIndexes = deepCopy(prev);
          newIndexes[i] = "animating";
          return newIndexes;
        });
      }, i * 150);
      setTimeout(() => {
        setAnimatingIndexes((prev) => {
          const newIndexes = deepCopy(prev);
          newIndexes[i] = "done";
          return newIndexes;
        });
      }, ANIMATION_DURATION + i * 150);
    }
  }, [currentRow]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="h-20 font-medium text-xl">{notification}</div>
      <div className="flex flex-col gap-2">
        {letters.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {Array(5)
              .fill("")
              .map((_, colIndex) => (
                <motion.div
                  key={colIndex}
                  animate={
                    rowIndex === currentRow - 1 &&
                    animatingIndexes[colIndex] === "animating"
                      ? "isAnimating"
                      : rowIndex === currentRow - 1 &&
                        animatingIndexes[colIndex] === "awaiting"
                      ? "unsubmitted"
                      : getHighlightState(rowIndex, row.join(""), solution)[
                          colIndex
                        ]
                  }
                  variants={{
                    correct: {
                      backgroundColor: "#538d4e",
                      color: "#ffffff",
                      rotateX: 0,
                    },
                    present: {
                      backgroundColor: "#b59f3b",
                      color: "#ffffff",
                      rotateX: 0,
                    },
                    absent: {
                      backgroundColor: "#3a3a3c",
                      color: "#ffffff",
                      rotateX: 0,
                    },
                    unsubmitted: {
                      color: "#3a3a3c",
                      backgroundColor: "#ffffff",
                      rotateX: 0,
                    },
                    isAnimating: {
                      color: "#3a3a3c",
                      backgroundColor: "#ffffff",
                      rotateX: 90,
                    },
                  }}
                  transition={{
                    rotateX: {
                      duration: ANIMATION_DURATION / 1000,
                      ease: "easeInOut",
                    },
                    backgroundColor: { duration: 0.1, ease: "easeInOut" },
                    color: { duration: 0.1, ease: "easeInOut" },
                  }}
                  className={
                    "size-16 border border-gray-400 text-3xl font-semibold flex items-center justify-center " +
                    (rowIndex === currentRow && colIndex === currentCol
                      ? "ring-2 ring-blue-600 ring-offset-2"
                      : "")
                  }
                >
                  {row[colIndex] || ""}
                </motion.div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}
