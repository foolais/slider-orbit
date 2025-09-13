export const NextButton = ({ onNextStep }: { onNextStep: () => void }) => {
  return (
    <button
      onClick={onNextStep}
      className="primary-btn primary-bg neu neu-active"
    >
      Next
    </button>
  );
};

export const PrevButton = ({ onPrevStep }: { onPrevStep: () => void }) => {
  return (
    <button
      onClick={onPrevStep}
      className="primary-btn primary-bg neu neu-active"
    >
      Prev
    </button>
  );
};
