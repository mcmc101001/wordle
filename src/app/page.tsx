import Keyboard from "@/components/wordle/Keyboard";
import Wordle from "@/components/wordle/Wordle";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Wordle />
      <Keyboard />
    </div>
  );
}
