import { NextButton } from "./button";

const FirstStep = ({ onNextStep }: { onNextStep: () => void }) => {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-10">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold ">Welcome to</h1>
        <h1 className="text-4xl font-bold primary-text">Slider Orbit</h1>
      </div>
      <NextButton onNextStep={onNextStep} />
    </div>
  );
};

export default FirstStep;
