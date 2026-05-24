export const isJunctionTriggered = (currentScore, targetScore) => {
  if (!targetScore || targetScore <= 0) return false;
  const percentage = (currentScore / targetScore) * 100;
  return percentage === 30 || percentage === 60;
};

export const validatePressurePump = (clickPosition) => {
  return clickPosition >= 45 && clickPosition <= 55;
};

export const parsePowerUpResponse = (response) => {
  if (response && response.solo === true) {
    return { isSolo: true, message: "Solo power-up activated fallback." };
  }
  return { isSolo: false, data: response };
};
