import { NextButton, PrevButton } from "./button";
import GridItems from "./grid-items";

const SecondStep = ({
  onNextStep,
  onPrevStep,
}: {
  onNextStep: () => void;
  onPrevStep: () => void;
}) => {
  return (
    <div className="flex items-center justify-center h-full flex-col gap-14">
      <h1 className="text-3xl font-bold primary-text">Select Grid Items</h1>
      <GridItems />
      <div className="flex gap-20">
        <PrevButton onPrevStep={onPrevStep} />
        <NextButton onNextStep={onNextStep} />
      </div>
    </div>
  );
};

export default SecondStep;
