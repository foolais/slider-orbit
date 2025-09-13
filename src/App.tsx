import { useState } from "react";
import FirstStep from "./components/first-step";
import SecondStep from "./components/second-step";
import ThirdStep from "./components/third-step";

const App = () => {
  const [step, setStep] = useState(0);

  const onNextStep = () => {
    setStep((prev) => prev + 1);
  };

  const onPrevStep = () => {
    setStep((prev) => prev - 1);
  };

  return (
    <div className="max-w-screen w-full h-screen">
      {step === 0 && <FirstStep onNextStep={onNextStep} />}
      {step === 1 && (
        <SecondStep onPrevStep={onPrevStep} onNextStep={onNextStep} />
      )}
      {step === 2 && <ThirdStep />}
    </div>
  );
};

export default App;
