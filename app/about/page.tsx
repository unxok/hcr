import { DraggableButton } from "@/components/DraggableButton";

export default async function Page() {
  return (
    <div className="flex h-full w-full flex-col">
      <h2 className="py-3 text-4xl font-bold tracking-wide">About us</h2>
      <DraggableButton />
    </div>
  );
}
